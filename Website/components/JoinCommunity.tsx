"use client";

import { useState } from "react";
import MarketingOptIn from "./MarketingOptIn";
import { TEOS_API, optInBody } from "../lib/optin";

// Joins the artist's fan community. Email news is a separate, UNTICKED choice (TEOS privacy
// phase 1): ticked, TEOS emails a confirmation link and only the click records consent. The
// request always says marketing_opt_in explicitly.
export default function JoinCommunity({
  slug,
  artistName,
  brandColor,
}: {
  slug: string;
  artistName: string;
  brandColor: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [sentOptIn, setSentOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch(TEOS_API + "/public/fan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optInBody({ slug, email, name, form: "join", optIn })),
      });
      if (!res.ok) throw new Error("failed");
      setSentOptIn(optIn);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "flex-1 min-w-0 bg-ink-950 border border-white/10 rounded-lg px-4 py-3 text-white font-body text-sm placeholder:text-white/30 focus:outline-none focus:border-white/25";

  return (
    <section className="py-16 px-6 bg-ink-900 border-t border-white/[0.04]">
      <div className="max-w-2xl mx-auto text-center">
        <span className="section-label" style={{ color: brandColor }}>
          Community
        </span>
        <h2 className="section-heading mt-2 mb-3">Join {artistName}&apos;s inner circle</h2>
        <p className="font-body text-white/45 mb-8">
          Join the fan community. Want new releases, drops and behind-the-scenes news by email too? Tick the box.
        </p>

        {status === "done" ? (
          <div
            className="font-body text-base text-white/80 inline-block px-6 py-4 rounded-xl border"
            style={{ borderColor: brandColor + "55", background: brandColor + "14" }}
          >
            You&apos;re in. Welcome to the community. 🎶
            {sentOptIn ? (
              <span className="block text-sm text-white/60 mt-2">
                Check your inbox and click the link to confirm you want news by email.
              </span>
            ) : null}
          </div>
        ) : (
          <form onSubmit={submit} method="post" className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className={inputClass}
                aria-label="Your name"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@email.com"
                className={inputClass}
                aria-label="Your email"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg px-7 py-3 font-body text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03] disabled:opacity-60"
                style={{ background: brandColor }}
              >
                {status === "loading" ? "Joining…" : "Join"}
              </button>
            </div>
            <div className="mt-3">
              <MarketingOptIn artist={artistName} checked={optIn} onChange={setOptIn} />
            </div>
          </form>
        )}

        {status === "error" ? (
          <div className="font-body text-sm mt-3" style={{ color: "#f87171" }}>
            Something went wrong. Please try again.
          </div>
        ) : null}
      </div>
    </section>
  );
}
