// P-5 bfcache round, item 3 (24 Oct 2026): React hydration errors #425 / #418 / #423 on /irhay/. The event cards
// formatted the start time in the runtime's time zone, so the static HTML (built in UTC) and the browser's first
// render (visitor's zone) differed. The first render must be the same everywhere: a fixed zone (UTC), labelled, and
// built WITHOUT Intl/ICU (Node's ICU and the browser's ICU can differ, e.g. U+202F before AM/PM). After mount the
// card shows local time as before.
// Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { formatEventTimeUTC, formatEventTimeLocal, eventTimeText } from "../lib/eventTime.ts";

test("the first-render text is a fixed UTC string with an explicit label, plain ASCII spaces", () => {
  assert.equal(formatEventTimeUTC("2026-09-15T18:00:00Z"), "Sep 15, 2026 · 6:00 PM UTC");
  assert.equal(formatEventTimeUTC("2026-10-05T17:00:00.000Z"), "Oct 5, 2026 · 5:00 PM UTC");
  assert.equal(formatEventTimeUTC("2026-01-01T00:05:00Z"), "Jan 1, 2026 · 12:05 AM UTC");
  assert.equal(formatEventTimeUTC("2026-12-31T12:30:00Z"), "Dec 31, 2026 · 12:30 PM UTC");
  assert.equal(formatEventTimeUTC("2026-09-15T23:30:00+02:00"), "Sep 15, 2026 · 9:30 PM UTC", "offsets are converted to UTC");
  for (const bad of ["", "not a date", undefined, null]) assert.equal(formatEventTimeUTC(bad), "Date TBA");
  assert.equal(/[  ]/.test(formatEventTimeUTC("2026-09-15T18:00:00Z")), false, "no ICU narrow / no-break spaces");
});

test("the first-render text does not depend on the process time zone (build host vs visitor)", () => {
  const code = 'import("./lib/eventTime.ts").then(m => process.stdout.write(m.eventTimeText("2026-09-15T18:00:00Z", false)))';
  const run = (tz) => execFileSync(process.execPath, ["--input-type=module", "-e", code], { cwd: new URL("..", import.meta.url), env: { ...process.env, TZ: tz }, encoding: "utf8" });
  const outs = ["UTC", "America/New_York", "Africa/Lagos", "Asia/Kolkata", "Pacific/Kiritimati"].map(run);
  assert.deepEqual(new Set(outs).size, 1, JSON.stringify(outs));
  assert.equal(outs[0], "Sep 15, 2026 · 6:00 PM UTC");
});

test("after mount the card shows the visitor's local time exactly as before (no zone label)", () => {
  const iso = "2026-09-15T18:00:00Z"; const d = new Date(iso);
  const before = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  assert.equal(formatEventTimeLocal(iso), before);
  assert.equal(eventTimeText(iso, true), before);
  assert.equal(eventTimeText(iso, false), formatEventTimeUTC(iso));
  assert.equal(eventTimeText("", true), "Date TBA");
});

test("EventsBoard renders the UTC text until mounted, then local; inside a <time dateTime>; no runtime-zone text in render", () => {
  const src = readFileSync(new URL("../components/EventsBoard.tsx", import.meta.url), "utf8");
  assert.match(src, /import \{ eventTimeText \} from "\.\.\/lib\/eventTime"/);
  assert.match(src, /const \[mounted, setMounted\] = useState\(false\);/);
  assert.match(src, /useEffect\(\(\) => \{ setMounted\(true\); \}, \[\]\);/);
  assert.match(src, /<time dateTime=\{[^}]+\}>\{eventTimeText\(e\.startsAt, mounted\)\}<\/time>/);
  assert.doesNotMatch(src, /toLocale(Date|Time)?String/, "no locale/zone formatting during render");
  assert.doesNotMatch(src, /function fmtDate/);
});

test("no other client component renders runtime-zone or locale text during render", async () => {
  const { readdirSync } = await import("node:fs");
  const dir = new URL("../components/", import.meta.url);
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".tsx"))) {
    const src = readFileSync(new URL(f, dir), "utf8");
    if (!src.startsWith('"use client"')) continue;
    for (const m of src.matchAll(/toLocale(Date|Time)?String\(/g)) {
      // CommunityChat: message times exist only in client state filled by an effect (never in the server HTML).
      assert.equal(f, "CommunityChat.tsx", f + " formats locale text in render: " + m[0]);
    }
  }
});
