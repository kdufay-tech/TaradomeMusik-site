"use client";

import { useState } from "react";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  bronze: "Bronze",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};

type Item = {
  id: string;
  title: string;
  description: string | null;
  content_type: string | null;
  min_tier: string;
  unlocked: boolean;
  url: string | null;
};

export default function UnlockContent({
  slug,
  brandColor,
}: {
  slug: string;
  brandColor: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [tier, setTier] = useState("free");
  const [items, setItems] = useState<Item[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch(
        TEOS_API + "/public/artist/" + encodeURIComponent(slug) + "/unlock",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setTier(String(data.tier || "free"));
      setItems(Array.isArray(data.items) ? data.items : []);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const unlockedCount = items.filter((i) => i.unlocked).length;

  return (
    <section className="py-16 px-6 border-t border-white/[0.04]">
      <div className="max-w-3xl mx-auto">
        <span className="section-label" style={{ color: brandColor }}>
          Members&apos; Vault
        </span>
        <h2 className="section-heading mt-2 mb-3">Exclusive drops</h2>
        <p className="font-body text-white/45 mb-6 text-sm">
          Enter the email you joined with to unlock the content your tier gives you.
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-lg mb-8">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@email.com"
            aria-label="Your email"
            className="flex-1 min-w-0 bg-ink-950 border border-white/10 rounded-lg px-4 py-3 text-white font-body text-sm placeholder:text-white/30 focus:outline-none focus:border-white/25"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg px-7 py-3 font-body text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] disabled:opacity-60"
            style={{ background: brandColor }}
          >
            {status === "loading" ? "Checking…" : "Unlock"}
          </button>
        </form>

        {status === "error" ? (
          <div className="font-body text-sm mb-4" style={{ color: "#f87171" }}>
            Something went wrong. Please try again.
          </div>
        ) : null}

        {status === "done" ? (
          <>
            <div className="font-body text-xs text-white/50 mb-4">
              Your tier: <span className="font-semibold text-white/80">{TIER_LABEL[tier] || "Free"}</span>
              {" · "}
              {unlockedCount} of {items.length} unlocked
            </div>
            {!items.length ? (
              <div className="font-body text-sm text-white/45">
                No exclusive content posted yet — check back soon.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 rounded-xl border px-4 py-3"
                    style={{
                      borderColor: it.unlocked ? brandColor + "44" : "rgba(255,255,255,0.08)",
                      background: it.unlocked ? brandColor + "0D" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span className="text-lg" style={{ opacity: it.unlocked ? 1 : 0.4 }}>
                      {it.unlocked ? "🔓" : "🔒"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-body text-white/90 text-sm font-semibold">{it.title}</div>
                      {it.description ? (
                        <div className="font-body text-white/45 text-xs">{it.description}</div>
                      ) : null}
                    </div>
                    {it.unlocked && it.url ? (
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 rounded-lg px-4 py-2 font-body text-xs font-semibold text-ink-950"
                        style={{ background: brandColor }}
                      >
                        Open
                      </a>
                    ) : (
                      <span className="flex-shrink-0 font-body text-[11px] font-semibold text-white/50 border border-white/15 rounded-full px-3 py-1">
                        {(TIER_LABEL[it.min_tier] || "Bronze")}+ only
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}
