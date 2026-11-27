/* ─── Fan age check (TEOS, 2026-11-27) ───
 * Every fan form that captures a person asks "How old are you?" and sends `age_band` ("18_plus" | "13_17" |
 * "under_13"); 13 to 17 also sends `guardian_email`. TEOS refuses under 13 and stores nothing; for 13 to 17 it emails the
 * parent, and nothing is delivered until the parent agrees (NDPA 2023 s.31, s.65).
 *
 * The wording is DRAFT (TEOS docs/privacy/2026-11-27-age-check-copy.md) until Kiszo approves it, and Michael Olowo
 * Aturu approves the parent method. TEOS apps/web/app/lib/ageCopy.ts carries the same strings; tests pin both.
 *
 * Forms whose news box is the only reason to capture (merch, membership, members' vault, paid tickets) ask the age only
 * when that box is ticked: the purchase itself captures no one.
 */

export type AgeBand = "18_plus" | "13_17" | "under_13";

export const AGE_QUESTION = "How old are you?";
export const AGE_OPTIONS: { value: AgeBand; label: string }[] = [
  { value: "18_plus", label: "18 or over" },
  { value: "13_17", label: "13 to 17" },
  { value: "under_13", label: "Under 13" },
];
export const GUARDIAN_EMAIL_LABEL = "Parent or guardian's email";
export const GUARDIAN_EMAIL_HINT = "We'll ask them to agree before we send you anything. Nothing is sent to you until they do.";

// The messages TEOS answers with (apps/api/src/modules/privacy/age.ts). Checked here first so a form never sends an
// answer TEOS would refuse, and never sends an under-13 answer at all.
export const AGE_MESSAGES = {
  refresh: "Please refresh the page and tell us your age.",
  needParent: "Please give a parent or guardian's email.",
  notYourOwn: "Please give a parent or guardian's email, not your own.",
  under13: "Sorry, you need to be 13 or older to sign up.",
} as const;
export const GUARDIAN_NEEDED_MESSAGE = "We've emailed your parent or guardian. Once they agree, we'll send you everything you signed up for.";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const norm = (v: string | null | undefined) => String(v || "").trim().toLowerCase();

/** null when the answer can be sent; otherwise the message to show (under 13 is shown and nothing is sent). */
export function validateAge(answer: AgeBand | "" | null | undefined, guardianEmail: string | null | undefined, fanEmail: string | null | undefined): string | null {
  if (!answer) return AGE_MESSAGES.refresh;
  if (answer === "under_13") return AGE_MESSAGES.under13;
  if (answer !== "18_plus" && answer !== "13_17") return AGE_MESSAGES.refresh;
  if (answer === "13_17") {
    const g = norm(guardianEmail);
    if (!g || g.length > 254 || !EMAIL.test(g)) return AGE_MESSAGES.needParent;
    if (g === norm(fanEmail)) return AGE_MESSAGES.notYourOwn;
  }
  return null;
}

/** What a request body carries. Empty when no answer was given (a form that only asks when the news box is ticked). */
export function ageFields(answer: AgeBand | "" | null | undefined, guardianEmail: string | null | undefined): { age_band?: AgeBand; guardian_email?: string } {
  if (!answer) return {};
  return answer === "13_17" ? { age_band: answer, guardian_email: norm(guardianEmail) } : { age_band: answer };
}

/** A TEOS answer said a parent was asked. */
export function guardianNeeded(j: unknown): boolean {
  return !!j && typeof j === "object" && (j as any).guardian_needed === true;
}
