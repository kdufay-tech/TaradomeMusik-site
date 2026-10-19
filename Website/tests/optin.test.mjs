// TEOS privacy phase 1 (2026-10-19): fan-site consent and form checks. Node >= 22.18 / 24 runs the
// .ts modules directly (type stripping). Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { optInLabel, optInBody, tokenFromSearch } from "../lib/optin.ts";
import { confirmCopy, unsubscribeCopy, PRIVACY_EMAIL } from "../lib/privacyCopy.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Exactly TEOS apps/api/src/modules/privacy/privacy.config.ts OPTIN_TEXT_V1. If either side changes,
// both must change together with a new version, because the API stores this text's hash as evidence.
const API_OPTIN_TEXT_V1 = "Email me news from {artist}: new music, shows and offers. Optional. You can unsubscribe at any time.";
const API_OPTIN_SHA256 = createHash("sha256").update(API_OPTIN_TEXT_V1, "utf8").digest("hex");

test("the box shows exactly the wording whose hash TEOS stores as evidence", () => {
  assert.equal(optInLabel("{artist}"), API_OPTIN_TEXT_V1);
  assert.equal(createHash("sha256").update(optInLabel("{artist}"), "utf8").digest("hex"), API_OPTIN_SHA256);
  assert.match(optInLabel("IRhay"), /^Email me news from IRhay: /);
});

test("every opt-in request says marketing_opt_in explicitly, and only `true` means yes", () => {
  const yes = optInBody({ slug: "irhay", email: " a@b.co ", name: " Ada ", form: "giveaway", optIn: true });
  assert.deepEqual(yes, { slug: "irhay", email: "a@b.co", name: "Ada", source: "fan_site", source_form: "fan-site:giveaway", marketing_opt_in: true });
  for (const v of [false, undefined, "true", 1]) {
    assert.equal(optInBody({ slug: "s", email: "a@b.co", form: "join", optIn: v }).marketing_opt_in, false, String(v));
  }
  assert.ok("marketing_opt_in" in optInBody({ slug: "s", email: "a@b.co", form: "join", optIn: false }));
});

test("link pages accept only the token shapes TEOS issues", () => {
  const hex = "a".repeat(64);
  const fan = "11111111-2222-4333-8444-555555555555";
  assert.equal(tokenFromSearch("?t=" + hex, "confirm"), hex);
  assert.equal(tokenFromSearch("?t=" + hex.toUpperCase(), "confirm"), null);
  assert.equal(tokenFromSearch("?t=<script>", "confirm"), null);
  assert.equal(tokenFromSearch("", "confirm"), null);
  const u1 = "u1." + fan + "." + hex;
  const u2 = "u2." + fan + "." + hex + "." + hex;
  assert.equal(tokenFromSearch("?t=" + encodeURIComponent(u1), "unsubscribe"), u1);
  assert.equal(tokenFromSearch("?t=" + encodeURIComponent(u2), "unsubscribe"), u2);
  assert.equal(tokenFromSearch("?t=" + hex, "unsubscribe"), null);
  assert.equal(tokenFromSearch("?t=u1.x." + hex, "unsubscribe"), null);
});

test("page copy: every state has a title; the privacy contact and the hashed-record note are there", () => {
  for (const s of ["valid", "confirmed", "used", "expired", "invalid", "error", "weird"]) assert.ok(confirmCopy(s, "IRhay").title);
  for (const s of ["valid", "unsubscribed", "already", "invalid", "error", "weird"]) assert.ok(unsubscribeCopy(s, "IRhay").title);
  assert.equal(confirmCopy("valid", "IRhay").button, "Yes, send me news");
  assert.equal(unsubscribeCopy("valid", "IRhay").button, "Unsubscribe");
  assert.equal(confirmCopy("confirmed", "IRhay").button, undefined, "no second button once done");
  const done = unsubscribeCopy("unsubscribed", "IRhay").body.join(" ");
  assert.ok(done.includes("scrambled (hashed)") && done.includes(PRIVACY_EMAIL));
  assert.equal(PRIVACY_EMAIL, "privacy@taradomemusik.com");
});

// ── static checks over every page and component ─────────────────────────────────
function tsxFiles(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...tsxFiles(p));
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}
const FILES = [...tsxFiles(join(ROOT, "app")), ...tsxFiles(join(ROOT, "components"))]
  .map((p) => ({ p: p.slice(ROOT.length + 1).replace(/\\/g, "/"), src: readFileSync(p, "utf8") }));

test("every fan form that collects an email carries the opt-in box (or is the contact form)", () => {
  const collecting = FILES.filter((f) => /type="email"/.test(f.src));
  assert.ok(collecting.length >= 9, "expected the fan forms, found " + collecting.map((f) => f.p));
  for (const f of collecting) {
    if (f.p === "components/ContactForm.tsx") continue;           // a message to the label, not a sign-up
    assert.ok(/<MarketingOptIn\b/.test(f.src) || /<FanListForm\b/.test(f.src), f.p + " collects an email without the opt-in box");
  }
});

test("the opt-in box is never ticked for the fan", () => {
  for (const f of FILES) {
    assert.ok(!/useState\(true\)/.test(f.src) || !/setOptIn/.test(f.src), f.p + " starts an opt-in ticked");
    if (/setOptIn/.test(f.src)) assert.match(f.src, /\[optIn, setOptIn\] = useState\(false\)/, f.p);
    assert.ok(!/defaultChecked/.test(f.src), f.p + " uses defaultChecked");
  }
  const box = FILES.find((f) => f.p === "components/MarketingOptIn.tsx").src;
  assert.match(box, /checked=\{checked\}/);
});

// KNOWN, NOT FIXED HERE (reported in task-p1-report.md, outside privacy phase 1): the artist intake
// form on /studio POSTs to /api/artist-intake, which this static site does not have either. It is a
// POST (nothing in the URL) and not a fan form. Remove this entry when it is fixed.
const KNOWN_DEAD_ACTIONS = new Set(['app/studio/page.tsx|/api/artist-intake']);

test("no form can put personal data in a URL, and none posts to the old 404 route", () => {
  for (const f of FILES) {
    for (const m of f.src.matchAll(/<form\b[^>]*>/g)) {
      assert.match(m[0], /method="post"/i, f.p + ": " + m[0]);
      const action = (m[0].match(/action="([^"]*)"/) || [])[1] || "";
      if (action.startsWith("/api/") && !KNOWN_DEAD_ACTIONS.has(f.p + "|" + action)) {
        assert.fail(f.p + " posts to a route this static site does not have: " + m[0]);
      }
    }
    assert.ok(!f.src.includes("/api/crm/subscribe"), f.p + " still references /api/crm/subscribe");
  }
  const contact = FILES.find((f) => f.p === "components/ContactForm.tsx").src;
  assert.ok(contact.includes('"/public/contact"') && contact.includes("JSON.stringify"), "contact form posts JSON to TEOS");
  assert.ok(!contact.includes("mailto:"), "no mailto hand-off");
});

test("the old implied-consent fields are gone from the fan site", () => {
  for (const f of FILES) assert.ok(!/consent_email/.test(f.src), f.p + " still sends consent_email");
});

// Fix round 1 (review I-5): one postal address, a placeholder until the owner confirms it, and a
// build that refuses to ship the placeholder.
test("I-5: the site address is the placeholder and the release gate refuses it", async () => {
  const data = readFileSync(join(ROOT, "lib", "data.ts"), "utf8");
  assert.match(data, /address: "\[REGISTERED ADDRESS — OWNER TO CONFIRM\]"/);
  assert.doesNotMatch(data, /Ademola/);
  const { addressProblems, assertReleasable } = await import("../release-gate.mjs");
  assert.deepEqual(addressProblems(data), ["SITE.address in lib/data.ts is still the placeholder"]);
  assert.deepEqual(addressProblems('address: "1 Example Road, Lagos, Nigeria",'), []);
  assert.throws(() => assertReleasable({}), /placeholder/);
  assert.doesNotThrow(() => assertReleasable({ ALLOW_ADDRESS_PLACEHOLDER: "1" }));
  assert.match(readFileSync(join(ROOT, "next.config.mjs"), "utf8"), /assertReleasable\(process\.env\)/);
});

// Fix round 2 (N-2): the override is local-only in code, not just by comment. Netlify sets NETLIFY
// and CONTEXT; CI systems set CI. Any of them makes the flag ignored.
test("N-2: ALLOW_ADDRESS_PLACEHOLDER is ignored on Netlify and in CI", async () => {
  const { assertReleasable } = await import("../release-gate.mjs");
  const ok = { ALLOW_ADDRESS_PLACEHOLDER: "1" };
  assert.doesNotThrow(() => assertReleasable(ok));
  for (const extra of [{ NETLIFY: "true" }, { CONTEXT: "production" }, { CONTEXT: "deploy-preview" }, { CI: "true" }, { CI: "1" }]) {
    assert.throws(() => assertReleasable({ ...ok, ...extra }), /placeholder/, JSON.stringify(extra));
  }
});
