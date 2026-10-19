/* ─── Marketing email opt-in (TEOS privacy phase 1, 2026-10-19) ───
 * Every fan form that collects an email shows ONE unticked, optional box with this exact wording.
 * It must match OPTIN_TEXT_V1 in TEOS apps/api/src/modules/privacy/privacy.config.ts: the API stores
 * the SHA-256 of that text with the fan's consent as evidence.
 *
 * Ticking it never subscribes anyone by itself. The API emails a confirmation link (double opt-in)
 * and only the click on that link records consent. Unticked, nothing about marketing is sent.
 */

// Written exactly as the other components write it, so Next inlines the value at build time.
export const TEOS_API: string =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

export function optInLabel(artist: string): string {
  return "Email me news from " + artist + ": new music, shows and offers. Optional. You can unsubscribe at any time.";
}

/** Short line under a form, said BEFORE the person gives consent (NDPA s.26(4)). */
export const OPTIN_NOTE =
  "We only email you news if you tick the box and then confirm from your inbox. You can unsubscribe at any time.";

export type OptInForm = "join" | "giveaway" | "events" | "merch" | "membership" | "unlock" | "chat" | "fan-list" | "notify";

/** The body sent to POST /public/fan for a news opt-in. Always says marketing_opt_in explicitly. */
export function optInBody(p: { slug: string; email: string; name?: string | null; form: OptInForm; optIn: boolean }) {
  return {
    slug: p.slug,
    email: p.email.trim(),
    name: (p.name || "").trim() || null,
    source: "fan_site",
    source_form: "fan-site:" + p.form,
    marketing_opt_in: p.optIn === true,
  };
}

/**
 * After a form's own action succeeded (entry, enrolment, checkout, unlock, chat join): if the box
 * was ticked, ask TEOS to send the confirmation email. Never throws and never blocks the main action.
 */
export async function requestNewsOptIn(p: { slug: string; email: string; name?: string | null; form: OptInForm }): Promise<boolean> {
  try {
    const res = await fetch(TEOS_API + "/public/fan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(optInBody({ ...p, optIn: true })),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Reads ?t= from a page URL, accepting only the token shapes TEOS issues. */
export function tokenFromSearch(search: string, kind: "confirm" | "unsubscribe"): string | null {
  let t = "";
  try { t = new URLSearchParams(search).get("t") || ""; } catch { return null; }
  if (kind === "confirm") return /^[0-9a-f]{64}$/.test(t) ? t : null;
  return /^u1\.[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(t) || /^u2\.[0-9a-f-]{36}\.[0-9a-f]{64}\.[0-9a-f]{64}$/.test(t) ? t : null;
}
