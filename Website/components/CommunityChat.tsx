"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { safeCommunityImageUrl } from "../lib/chatUrl";
import MarketingOptIn from "./MarketingOptIn";
import { requestNewsOptIn } from "../lib/optin";
import { keyProblemText, resolvePublishableKey } from "../lib/publishableKey";
import { communityHistoryUrl, createHeartbeatMonitor, listenCommunityFeed, loadWithRetry, mergeMessages, type Reconnector } from "../lib/realtimeReconnect";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wfxpxwlynsphutjhhdje.supabase.co";
// TEOS key rotation P-5 (22 Oct 2026): the live feed uses the Supabase PUBLISHABLE key, taken from the build
// environment only (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; Next inlines it at build time). No key is kept in source.
// Without a valid key the chat still loads its history and can post (both go through the TEOS API, no key needed);
// only live updates are off, and the page says so. release-gate.mjs fails a Netlify build without the key.
const SB_KEY = resolvePublishableKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
// 24 Oct 2026 (open-tab incident): the socket's heartbeat acks feed the liveness watchdog in lib/realtimeReconnect.ts,
// so "live" means the socket answers, not just that the channel once said SUBSCRIBED.
const heartbeat = createHeartbeatMonitor();
const supabase = SB_KEY.ok
  ? createClient(SB_URL, SB_KEY.key, { realtime: { params: { eventsPerSecond: 5 }, heartbeatCallback: heartbeat.callback } })
  : null;
let keyProblemLogged = false;

// TEOS security fix M4 (2026-10-19): the community feed is now a PRIVATE, receive-only Realtime topic
// (`private_topic`, community:<channel id>). Anyone may listen with the public key; only the TEOS API
// can send, so nobody can inject fake messages any more. `topic` (the old public chat-<id>) is used
// only while TEOS still returns it, as a fallback during the rollout.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE = 10 * 1024 * 1024;
/**
 * Only this project's public chat images are ever rendered (defence in depth; TEOS builds every
 * attachment URL, but a forged message on the old public topic could carry any URL). lib/chatUrl.ts.
 */
const safeImage = (u: unknown) => safeCommunityImageUrl(u, SB_URL);

type Msg = {
  id: string; author_name: string; author_role: string; body: string; created_at: string;
  attachment_url?: string | null; attachment_type?: string | null; attachment_name?: string | null;
};
type Pending = { path: string; url: string; type: string; name: string; mime: string };

export default function CommunityChat({ slug, artistName, brandColor }: { slug: string; artistName: string; brandColor: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  // Joining the chat is NOT consent to marketing email (TEOS privacy phase 1): separate, unticked box.
  const [optIn, setOptIn] = useState(false);
  // connecting -> live; after a drop (e.g. the 24 h cap on public Realtime connections) "reconnecting" until the
  // channel is back; "off" when the build has no valid publishable key.
  const [feed, setFeed] = useState<"connecting" | "live" | "reconnecting" | "off">(supabase ? "connecting" : "off");
  const [pending, setPending] = useState<Pending | null>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem("tm_name") || ""; const e = localStorage.getItem("tm_email") || "";
      setName(n); setEmail(e); if (e.includes("@")) setJoined(true);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let alive = true;
    let reconnector: Reconnector | null = null;
    // Latest HISTORY_LIMIT (100) messages, on the first load and on every re-subscribe back-fill.
    const historyUrl = communityHistoryUrl(TEOS_API, slug);
    // A 5xx / 429 is a failure worth retrying (F-5); any other status is parsed as before.
    const loadHistory = () => fetch(historyUrl).then((r) => {
      if (r.status >= 500 || r.status === 429) throw new Error("chat history unavailable (" + r.status + ")");
      return r.json();
    });
    // Every message goes through mergeMessages: no duplicates (by id), oldest first, bounded.
    const add = (list: unknown[]) => { if (alive) setMessages((m) => mergeMessages(m, list)); };
    // Another artist (slug change in the same page instance): never merge two artists' feeds.
    setMessages([]);
    setFeed(supabase ? "connecting" : "off");
    // F-5: the first load opens the live channel, so one TEOS API blip must not leave the page on "connecting":
    // retry once after a 1.25-2.5 s backoff; if it still fails, say live updates are off (reload to try again).
    loadWithRetry(loadHistory, { retries: 1, alive: () => alive })
      .then((data) => {
        if (!alive) return;
        add(Array.isArray(data?.messages) ? data.messages : []);
        const isPrivate = !!data?.private_topic;
        const topic = isPrivate ? String(data.private_topic) : data?.topic ? String(data.topic) : "";  // topic: TEOS before M4 only
        if (!topic) return;
        if (!supabase) {
          if (!keyProblemLogged && !SB_KEY.ok) {
            keyProblemLogged = true;
            console.error("[community chat] live updates are off: " + keyProblemText(SB_KEY.reason));
          }
          return;
        }
        // L-4 (P-5): on CLOSED / CHANNEL_ERROR / TIMED_OUT the channel is removed and, after a jittered backoff,
        // created and subscribed again (lib/realtimeReconnect.ts). Public Realtime connections on the publishable
        // key end after at most 24 h; the first private join on an idle project can also fail once (M4).
        // 24 Oct 2026: also when the socket is found dead without any channel event (watchdog, heartbeat timeout),
        // and on every page-lifecycle return (back/forward cache restore, resume from a sleeping tab, online, a long
        // hide): full re-subscribe on a fresh socket, "reconnecting" until a fresh SUBSCRIBED.
        reconnector = listenCommunityFeed(supabase, topic, isPrivate, {
          onMessage: (payload) => add([payload]),
          onLive: (v) => { if (alive) setFeed(v ? "live" : "reconnecting"); },
          // Back on the channel after a drop: fetch the latest history once to fill in what was broadcast meanwhile.
          onResubscribed: () => {
            loadHistory().then((d) => { if (Array.isArray(d?.messages)) add(d.messages); }).catch(() => {});
          },
          heartbeat,
          lifecycle: typeof window !== "undefined" ? { win: window, doc: document } : null,
        });
      }).catch(() => { if (alive) setFeed("off"); });
    return () => { alive = false; if (reconnector) reconnector.stop(); };
  }, [slug]);

  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages]);

  function join(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    try { localStorage.setItem("tm_name", name); localStorage.setItem("tm_email", email); } catch { /* ignore */ }
    setJoined(true);
    if (optIn) void requestNewsOptIn({ slug, email, name, form: "chat" });
  }

  async function upload(file: File) {
    if (!IMAGE_TYPES.includes(file.type)) { alert("Only JPEG, PNG, WebP or GIF images can be shared here."); return; }
    if (file.size > MAX_IMAGE) { alert("Images can be at most 10 MB."); return; }
    setUploading(true);
    try {
      const sign = await fetch(TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/chat/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mime: file.type, size: file.size, email }),
      });
      const s = await sign.json();
      if (!sign.ok || !s?.put_url) throw new Error(s?.message || "upload failed");
      const put = await fetch(s.put_url, { method: "PUT", headers: { "Content-Type": file.type, "x-upsert": "true" }, body: file });
      if (!put.ok) throw new Error("upload failed");
      setPending({ path: String(s.attachment_path || ""), url: s.public_url, type: "image", name: file.name, mime: file.type });
    } catch (e: any) { alert(e.message || "Upload failed"); }
    setUploading(false);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body && !pending) return;
    setText(""); const att = pending; setPending(null);
    try {
      const res = await fetch(TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        // attachment_path is what TEOS reads (M4); attachment_url is kept so the post also works
        // against a TEOS API deployed before M4.
        body: JSON.stringify({ email, name, body, attachment_path: att?.path || undefined, attachment_url: att?.url, attachment_type: att?.type, attachment_name: att?.name, attachment_mime: att?.mime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Your message was not sent.");
      if (data?.message) setMessages((m) => mergeMessages(m, [data.message]));
    } catch (err: any) {
      setText(body); setPending(att);
      alert(err?.message || "Your message was not sent.");
    }
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="section-label" style={{ color: brandColor }}>Community</span>
        <div className="flex items-center gap-2 mt-2 mb-6">
          <h2 className="section-heading">{artistName}&apos;s community</h2>
          <span className="flex items-center gap-1.5 font-body text-[11px] text-white/40" aria-live="polite">
            <span className="w-2 h-2 rounded-full" style={{ background: feed === "live" ? "#3FB950" : feed === "reconnecting" ? "#D29922" : "#6B6B76" }} />
            {feed === "off" ? "live updates off" : feed}
          </span>
        </div>
        {feed === "off" ? (
          <p className="font-body text-[12px] text-white/45 -mt-4 mb-4">Live updates are unavailable right now. New messages appear when you reload the page.</p>
        ) : null}

        <div
          className="rounded-2xl border bg-white/[0.02] overflow-hidden"
          style={{ borderColor: drag ? brandColor : "rgba(255,255,255,0.07)" }}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (joined && e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]); }}
        >
          <div ref={scrollRef} className="h-[380px] overflow-y-auto p-4 flex flex-col gap-3">
            {!messages.length ? (
              <div className="text-white/35 font-body text-sm text-center my-auto">Be the first to say something 👋</div>
            ) : messages.map((m) => (
              <div key={m.id} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-body text-[12.5px] font-semibold" style={{ color: m.author_role === "staff" ? brandColor : "#C7C7D0" }}>{m.author_name}{m.author_role === "staff" ? " ★" : ""}</span>
                  <span className="font-body text-[10px] text-white/30">{new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                {m.body ? <div className="font-body text-[14px] text-white/85 whitespace-pre-wrap break-words">{m.body}</div> : null}
                {safeImage(m.attachment_url) && m.attachment_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={safeImage(m.attachment_url) as string} alt={m.attachment_name || "image"} className="mt-1.5 rounded-lg max-h-64 w-auto border border-white/10" loading="lazy" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.07] p-3">
            {!joined ? (
              <form onSubmit={join} method="post">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label="Name" className="flex-1 bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@email.com" aria-label="Email" className="flex-1 bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                  <button type="submit" className="rounded-lg px-5 py-2 font-body text-[13px] font-semibold text-ink-950" style={{ background: brandColor }}>Join chat</button>
                </div>
                <div className="mt-2">
                  <MarketingOptIn artist={artistName} checked={optIn} onChange={setOptIn} compact />
                </div>
              </form>
            ) : (
              <>
                {pending ? (
                  <div className="flex items-center gap-2 mb-2 text-white/70 font-body text-[12px]">
                    🖼️ {pending.name}<button onClick={() => setPending(null)} className="text-white/40 hover:text-white/70">✕</button>
                  </div>
                ) : null}
                <form onSubmit={send} method="post" className="flex gap-2 items-center">
                  <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(",")} hidden onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0]); e.target.value = ""; }} />
                  <button type="button" onClick={() => fileRef.current?.click()} title="Attach image" className="text-white/50 hover:text-white/90 text-lg px-1">{uploading ? "⏳" : "📎"}</button>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder={"Message as " + (name || "you") + "…"} aria-label="Message" className="flex-1 bg-ink-950 border border-white/10 rounded-lg px-3 py-2.5 text-white font-body text-[14px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                  <button type="submit" disabled={!text.trim() && !pending} className="rounded-lg px-5 font-body text-[13px] font-semibold text-ink-950 disabled:opacity-50" style={{ background: brandColor }}>Send</button>
                </form>
                <div className="text-white/25 font-body text-[10.5px] mt-1.5">Drag &amp; drop an image, or tap 📎</div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
