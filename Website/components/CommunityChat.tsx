"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wfxpxwlynsphutjhhdje.supabase.co";
const SB_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmeHB4d2x5bnNwaHV0amhoZGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODc0MDQsImV4cCI6MjA5Njg2MzQwNH0.6IKDraiJApONmSfvRF7htoQuJ6ohi0BWz07IYy-UhMY";

const supabase = createClient(SB_URL, SB_ANON, { realtime: { params: { eventsPerSecond: 5 } } });

type Msg = {
  id: string; author_name: string; author_role: string; body: string; created_at: string;
  attachment_url?: string | null; attachment_type?: string | null; attachment_name?: string | null;
};
type Pending = { url: string; type: string; name: string; mime: string };

export default function CommunityChat({ slug, artistName, brandColor }: { slug: string; artistName: string; brandColor: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [live, setLive] = useState(false);
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
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let alive = true;
    fetch(TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/chat")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        if (!data?.topic) return;
        channel = supabase.channel(data.topic);
        channel.on("broadcast", { event: "message" }, ({ payload }: any) => {
          setMessages((m) => (m.some((x) => x.id === payload.id) ? m : [...m, payload]));
        }).subscribe((s: string) => { if (s === "SUBSCRIBED") setLive(true); });
      }).catch(() => {});
    return () => { alive = false; if (channel) supabase.removeChannel(channel); };
  }, [slug]);

  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages]);

  function join(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    try { localStorage.setItem("tm_name", name); localStorage.setItem("tm_email", email); } catch { /* ignore */ }
    setJoined(true);
  }

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) { alert("Only images can be shared here."); return; }
    setUploading(true);
    try {
      const sign = await fetch(TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/chat/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mime: file.type, size: file.size }),
      });
      const s = await sign.json();
      if (!sign.ok || !s?.put_url) throw new Error(s?.message || "upload failed");
      const put = await fetch(s.put_url, { method: "PUT", headers: { "Content-Type": file.type, "x-upsert": "true" }, body: file });
      if (!put.ok) throw new Error("upload failed");
      setPending({ url: s.public_url, type: "image", name: file.name, mime: file.type });
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
        body: JSON.stringify({ email, name, body, attachment_url: att?.url, attachment_type: att?.type, attachment_name: att?.name, attachment_mime: att?.mime }),
      });
      const data = await res.json();
      if (data?.message) setMessages((m) => (m.some((x) => x.id === data.message.id) ? m : [...m, data.message]));
    } catch { /* ignore */ }
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="section-label" style={{ color: brandColor }}>Community</span>
        <div className="flex items-center gap-2 mt-2 mb-6">
          <h2 className="section-heading">{artistName}&apos;s community</h2>
          <span className="flex items-center gap-1.5 font-body text-[11px] text-white/40">
            <span className="w-2 h-2 rounded-full" style={{ background: live ? "#3FB950" : "#6B6B76" }} />{live ? "live" : "connecting"}
          </span>
        </div>

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
                {m.attachment_url && m.attachment_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.attachment_url} alt={m.attachment_name || "image"} className="mt-1.5 rounded-lg max-h-64 w-auto border border-white/10" loading="lazy" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.07] p-3">
            {!joined ? (
              <form onSubmit={join} className="flex flex-col sm:flex-row gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" aria-label="Name" className="flex-1 bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@email.com" aria-label="Email" className="flex-1 bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                <button type="submit" className="rounded-lg px-5 py-2 font-body text-[13px] font-semibold text-ink-950" style={{ background: brandColor }}>Join chat</button>
              </form>
            ) : (
              <>
                {pending ? (
                  <div className="flex items-center gap-2 mb-2 text-white/70 font-body text-[12px]">
                    🖼️ {pending.name}<button onClick={() => setPending(null)} className="text-white/40 hover:text-white/70">✕</button>
                  </div>
                ) : null}
                <form onSubmit={send} className="flex gap-2 items-center">
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0]); e.target.value = ""; }} />
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
