"use client";

import { useState } from "react";
import MarketingOptIn from "./MarketingOptIn";
import { TEOS_API, optInBody, type OptInForm } from "../lib/optin";

/* Email-news sign-up (home "Join the Fan List", an artist's "Notify me"). These forms used to POST
 * to a CRM route that does not exist on this static site (404), so every sign-up was lost.
 * They now post to TEOS /public/fan. Their only purpose is email news, so the (unticked) opt-in box
 * is required to submit; TEOS then emails a confirmation link and only the click subscribes them.
 * TEOS keeps fans per artist, so the visitor picks an artist when there is more than one. */
export default function FanListForm({
  artists,
  form,
  button,
  accentClass = "bg-ember-400 hover:bg-ember-500",
}: {
  artists: { slug: string; name: string }[];
  form: OptInForm;
  button: string;
  accentClass?: string;
}) {
  const [slug, setSlug] = useState(artists.length === 1 ? artists[0].slug : "");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const artist = artists.find((a) => a.slug === slug);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !email.includes("@") || !optIn) return;
    setStatus("loading");
    try {
      const res = await fetch(TEOS_API + "/public/fan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optInBody({ slug, email, form, optIn })),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="font-body text-sm text-white/80 max-w-md mx-auto px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03]">
        Almost there. Check your inbox and click the link to confirm you want news from {artist?.name || "us"}.
      </div>
    );
  }

  const field =
    "bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-body text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors";
  return (
    <form onSubmit={submit} method="post" className="max-w-md mx-auto text-left">
      <div className="flex flex-col sm:flex-row gap-3">
        {artists.length > 1 ? (
          <select value={slug} onChange={(e) => setSlug(e.target.value)} required aria-label="Artist" className={field}>
            <option value="">Choose an artist</option>
            {artists.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
          </select>
        ) : null}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required aria-label="Your email" className={"flex-1 " + field} />
        <button type="submit" disabled={status === "loading"} className={accentClass + " text-white px-6 py-3 rounded-lg text-sm font-semibold font-body transition-colors whitespace-nowrap disabled:opacity-60"}>
          {status === "loading" ? "Sending…" : button}
        </button>
      </div>
      <div className="mt-3">
        <MarketingOptIn artist={artist?.name || "this artist"} checked={optIn} onChange={setOptIn} required />
      </div>
      {status === "error" ? <p className="font-body text-xs mt-2" style={{ color: "#f87171" }}>Something went wrong. Please try again.</p> : null}
    </form>
  );
}
