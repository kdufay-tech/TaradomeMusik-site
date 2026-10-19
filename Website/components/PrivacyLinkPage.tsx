"use client";

import { useEffect, useState } from "react";
import { TEOS_API, tokenFromSearch } from "../lib/optin";
import { confirmCopy, unsubscribeCopy } from "../lib/privacyCopy";

/* The landing pages for links TEOS emails (privacy phase 1):
 *   /confirm?t=<token>      double opt-in: shows what will happen; only the BUTTON (a POST) confirms
 *   /unsubscribe?t=<token>  unsubscribe: the button (a POST) unsubscribes. Mail clients that support
 *                           RFC 8058 unsubscribe in one click without this page.
 * Opening the page changes nothing (a lookup only), so mail scanners that follow links cannot
 * confirm or unsubscribe anyone. Tokens go to TEOS in POST bodies, never in a request URL. */
export default function PrivacyLinkPage({ kind }: { kind: "confirm" | "unsubscribe" }) {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState("loading");
  const [name, setName] = useState("TáraDomeMusik");
  const [busy, setBusy] = useState(false);
  const base = TEOS_API + (kind === "confirm" ? "/public/consent" : "/public/unsubscribe");

  useEffect(() => {
    const t = tokenFromSearch(window.location.search, kind);
    setToken(t);
    if (!t) { setState("invalid"); return; }
    fetch(base + "/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: t }) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (d?.artist_name || d?.org_name) setName(d.artist_name || d.org_name); setState(String(d?.state || "invalid")); })
      .catch(() => setState("error"));
  }, [kind, base]);

  async function act() {
    if (!token) return;
    setBusy(true);
    try {
      const r = await fetch(kind === "confirm" ? base + "/confirm" : base, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      });
      const d = r.ok ? await r.json() : null;
      if (d?.artist_name) setName(d.artist_name);
      setState(d ? String(d.state || "invalid") : "error");
    } catch { setState("error"); }
    finally { setBusy(false); }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void act();
  }

  const copy = state === "loading"
    ? { title: "Checking your link…", body: [] as string[], button: undefined }
    : kind === "confirm" ? confirmCopy(state, name) : unsubscribeCopy(state, name);

  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-lg mx-auto card-surface p-8">
        <h1 className="font-display text-2xl font-bold text-white mb-4">{copy.title}</h1>
        {copy.body.map((p, i) => <p key={i} className="font-body text-sm text-white/60 mb-3 leading-relaxed">{p}</p>)}
        {copy.button ? (
          <form onSubmit={onSubmit} method="post" action="#">
            <button type="submit" disabled={busy} className="mt-3 w-full bg-ember-400 text-white py-3 rounded-lg text-sm font-semibold font-body hover:bg-ember-500 transition-colors disabled:opacity-60">
              {busy ? "One moment…" : copy.button}
            </button>
          </form>
        ) : null}
        <p className="font-body text-[11px] text-white/30 mt-6">
          TáraDomeMusik Limited (RC 1903598). <a href="/privacy" className="underline">Privacy notice</a>.
        </p>
      </div>
    </section>
  );
}
