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

export function assertReleasable(env = {}) {
  const problems = addressProblems(readFileSync(join(ROOT, "lib", "data.ts"), "utf8"));
  if (problems.length && env.ALLOW_ADDRESS_PLACEHOLDER !== "1") {
    throw new Error("release gate: " + problems.join("; ") + ". Set the confirmed registered address, then rebuild.");
  }
}
