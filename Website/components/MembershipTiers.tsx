"use client";

import { useEffect, useState } from "react";
import type { PublicTier } from "../lib/teos";
import UpgradeButton from "./UpgradeButton";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

export default function MembershipTiers({
  slug,
  brandColor,
  tiers,
}: {
  slug: string;
  brandColor: string;
  tiers: PublicTier[];
}) {
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [paystackLive, setPaystackLive] = useState(false);
  // Only offer the ₦ option once the Naira rail (Paystack) is actually live.
  useEffect(() => {
    fetch(TEOS_API + "/public/payments/config")
      .then((r) => r.json())
      .then((c) => setPaystackLive(!!c?.paystack))
      .catch(() => setPaystackLive(false));
  }, []);
  const hasNGN = paystackLive && tiers.some((t) => t.priceNGN);
  const priceOf = (t: PublicTier) => (currency === "NGN" && hasNGN ? t.priceNGN : t.price);

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="section-label" style={{ color: brandColor }}>Membership</span>
            <h2 className="section-heading mt-2 mb-3">Join the inner circle</h2>
          </div>
          {hasNGN ? (
            <div className="inline-flex rounded-full overflow-hidden border border-white/10">
              {(["USD", "NGN"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className="px-4 py-2 font-body text-[13px] font-bold"
                  style={{ background: currency === c ? brandColor : "transparent", color: currency === c ? "#0A0A0A" : "rgba(255,255,255,0.6)" }}
                >
                  {c === "USD" ? "$ USD" : "₦ NGN"}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <p className="text-white/50 text-sm mb-8 max-w-2xl">
          Each tier includes everything from the tiers below it. Become a fan to start at Bronze, then climb.
          {hasNGN ? " Nigerian fans can pay in Naira." : ""}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t) => (
            <div key={t.key} className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] flex flex-col">
              <div className="px-5 py-4" style={{ borderTop: `3px solid ${t.color}`, background: `${t.color}14` }}>
                <div className="text-white font-bold text-base">{t.short}</div>
                <div className="text-white/50 text-xs">{t.label}</div>
                {priceOf(t) ? <div className="text-white font-body text-sm font-semibold mt-1.5">{priceOf(t)}</div> : null}
              </div>
              <ul className="px-5 pt-4 pb-2 flex flex-col gap-3 flex-1">
                {t.perks.map((p, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full text-white text-[10px] leading-4 text-center" style={{ background: t.color }}>✓</span>
                    <div className="min-w-0">
                      <div className="text-white/90 text-[13px] font-semibold">{p.title}</div>
                      {p.description ? <div className="text-white/45 text-[11.5px] leading-snug">{p.description}</div> : null}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-5 pb-4">
                <UpgradeButton slug={slug} tier={t.key} brandColor={brandColor} currency={currency} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
