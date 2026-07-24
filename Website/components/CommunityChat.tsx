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

type Msg = { id: string; author_name: string; author_role: string; body: string; created_at: string };

export default function CommunityChat({
  slug,
  artistName,
  brandColor,
}: {
  slug: string;
  artistName: string;
  brandColor: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [live, setLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem("tm_name") || "";
      const e = localStorage.getItem("tm_email") || "";
      setName(n); setEmail(e);
      if (e.includes("@")) setJoined(true);
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
        const topic = data?.topic;
        if (!topic) return;
        channel = supabase.channel(topic);
        channel
          .on("broadcast", { event: "message" }, ({ payload }: any) => {
            setMessages((m) => (m.some((x) => x.id === payload.id) ? m : [...m, payload]));
          })
          .subscribe((status: string) => { if (status === "SUBSCRIBED") setLive(true); });
      })
      .catch(() => {});
    return () => { alive = false; if (channel) supabase.removeChannel(channel); };
  }, [slug]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function saveIdentity(n: string, e: string) {
    try { localStorage.setItem("tm_name", n); localStorage.setItem("tm_email", e); } catch { /* ignore */ }
  }

  function join(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    saveIdentity(name, email);
    setJoined(true);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      const res = await fetch(TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, body }),
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
            <span className="w-2 h-2 rounded-full" style={{ background: live ? "#3FB950" : "#6B6B76" }} />
            {live ? "live" : "connecting"}
          </span>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div ref={scrollRef} className="h-[380px] overflow-y-auto p-4 flex flex-col gap-3">
            {!messages.length ? (
              <div className="text-white/35 font-body text-sm text-center my-auto">Be the first to say something 👋</div>
            ) : messages.map((m) => (
              <div key={m.id} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-body text-[12.5px] font-semibold" style={{ color: m.author_role === "staff" ? brandColor : "#C7C7D0" }}>
                    {m.author_name}{m.author_role === "staff" ? " ★" : ""}
                  </span>
                  <span className="font-body text-[10px] text-white/30">{new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div className="font-body text-[14px] text-white/85 whitespace-pre-wrap break-words">{m.body}</div>
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
              <form onSubmit={send} className="flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder={"Message as " + (name || "you") + "…"} aria-label="Message" className="flex-1 bg-ink-950 border border-white/10 rounded-lg px-3 py-2.5 text-white font-body text-[14px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
                <button type="submit" disabled={!text.trim()} className="rounded-lg px-5 font-body text-[13px] font-semibold text-ink-950 disabled:opacity-50" style={{ background: brandColor }}>Send</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
