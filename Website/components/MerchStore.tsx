"use client";

import { useEffect, useState } from "react";
import type { PublicMerchItem } from "../lib/teos";

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

export default function MerchStore({
  slug,
  brandColor,
  items,
}: {
  slug: string;
  brandColor: string;
  items: PublicMerchItem[];
}) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    fetch(TEOS_API + "/public/payments/config")
      .then((r) => r.json())
      .then((c) => setEnabled(!!(c?.stripe || c?.paystack)))
      .catch(() => setEnabled(false));
  }, []);

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label" style={{ color: brandColor }}>
          Merch
        </span>
        <h2 className="section-heading mt-2 mb-8">Shop</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it) => (
            <ProductCard key={it.id} slug={slug} brandColor={brandColor} item={it} enabled={enabled} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  slug,
  brandColor,
  item,
  enabled,
}: {
  slug: string;
  brandColor: string;
  item: PublicMerchItem;
  enabled: boolean;
}) {
  const [variant, setVariant] = useState(item.variants[0] || "");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch(TEOS_API + "/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind: "merch", product_id: item.id, variant, email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error("failed");
      window.location.href = data.url;
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] flex flex-col">
      <div
        className="w-full aspect-square bg-center bg-cover"
        style={{ backgroundColor: "#15151c", backgroundImage: item.image ? `url(${item.image})` : undefined }}
      />
      <div className="p-4 flex flex-col flex-1">
        <div className="text-white font-body text-sm font-semibold">{item.name}</div>
        {item.description ? (
          <div className="text-white/45 font-body text-xs mt-1 line-clamp-2">{item.description}</div>
        ) : null}
        <div className="text-white font-body text-sm font-bold mt-2">{item.priceLabel}</div>

        {item.variants.length ? (
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="mt-3 w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] focus:outline-none focus:border-white/25"
          >
            {item.variants.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ) : null}

        <div className="mt-3 mt-auto pt-3">
          {!enabled ? (
            <div className="text-white/40 font-body text-[11px] text-center py-2">Store opening soon</div>
          ) : !open ? (
            <button
              onClick={() => setOpen(true)}
              className="w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 transition-transform hover:scale-[1.02]"
              style={{ background: brandColor }}
            >
              Buy
            </button>
          ) : (
            <form onSubmit={buy} className="flex flex-col gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@email.com"
                aria-label="Your email"
                className="w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2 text-white font-body text-[13px] placeholder:text-white/30 focus:outline-none focus:border-white/25"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg py-2.5 font-body text-[13px] font-semibold text-ink-950 disabled:opacity-60"
                style={{ background: brandColor }}
              >
                {status === "loading" ? "Redirecting…" : "Checkout"}
              </button>
              {status === "error" ? (
                <span className="font-body text-[11px]" style={{ color: "#f87171" }}>
                  Couldn&apos;t start checkout. Try again.
                </span>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
