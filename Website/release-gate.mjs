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
// in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY at build time (static export: Next inlines it into the page JS). On Netlify
// or CI a missing or wrong-shaped key fails the build, so Netlify keeps serving the last good deploy instead of a
// chat with no live feed. A local build only warns. Same rules as lib/publishableKey.ts; the value is never printed.
const KEY_ENV = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export function publishableKeyProblems(env = {}) {
  const v = typeof env[KEY_ENV] === "string" ? env[KEY_ENV].trim() : "";
  if (!v) return [KEY_ENV + " is not set"];
  if (v.startsWith("eyJ")) return [KEY_ENV + " holds a legacy JWT key; set the publishable key (sb_publishable_...)"];
  if (v.startsWith("sb_secret_")) return [KEY_ENV + " holds a SECRET key (sb_secret_...), which must never ship to a browser; set the publishable key"];
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(v)) return [KEY_ENV + " is not a publishable key (expected sb_publishable_...)"];
  return [];
}

export function assertPublishableKey(env = {}, warn = (m) => console.warn(m)) {
  const problems = publishableKeyProblems(env);
  if (!problems.length) return;
  const msg = "release gate: " + problems.join("; ") + ". Set it on the host (Netlify: Project configuration > Environment variables), then rebuild.";
  if (env.NETLIFY || env.CONTEXT || env.CI) throw new Error(msg);
  warn("warning (local build only, the chat's live feed will be off): " + msg);
}

export function assertReleasable(env = {}) {
  const problems = addressProblems(readFileSync(join(ROOT, "lib", "data.ts"), "utf8"));
  if (problems.length && !overrideAllowed(env)) {
    throw new Error("release gate: " + problems.join("; ") + ". Set the confirmed registered address, then rebuild.");
  }
}
