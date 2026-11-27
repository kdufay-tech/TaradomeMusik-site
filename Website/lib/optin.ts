/* ─── Marketing email opt-in (TEOS privacy phase 1, 2026-10-19) ───
 * Every fan form that collects an email shows ONE unticked, optional box with this exact wording.
 * It must match OPTIN_TEXT_V2 in TEOS apps/api/src/modules/privacy/privacy.config.ts (Fan Magnet F1, 2026-11-25):
 * the API stores the SHA-256 of that text with the fan's consent as evidence, picking the text by the
 * `optin_version` the request sends. Change the wording only together with a new version on both sides.
 *
 * Ticking it never subscribes anyone by itself. The API emails a confirmation link (double opt-in)
 * and only the click on that link records consent. Unticked, nothing about marketing is sent.
 */

// Written exactly as the other components write it, so Next inlines the value at build time.
export const TEOS_API: string =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

export const OPTIN_VERSION = "optin-v2";

export function optInLabel(artist: string): string {
  return "Email me news from " + artist + ": new music, shows and offers, and show me relevant ads on social media. Optional. You can unsubscribe at any time.";
}

/** Short line under a form, said BEFORE the person gives consent (NDPA s.26(4)). */
export const OPTIN_NOTE =
  "We only email you news if you tick the box and then confirm from your inbox. You can unsubscribe at any time.";

export type OptInForm = "join" | "giveaway" | "events" | "merch" | "membership" | "unlock" | "chat" | "fan-list" | "notify";

/** The body sent to POST /public/fan for a news opt-in. Always says marketing_opt_in explicitly. */
// Fan age check (TEOS, 2026-11-27): `age` is ageFields() from lib/age.ts. TEOS requires it on /public/fan.
export function optInBody(p: { slug: string; email: string; name?: string | null; form: OptInForm; optIn: boolean;
                               age?: { age_band?: string; guardian_email?: string } }) {
  return {
    ...(p.age || {}),
    slug: p.slug,
    email: p.email.trim(),
    name: (p.name || "").trim() || null,
    source: "fan_site",
    source_form: "fan-site:" + p.form,
    marketing_opt_in: p.optIn === true,
    optin_version: OPTIN_VERSION,
  };
}

/**
 * After a form's own action succeeded (entry, enrolment, checkout, unlock, chat join): if the box
 * was ticked, ask TEOS to send the confirmation email. Never throws and never blocks the main action.
 */
export async function requestNewsOptIn(p: { slug: string; email: string; name?: string | null; form: OptInForm;
                                         age?: { age_band?: string; guardian_email?: string } }): Promise<boolean> {
  try {
    const res = await fetch(TEOS_API + "/public/fan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(optInBody({ ...p, optIn: true })),
    });
    if (!res.ok) return false;
    // An under-13 answer is refused with ok:false and nothing is sent (the forms check first, so this is a backstop).
    const j = await res.json().catch(() => ({}));
    return !(j && j.ok === false);
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
