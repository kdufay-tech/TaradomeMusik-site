// Release gate (TEOS privacy phase 1, review I-5). next.config.mjs calls assertReleasable, so
// `next build` fails while a value the owner must confirm is still a placeholder. For a local
// check build only, ALLOW_ADDRESS_PLACEHOLDER=1 lets the build through; never set it for a deploy.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));

export function addressProblems(dataSource) {
  return /OWNER TO CONFIRM/.test(String(dataSource || ""))
    ? ["SITE.address in lib/data.ts is still the placeholder"]
    : [];
}

// Netlify sets NETLIFY and CONTEXT on every build; CI systems set CI. On any of them the override
// is ignored, so it can only ever let a local check build through (re-review N-2).
export function overrideAllowed(env = {}) {
  return env.ALLOW_ADDRESS_PLACEHOLDER === "1" && !env.NETLIFY && !env.CONTEXT && !env.CI;
}

// Supabase key gate (TEOS key rotation P-5, 22 Oct 2026). The community chat's live feed needs the PUBLISHABLE key
// in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY at build time (static export: Next inlines it into the page JS).
// - A SECRET key (sb_secret_...) or a JWT in the variable fails EVERY build, local included (P-5 fix round, review
//   F-1): Next inlines NEXT_PUBLIC_* whatever this gate decides, so a warning would still ship the value in out/.
// - A missing or unrecognised key fails the build on Netlify or CI (Netlify keeps serving the last good deploy
//   instead of a chat with no live feed) and only warns on a local build.
// Same rules as lib/publishableKey.ts (tests pin both); the value is never printed. build-output-scan.mjs is the
// second line: it fails the build if any secret or JWT reaches the output by any route.
const KEY_ENV = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const JWT_SHAPE = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/;
const ALWAYS_FATAL = new Set(["secret-key", "legacy-jwt"]);

/** ok | missing | secret-key | legacy-jwt | unrecognised. */
export function publishableKeyReason(env = {}) {
  const v = typeof env[KEY_ENV] === "string" ? env[KEY_ENV].trim() : "";
  if (!v) return "missing";
  if (v.includes("sb_secret_")) return "secret-key";
  if (v.startsWith("eyJ") || JWT_SHAPE.test(v)) return "legacy-jwt";
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(v)) return "unrecognised";
  return "ok";
}

const PROBLEM_TEXT = {
  "missing": KEY_ENV + " is not set",
  "secret-key": KEY_ENV + " holds a SECRET key (sb_secret_...), which must never ship to a browser; set the publishable key",
  "legacy-jwt": KEY_ENV + " holds a legacy JWT key; set the publishable key (sb_publishable_...)",
  "unrecognised": KEY_ENV + " is not a publishable key (expected sb_publishable_...)",
};

export function publishableKeyProblems(env = {}) {
  const reason = publishableKeyReason(env);
  return reason === "ok" ? [] : [PROBLEM_TEXT[reason]];
}

export function assertPublishableKey(env = {}, warn = (m) => console.warn(m)) {
  const reason = publishableKeyReason(env);
  if (reason === "ok") return;
  const msg = "release gate: " + PROBLEM_TEXT[reason] + ". Set it on the host (Netlify: Project configuration > Environment variables), then rebuild.";
  if (ALWAYS_FATAL.has(reason)) throw new Error(msg + " (This fails every build, local included: the value would be inlined into the public JS.)");
  if (env.NETLIFY || env.CONTEXT || env.CI) throw new Error(msg);
  warn("warning (local build only, the chat's live feed will be off): " + msg);
}

export function assertReleasable(env = {}) {
  const problems = addressProblems(readFileSync(join(ROOT, "lib", "data.ts"), "utf8"));
  if (problems.length && !overrideAllowed(env)) {
    throw new Error("release gate: " + problems.join("; ") + ". Set the confirmed registered address, then rebuild.");
  }
}
