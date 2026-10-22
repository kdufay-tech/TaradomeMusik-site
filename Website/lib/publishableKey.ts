// Which Supabase key the fan site may use in the browser (TEOS key rotation P-5, 22 Oct 2026).
//
// Only the PUBLISHABLE key (sb_publishable_...). It is public by design, but it still comes from the build
// environment, never from source. The legacy anon JWT is refused (the legacy keys are switched off in the key
// window), and a secret key (sb_secret_...) is refused outright: it must never reach a browser. A refused value is
// never echoed. release-gate.mjs applies the same rules to fail a Netlify build; tests pin both.
//
// Plain, erasable TypeScript only: node --test runs this file directly.

export const PUBLISHABLE_KEY_ENV = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export type KeyCheck =
  | { ok: true; key: string }
  | { ok: false; reason: "missing" | "legacy-jwt" | "secret-key" | "unrecognised" };

/** A JWT anywhere in a value: header.payload.signature, both JSON parts base64url ("eyJ..."). */
export const JWT_SHAPE = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/;

export function resolvePublishableKey(raw: unknown): KeyCheck {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v) return { ok: false, reason: "missing" };
  // A secret key ANYWHERE in the value is refused first (P-5 fix round, review F-1), then a JWT anywhere.
  if (v.includes("sb_secret_")) return { ok: false, reason: "secret-key" };
  if (v.startsWith("eyJ") || JWT_SHAPE.test(v)) return { ok: false, reason: "legacy-jwt" };
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(v)) return { ok: true, key: v };
  return { ok: false, reason: "unrecognised" };
}

/** One line for the browser console and the build log; names the variable and the reason, never the value. */
export function keyProblemText(reason: string): string {
  const why: Record<string, string> = {
    "missing": "is not set",
    "legacy-jwt": "holds a legacy JWT key; use the publishable key (sb_publishable_...)",
    "secret-key": "holds a SECRET key (sb_secret_...), which must never be used in a browser; use the publishable key",
    "unrecognised": "is not a publishable key (expected sb_publishable_...)",
  };
  return PUBLISHABLE_KEY_ENV + " " + (why[reason] || why.unrecognised);
}
