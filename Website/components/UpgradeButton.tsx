"use client";

import { useEffect, useState } from "react";
import MarketingOptIn from "./MarketingOptIn";
import { requestNewsOptIn } from "../lib/optin";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

// Renders a subscribe CTA on a tier card. Hidden until a payment provider is
// live (config check), so it appears automatically once Stripe keys are set.
// A paid membership is NOT consent to marketing email (TEOS privacy phase 1): a separate, unticked
// box asks; ticked, TEOS sends a confirmation email before the redirect to payment.
export default function UpgradeButton({
  slug,
  artistName = "this artist",
  tier,
  brandColor,
  currency = "USD",
}: {
  slug: string;
  artistName?: string;
  tier: string;
  brandColor: string;
  currency?: string;
}) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    fetch(TEOS_API + "/public/payments/config")
      .then((r) => r.json())
      .then((c) => setEnabled(!!(c?.stripe || c?.paystack)))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch(TEOS_API + "/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind: "subscription", tier, email, currency, marketing_opt_in: false }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error("failed");
      if (optIn) await requestNewsOptIn({ slug, email, form: "membership" });
      window.location.href = data.url; // Stripe/Paystack hosted checkout
    } catch {
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 transition-transform hover:scale-[1.02]"
        style={{ background: brandColor }}
      >
        Subscribe
      </button>
    );
  }

  return (
    <form onSubmit={go} method="post" className="mt-3 flex flex-col gap-2">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder="you@email.com"
        aria-label="Your email"
        className="w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25"
      />
      <MarketingOptIn artist={artistName} checked={optIn} onChange={setOptIn} compact />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 disabled:opacity-60"
        style={{ background: brandColor }}
      >
        {status === "loading" ? "Redirecting…" : "Continue to payment"}
      </button>
      {status === "error" ? (
        <span className="font-body text-[11px]" style={{ color: "#f87171" }}>
          Couldn&apos;t start checkout. Try again.
        </span>
      ) : null}
    </form>
  );
}
