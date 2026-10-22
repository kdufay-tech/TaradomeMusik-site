// Build-output secret scan (TEOS key rotation P-5 fix round, review F-1, 22 Oct 2026).
//
// The static export is public: anything in it is published. This fails the build when any output holds a Supabase
// secret key (`sb_secret_` + key body) or a JWT-shaped string (header.payload.signature, the shape of the legacy anon and
// service_role keys and of any other JWT). Two enforcement points, so it holds however the host invokes the build:
//   1. SecretScanPlugin (added by next.config.mjs to every production webpack compilation, client and server):
//      scans each emitted asset after minification and adds a compilation error, so `next build` itself fails.
//      This is where NEXT_PUBLIC_* values are inlined, so it covers every variable, not only the publishable key.
//   2. The `postbuild` npm script, `node build-output-scan.mjs out`: scans the whole exported out/ (HTML, JS, RSC
//      payloads, files copied from public/) after `npm run build`, and exits 1 on any hit or a missing folder.
// Output is counts only (never a value, never a file name). Tests: tests/secretGate.test.mjs.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// A secret KEY: the prefix plus a key body. The bare prefix is not counted: supabase-js and lib/publishableKey.ts
// carry it as a detector string (`startsWith("sb_secret_")`, messages), and those are bundled into the page JS.
// A real secret key body is ~50+ characters, so 8 is far below any real key and far above the detector strings.
const SECRET_RE = /sb_secret_[A-Za-z0-9_-]{8,}/g;
const JWT_RE = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;

/** Counts of secret-key markers and JWT-shaped strings in a string or Buffer. */
export function countSecrets(content) {
  const text = Buffer.isBuffer(content) ? content.toString("latin1") : String(content ?? "");
  return { secret: (text.match(SECRET_RE) || []).length, jwt: (text.match(JWT_RE) || []).length };
}

/** Recursively scans every file under `dir`. Throws if `dir` is not a folder. */
export function scanDirectory(dir) {
  if (!statSync(dir).isDirectory()) throw new Error("not a folder");
  const totals = { files: 0, filesWithHits: 0, secret: 0, jwt: 0 };
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      if (!entry.isFile()) continue;
      const c = countSecrets(readFileSync(p));
      totals.files += 1;
      if (c.secret || c.jwt) totals.filesWithHits += 1;
      totals.secret += c.secret;
      totals.jwt += c.jwt;
    }
  };
  walk(dir);
  return totals;
}

const PLUGIN = "SecretScanPlugin";

/** webpack plugin: a secret or JWT in any emitted asset is a compilation error (counts only). */
export class SecretScanPlugin {
  apply(compiler) {
    const { Compilation, WebpackError } = compiler.webpack;
    compiler.hooks.thisCompilation.tap(PLUGIN, (compilation) => {
      compilation.hooks.processAssets.tap({ name: PLUGIN, stage: Compilation.PROCESS_ASSETS_STAGE_REPORT }, (assets) => {
        const totals = { assets: 0, assetsWithHits: 0, secret: 0, jwt: 0 };
        for (const name of Object.keys(assets)) {
          const c = countSecrets(assets[name].source());
          totals.assets += 1;
          if (c.secret || c.jwt) totals.assetsWithHits += 1;
          totals.secret += c.secret;
          totals.jwt += c.jwt;
        }
        if (totals.assetsWithHits) {
          compilation.errors.push(new WebpackError(
            "build output scan: a secret would be published: assetsWithHits=" + totals.assetsWithHits +
            " sb_secret_=" + totals.secret + " jwt=" + totals.jwt +
            ". Remove the secret from the NEXT_PUBLIC_* variables / source, then rebuild."));
        }
      });
    });
  }
}

/** CLI (postbuild): node build-output-scan.mjs <folder>. Exit 0 clean, 1 on any hit or a missing folder. */
export function main(argv = process.argv.slice(2)) {
  const dir = resolve(argv[0] || "out");
  let t;
  try { t = scanDirectory(dir); } catch {
    console.error("build output scan: FAILED: the output folder is missing or unreadable (nothing scanned).");
    return 1;
  }
  const line = "files=" + t.files + " filesWithHits=" + t.filesWithHits + " sb_secret_=" + t.secret + " jwt=" + t.jwt;
  if (t.filesWithHits) {
    console.error("build output scan: FAILED, a secret would be published: " + line);
    return 1;
  }
  console.log("build output scan: ok " + line);
  return 0;
}

// Run as a script (not when imported by next.config.mjs or the tests). Windows paths compare case-insensitively.
const norm = (p) => (process.platform === "win32" ? resolve(p).toLowerCase() : resolve(p));
if (process.argv[1] && norm(process.argv[1]) === norm(fileURLToPath(import.meta.url))) process.exitCode = main();
