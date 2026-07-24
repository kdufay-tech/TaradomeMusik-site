"use client";

import { useEffect, useState } from "react";
import type { PublicEvent } from "../lib/teos";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

const TIER_LABEL: Record<string, string> = {
  free: "", bronze: "Bronze", gold: "Gold", platinum: "Platinum", diamond: "Diamond",
};

export default function EventsBoard({
  slug,
  brandColor,
  items,
}: {
  slug: string;
  brandColor: string;
  items: PublicEvent[];
}) {
  const [payEnabled, setPayEnabled] = useState(false);
  useEffect(() => {
    fetch(TEOS_API + "/public/payments/config")
      .then((r) => r.json())
      .then((c) => setPayEnabled(!!(c?.stripe || c?.paystack)))
      .catch(() => setPayEnabled(false));
  }, []);

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label" style={{ color: brandColor }}>
          Events
        </span>
        <h2 className="section-heading mt-2 mb-8">Live &amp; in the room</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((e) => (
            <EventCard key={e.id} slug={slug} brandColor={brandColor} e={e} payEnabled={payEnabled} />
          ))}
        </div>
      </div>
    </section>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return "Date TBA";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function EventCard({ slug, brandColor, e, payEnabled }: { slug: string; brandColor: string; e: PublicEvent; payEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const paid = e.price > 0;
  const soldOut = e.spotsLeft === 0;

  async function register(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      if (paid) {
        const res = await fetch(TEOS_API + "/public/checkout", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, kind: "event", event_id: e.id, email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.url) { setMsg(data?.message || "Could not start checkout."); setStatus("error"); return; }
        window.location.href = data.url;
      } else {
        const res = await fetch(TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/event/enroll", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_id: e.id, email, name }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { setMsg(data?.message || "Could not register."); setStatus("error"); return; }
        setStatus("done");
      }
    } catch {
      setMsg("Something went wrong.");
      setStatus("error");
    }
  }

  const gate = TIER_LABEL[e.minTier] || "";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] flex flex-col">
      <div className="w-full aspect-[16/9] bg-center bg-cover" style={{ backgroundColor: "#15151c", backgroundImage: e.image ? `url(${e.image})` : undefined }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-body text-[10px] uppercase tracking-wide font-bold" style={{ color: brandColor }}>{e.eventType.replace("_", " ")}</span>
          {gate ? <span className="font-body text-[10px] font-semibold text-white/55 border border-white/15 rounded-full px-2 py-0.5">{gate}+</span> : null}
        </div>
        <div className="text-white font-body text-[15px] font-bold">{e.title}</div>
        <div className="text-white/50 font-body text-xs mt-1">{fmtDate(e.startsAt)}</div>
        <div className="text-white/45 font-body text-xs">{e.isVirtual ? "🌐 Virtual" : "📍 " + (e.location || "In person")}</div>
        {e.description ? <div className="text-white/45 font-body text-xs mt-2 line-clamp-2">{e.description}</div> : null}
        <div className="flex items-center justify-between mt-3">
          <span className="text-white font-body text-sm font-bold">{e.priceLabel}</span>
          {e.spotsLeft != null ? <span className="text-white/45 font-body text-[11px]">{e.spotsLeft} spot{e.spotsLeft === 1 ? "" : "s"} left</span> : null}
        </div>

        <div className="mt-4 mt-auto pt-3">
          {status === "done" ? (
            <div className="font-body text-[13px] text-white/85 text-center py-2.5 rounded-lg border" style={{ borderColor: brandColor + "55", background: brandColor + "14" }}>
              You&apos;re registered. See you there! 🎤
            </div>
          ) : soldOut ? (
            <div className="text-white/40 font-body text-[12px] text-center py-2">Sold out</div>
          ) : paid && !payEnabled ? (
            <div className="text-white/40 font-body text-[11px] text-center py-2">Registration opening soon</div>
          ) : !open ? (
            <button onClick={() => setOpen(true)} className="w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 transition-transform hover:scale-[1.02]" style={{ background: brandColor }}>
              {paid ? "Get a ticket" : "Register free"}
            </button>
          ) : (
            <form onSubmit={register} className="flex flex-col gap-2">
              {!paid ? <input value={name} onChange={(ev) => setName(ev.target.value)} placeholder="Name (optional)" aria-label="Your name" className="w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" /> : null}
              <input value={email} onChange={(ev) => setEmail(ev.target.value)} type="email" required placeholder="you@email.com" aria-label="Your email" className="w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
              <button type="submit" disabled={status === "loading"} className="w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 disabled:opacity-60" style={{ background: brandColor }}>
                {status === "loading" ? (paid ? "Redirecting…" : "Registering…") : (paid ? "Continue to payment" : "Confirm")}
              </button>
              {status === "error" ? <span className="font-body text-[11px]" style={{ color: "#f87171" }}>{msg}</span> : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
