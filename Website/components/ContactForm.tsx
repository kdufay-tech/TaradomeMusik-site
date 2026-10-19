"use client";

import { useState } from "react";
import { TEOS_API } from "../lib/optin";

/* Contact form (TEOS privacy phase 1, 2026-10-19). It used to be a form element with no method or action,
 * so the browser sent name, email, subject and message as a GET to /contact: in the URL, the
 * browser history and the server logs. It now POSTs JSON to TEOS /v1/public/contact, which stores
 * only name, email and message (plus a hashed IP) and emails the label's inbox. method="post" stays
 * on the element so that, even without JavaScript, nothing is ever put in a URL. The subject field
 * was removed: the store keeps only name, email and message (owner ruling). "website" is a honeypot
 * for bots, hidden from people. */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading"); setErr("");
    try {
      const res = await fetch(TEOS_API + "/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: "taradomemusik.com", name, email, message, website }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(typeof d?.message === "string" ? d.message : "Your message could not be sent. Please try again, or email us.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErr("Your message could not be sent. Please try again, or email us.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="card-surface p-6 font-body text-white/80">
        Thanks, {name.trim() || "friend"}. Your message is with our team and we&apos;ll reply to {email}.
      </div>
    );
  }

  const field = "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-body text-white focus:outline-none focus:border-ember-400/40 transition-colors";
  const label = "block font-body text-xs text-white/40 mb-1.5 tracking-wide uppercase";
  return (
    <form onSubmit={submit} method="post" action="#" className="space-y-4">
      <div>
        <label className={label} htmlFor="c-name">Name</label>
        <input id="c-name" type="text" required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="c-email">Email</label>
        <input id="c-email" type="email" required maxLength={320} value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div>
        <label className={label} htmlFor="c-message">Message</label>
        <textarea id="c-message" rows={5} required maxLength={5000} value={message} onChange={(e) => setMessage(e.target.value)} className={field + " resize-none"} />
      </div>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="c-website">Leave this empty</label>
        <input id="c-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <p className="font-body text-[11px] text-white/30">
        We use your name, email and message only to reply to you. See our <a href="/privacy" className="underline">privacy notice</a>.
      </p>
      {status === "error" ? <p className="font-body text-xs" style={{ color: "#f87171" }}>{err}</p> : null}
      <button type="submit" disabled={status === "loading"} className="w-full bg-ember-400 text-white py-3.5 rounded-lg text-sm font-semibold font-body hover:bg-ember-500 transition-colors disabled:opacity-60">
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
