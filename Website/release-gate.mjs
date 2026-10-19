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

export function assertReleasable(env = {}) {
  const problems = addressProblems(readFileSync(join(ROOT, "lib", "data.ts"), "utf8"));
  if (problems.length && !overrideAllowed(env)) {
    throw new Error("release gate: " + problems.join("; ") + ". Set the confirmed registered address, then rebuild.");
  }
}
