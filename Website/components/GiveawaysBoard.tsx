"use client";

import { useState } from "react";
import type { PublicGiveaway } from "../lib/teos";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

const TIER_LABEL: Record<string, string> = {
  free: "", bronze: "Bronze", gold: "Gold", platinum: "Platinum", diamond: "Diamond",
};

export default function GiveawaysBoard({
  slug,
  brandColor,
  items,
}: {
  slug: string;
  brandColor: string;
  items: PublicGiveaway[];
}) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label" style={{ color: brandColor }}>
          Giveaways
        </span>
        <h2 className="section-heading mt-2 mb-8">Win with {" "}the crew</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((g) => (
            <GiveawayCard key={g.id} slug={slug} brandColor={brandColor} g={g} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GiveawayCard({ slug, brandColor, g }: { slug: string; brandColor: string; g: PublicGiveaway }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function enter(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch(TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/giveaway/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giveaway_id: g.id, email, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsg(data?.message || "Could not enter."); setStatus("error"); return; }
      setStatus("done");
    } catch {
      setMsg("Something went wrong.");
      setStatus("error");
    }
  }

  const gate = TIER_LABEL[g.minTier] || "";

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] flex flex-col">
      <div
        className="w-full aspect-[16/9] bg-center bg-cover"
        style={{ backgroundColor: "#15151c", backgroundImage: g.image ? `url(${g.image})` : undefined }}
      />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-white font-body text-[15px] font-bold">{g.title}</div>
          {gate ? (
            <span className="flex-shrink-0 font-body text-[10px] font-semibold text-white/60 border border-white/15 rounded-full px-2 py-0.5">
              {gate}+
            </span>
          ) : null}
        </div>
        {g.prize ? <div className="text-white/70 font-body text-[13px] mt-1">🎁 {g.prize}</div> : null}
        {g.description ? <div className="text-white/45 font-body text-xs mt-2">{g.description}</div> : null}

        <div className="mt-4 mt-auto pt-4">
          {status === "done" ? (
            <div
              className="font-body text-[13px] text-white/85 text-center py-2.5 rounded-lg border"
              style={{ borderColor: brandColor + "55", background: brandColor + "14" }}
            >
              You&apos;re entered. Good luck! 🍀
            </div>
          ) : !open ? (
            <button
              onClick={() => setOpen(true)}
              className="w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 transition-transform hover:scale-[1.02]"
              style={{ background: brandColor }}
            >
              Enter giveaway
            </button>
          ) : (
            <form onSubmit={enter} className="flex flex-col gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" aria-label="Your name" className="w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@email.com" aria-label="Your email" className="w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
              <button type="submit" disabled={status === "loading"} className="w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 disabled:opacity-60" style={{ background: brandColor }}>
                {status === "loading" ? "Entering…" : "Enter"}
              </button>
              {status === "error" ? <span className="font-body text-[11px]" style={{ color: "#f87171" }}>{msg}</span> : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
