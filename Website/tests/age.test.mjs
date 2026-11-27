// TEOS fan age check (2026-11-27): the age question on every fan-site form. Node >= 22.18 runs the .ts modules
// directly (type stripping). Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateAge, ageFields, guardianNeeded, AGE_MESSAGES, AGE_OPTIONS } from "../lib/age.ts";
import { optInBody } from "../lib/optin.ts";
import { confirmCopy, PRIVACY_NOTICE_VERSION, CHILDREN_HEADING, CHILDREN_BODY } from "../lib/privacyCopy.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
// TEOS beside the fan site (the worktree layout used to build both). Elsewhere the cross-check is skipped, not failed.
const TEOS = join(ROOT, "../../teos-release-campaigns");
const teos = (p) => (existsSync(join(TEOS, p)) ? readFileSync(join(TEOS, p), "utf8") : null);

test("validateAge: the TEOS messages, each for its input", () => {
  assert.deepEqual(AGE_OPTIONS.map((o) => o.value), ["18_plus", "13_17", "under_13"]);
  assert.equal(validateAge("", "", "a@x.co"), "Please refresh the page and tell us your age.");
  assert.equal(validateAge("adult", "", "a@x.co"), AGE_MESSAGES.refresh);
  assert.equal(validateAge("under_13", "", "a@x.co"), "Sorry, you need to be 13 or older to sign up.");
  assert.equal(validateAge("13_17", "", "kid@x.co"), "Please give a parent or guardian's email.");
  assert.equal(validateAge("13_17", "nope", "kid@x.co"), AGE_MESSAGES.needParent);
  assert.equal(validateAge("13_17", " Kid@X.co ", "kid@x.co"), "Please give a parent or guardian's email, not your own.");
  assert.equal(validateAge("13_17", "mum@x.co", "kid@x.co"), null);
  assert.equal(validateAge("18_plus", "", "a@x.co"), null);
});

test("the messages are the ones TEOS answers with", (t) => {
  const api = teos("apps/api/src/modules/privacy/age.ts");
  if (!api) return t.skip("TEOS checkout not beside the fan site");
  for (const m of Object.values(AGE_MESSAGES)) assert.ok(api.includes(m), "TEOS says: " + m);
});

test("request fields: age_band always, guardian_email only for 13 to 17; the news opt-in carries them", () => {
  assert.deepEqual(ageFields("", ""), {});
  assert.deepEqual(ageFields("18_plus", "x"), { age_band: "18_plus" });
  assert.deepEqual(ageFields("13_17", " Mum@X.co "), { age_band: "13_17", guardian_email: "mum@x.co" });
  const b = optInBody({ slug: "s", email: "a@x.co", form: "join", optIn: true, age: ageFields("13_17", "mum@x.co") });
  assert.equal(b.age_band, "13_17"); assert.equal(b.guardian_email, "mum@x.co");
  assert.equal(guardianNeeded({ ok: true, guardian_needed: true }), true);
  assert.equal(guardianNeeded({ ok: true }), false);
});

// Forms that capture a person: the age question is always asked.
const ALWAYS = ["components/FanListForm.tsx", "components/JoinCommunity.tsx", "components/GiveawaysBoard.tsx",
                "components/CommunityChat.tsx", "components/EventsBoard.tsx"];
// Forms that capture only through the news box: asked when the box is ticked.
const WITH_NEWS = ["components/UnlockContent.tsx", "components/MerchStore.tsx", "components/UpgradeButton.tsx"];

for (const f of [...ALWAYS, ...WITH_NEWS]) {
  test(f + ": asks the age, checks it, sends it", () => {
    const s = read(f);
    assert.match(s, /import AgeQuestion from "\.\/AgeQuestion"/);
    assert.match(s, /<AgeQuestion\b/);
    assert.match(s, /validateAge\(/);
    assert.match(s, /age_band|ageFields\(/);
  });
}

for (const f of WITH_NEWS) {
  test(f + ": the age is asked only with the news box, and never sent with the purchase or the lookup", () => {
    const s = read(f);
    assert.match(s, /\{optIn \? \(?\s*<AgeQuestion/, "rendered only when the box is ticked");
    const own = s.slice(s.indexOf("await fetch("), s.indexOf("requestNewsOptIn({", s.indexOf("await fetch(")));
    assert.doesNotMatch(own, /ageFields|age_band/, "the purchase / lookup request carries no age");
    assert.match(s, /requestNewsOptIn\(\{[^}]*age: ageFields\(/);
  });
}

test("community chat: the age is remembered with the join, sent with every post, and a held post is explained", () => {
  const s = read("components/CommunityChat.tsx");
  assert.match(s, /tm_age/);
  assert.match(s, /\.\.\.ageFields\(age, guardian\)/);
  assert.match(s, /guardian_pending/);
});

test("the /confirm page explains a confirmation waiting for a parent, and one that needs an age", () => {
  assert.match(confirmCopy("guardian_pending", "IRhay").title, /parent/i);
  assert.match(confirmCopy("age_needed", "IRhay").title, /age/i);
});

test("privacy notice: the children section and the new version", () => {
  assert.equal(PRIVACY_NOTICE_VERSION, "fan-notice-2026-11-27");
  assert.equal(CHILDREN_HEADING, "Children and teenagers");
  assert.match(CHILDREN_BODY, /13 or older/);
  assert.match(CHILDREN_BODY, /parent/);
  const page = read("app/privacy/page.tsx");
  assert.match(page, /CHILDREN_HEADING/);
  assert.match(page, /CHILDREN_BODY/);
  assert.match(page, /PRIVACY_NOTICE_VERSION/);
  const api = teos("apps/api/src/modules/privacy/privacy.config.ts");
  if (api) assert.ok(api.includes('POLICY_VERSION = "' + PRIVACY_NOTICE_VERSION + '"'), "the notice version TEOS records consent under");
});
