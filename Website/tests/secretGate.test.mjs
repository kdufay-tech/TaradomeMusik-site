// P-5 fix round (review F-1): a secret must never reach the static export, on ANY build (local included).
// 1. The key gate fails every build when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY holds a secret key or a JWT; a missing
//    or unrecognised key still only warns locally and fails on Netlify/CI.
// 2. The build-output scan (webpack plugin + `postbuild` over out/) fails the build on any `sb_secret_` or JWT-shaped
//    string and reports counts only.
// Fixtures are assembled at run time so this file holds no JWT-shaped or secret-shaped literal itself.
// Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assertPublishableKey, publishableKeyReason } from "../release-gate.mjs";
import { countSecrets, scanDirectory, SecretScanPlugin } from "../build-output-scan.mjs";
import { resolvePublishableKey } from "../lib/publishableKey.ts";

const K = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const SECRET = "sb_" + "secret_" + "FIXTUREDONOTECHO01";
const JWT = ["eyJ" + "hbGciOiJIUzI1NiJ9", "eyJ" + "yb2xlIjoiYW5vbiJ9", "FIXTUREsignature0"].join(".");
const GOOD = "sb_publishable_AbC123";
const SCANNER = fileURLToPath(new URL("../build-output-scan.mjs", import.meta.url));

// ---------- key gate ----------
test("a secret key or a JWT in the publishable variable fails EVERY build, local included, without echoing it", () => {
  const cases = [
    [SECRET, /SECRET key/],
    ["  " + SECRET + "  ", /SECRET key/],
    [GOOD + " " + SECRET, /SECRET key/],                 // contains a secret anywhere
    [JWT, /legacy JWT/],
    ["x" + JWT, /legacy JWT/],                           // contains a JWT-shaped string anywhere
  ];
  for (const [value, re] of cases) {
    for (const host of [{}, { NETLIFY: "true" }, { CONTEXT: "deploy-preview" }, { CI: "true" }]) {
      const warnings = [];
      let err = null;
      try { assertPublishableKey({ ...host, [K]: value }, (w) => warnings.push(w)); } catch (e) { err = e; }
      assert.ok(err, "must throw for " + JSON.stringify(Object.keys(host)) + " / " + re);
      assert.match(err.message, re);
      assert.equal(warnings.length, 0, "a refused secret is an error, not a warning");
      assert.equal(err.message.includes("FIXTURE"), false, "the gate never prints the value");
    }
  }
});

test("a missing or unrecognised key only warns locally and still fails on Netlify and in CI", () => {
  for (const value of [undefined, "", "   ", "hello", "sb_publishable_"]) {
    const warnings = [];
    assert.doesNotThrow(() => assertPublishableKey({ [K]: value }, (w) => warnings.push(w)));
    assert.equal(warnings.length, 1, "warns once for " + JSON.stringify(value));
    for (const host of [{ NETLIFY: "true" }, { CONTEXT: "production" }, { CI: "1" }]) {
      assert.throws(() => assertPublishableKey({ ...host, [K]: value }), /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
    }
  }
  const warnings = [];
  assert.doesNotThrow(() => assertPublishableKey({ [K]: GOOD }, (w) => warnings.push(w)));
  assert.equal(warnings.length, 0);
});

test("publishableKeyReason and the browser-side resolver classify the same way", () => {
  const table = [[undefined, "missing"], [" ", "missing"], [GOOD, "ok"], [SECRET, "secret-key"], [GOOD + SECRET, "secret-key"],
    [JWT, "legacy-jwt"], ["x" + JWT, "legacy-jwt"], ["eyJonlyprefix", "legacy-jwt"], ["nope", "unrecognised"]];
  for (const [value, reason] of table) {
    assert.equal(publishableKeyReason({ [K]: value }), reason, String(value).slice(0, 4));
    const r = resolvePublishableKey(value);
    assert.equal(r.ok ? "ok" : r.reason, reason, "resolver " + String(value).slice(0, 4));
  }
});

// ---------- build-output scan ----------
test("countSecrets counts sb_secret_ and JWT-shaped strings only", () => {
  assert.deepEqual(countSecrets("var a='" + SECRET + "',b=\"" + SECRET + "\";c=`" + JWT + "`"), { secret: 2, jwt: 1 });
  assert.deepEqual(countSecrets("clean " + GOOD + " eyJabc.def sb_secretless"), { secret: 0, jwt: 0 });
  assert.deepEqual(countSecrets(Buffer.from("x" + JWT)), { secret: 0, jwt: 1 }, "Buffers are scanned too");
  assert.deepEqual(countSecrets(""), { secret: 0, jwt: 0 });
  // Detector strings that supabase-js and lib/publishableKey.ts legitimately bundle are not keys.
  const P = "sb_" + "secret_";
  for (const s of ['startsWith("' + P + '")', "(" + P + "...)", "`" + P + "`),x", P + ".`) is not sent", P + "x1"]) {
    assert.equal(countSecrets(s).secret, 0, s);
  }
  assert.equal(countSecrets(P + "abcdefgh").secret, 1, "a prefix plus an 8-character body counts as a key");
});

function fixtureDir(withHits) {
  const dir = mkdtempSync(join(tmpdir(), "p5scan-"));
  mkdirSync(join(dir, "_next", "static", "chunks"), { recursive: true });
  writeFileSync(join(dir, "index.html"), "<html>" + GOOD + "</html>");
  writeFileSync(join(dir, "_next", "static", "chunks", "a.js"), withHits ? "x='" + SECRET + "'" : "x=1");
  writeFileSync(join(dir, "_next", "static", "chunks", "b.js"), withHits ? "y='" + JWT + "';z='" + SECRET + "'" : "y=2");
  writeFileSync(join(dir, "robots.txt"), "User-agent: *");
  return dir;
}

test("scanDirectory walks every file and returns counts", () => {
  const dirty = fixtureDir(true); const clean = fixtureDir(false);
  try {
    assert.deepEqual(scanDirectory(dirty), { files: 4, filesWithHits: 2, secret: 2, jwt: 1 });
    assert.deepEqual(scanDirectory(clean), { files: 4, filesWithHits: 0, secret: 0, jwt: 0 });
  } finally { rmSync(dirty, { recursive: true, force: true }); rmSync(clean, { recursive: true, force: true }); }
});

test("the post-build CLI exits 1 on a hit (counts only), 0 when clean, and 1 when the output folder is missing", () => {
  const dirty = fixtureDir(true); const clean = fixtureDir(false);
  try {
    const bad = spawnSync(process.execPath, [SCANNER, dirty], { encoding: "utf8" });
    assert.equal(bad.status, 1);
    const badOut = bad.stdout + bad.stderr;
    assert.match(badOut, /sb_secret_=2/); assert.match(badOut, /jwt=1/); assert.match(badOut, /filesWithHits=2/);
    assert.equal(badOut.includes("FIXTURE"), false, "no value is printed");
    assert.equal(/a\.js|b\.js/.test(badOut), false, "counts only, no file names");
    const ok = spawnSync(process.execPath, [SCANNER, clean], { encoding: "utf8" });
    assert.equal(ok.status, 0, ok.stdout + ok.stderr);
    assert.match(ok.stdout, /files=4 filesWithHits=0 sb_secret_=0 jwt=0/);
    const missing = spawnSync(process.execPath, [SCANNER, join(clean, "nope")], { encoding: "utf8" });
    assert.equal(missing.status, 1, "fails closed when there is nothing to scan");
  } finally { rmSync(dirty, { recursive: true, force: true }); rmSync(clean, { recursive: true, force: true }); }
});

test("SecretScanPlugin turns a hit in any emitted asset into a compilation error (counts only)", () => {
  class FakeError extends Error {}
  const run = (assets) => {
    let tapped = null; let stage = null;
    const compilation = { errors: [], hooks: { processAssets: { tap: (opts, fn) => { stage = opts.stage; tapped = fn; } } } };
    const compiler = {
      webpack: { WebpackError: FakeError, Compilation: { PROCESS_ASSETS_STAGE_REPORT: 5000 } },
      hooks: { thisCompilation: { tap: (_name, fn) => fn(compilation) } },
    };
    new SecretScanPlugin().apply(compiler);
    assert.equal(stage, 5000, "runs at the REPORT stage, after minification");
    tapped(assets);
    return compilation.errors;
  };
  const src = (s) => ({ source: () => s });
  assert.equal(run({ "a.js": src("x=1"), "b.css": src("y{}") }).length, 0);
  const errs = run({ "a.js": src("x='" + SECRET + "'"), "page.html": src(JWT), "c.js": src(Buffer.from("ok")) });
  assert.equal(errs.length, 1);
  assert.ok(errs[0] instanceof FakeError);
  assert.match(errs[0].message, /sb_secret_=1/); assert.match(errs[0].message, /jwt=1/);
  assert.equal(errs[0].message.includes("FIXTURE"), false);
});

test("next.config.mjs installs the plugin on production builds and package.json runs the out/ scan after build", () => {
  const cfg = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8");
  assert.match(cfg, /new SecretScanPlugin\(\)/);
  assert.match(cfg, /if \(!dev\)/);
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.scripts.postbuild, "node build-output-scan.mjs out");
  assert.equal(pkg.scripts.build, "next build");
});
