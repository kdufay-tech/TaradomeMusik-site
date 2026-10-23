// P-5 (TEOS key rotation, plan L-4): the community chat runs on the publishable key, and Supabase caps public
// Realtime connections on a publishable key at 24 h. These tests pin the reconnect state machine, the message
// merge, the key-shape check and the Netlify build gate. Node >= 22.18 runs the .ts modules directly.
// Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { backoffDelay, mergeMessages, createReconnector, RECONNECT_STATUSES, MAX_KEPT_MESSAGES, HISTORY_LIMIT, communityHistoryUrl } from "../lib/realtimeReconnect.ts";
import { resolvePublishableKey, PUBLISHABLE_KEY_ENV } from "../lib/publishableKey.ts";

// ---------- backoff ----------
test("backoff grows exponentially from 2.5 s, is capped at 60 s, and stays inside its jitter band", () => {
  const lo = (a) => backoffDelay(a, undefined, () => 0);
  const hi = (a) => backoffDelay(a, undefined, () => 0.999999);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 20].map(lo), [1250, 2500, 5000, 10000, 20000, 30000, 30000, 30000]);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 20].map(hi), [2500, 5000, 10000, 20000, 40000, 60000, 60000, 60000]);
  assert.equal(backoffDelay(0, undefined, () => 0), 1250, "attempt below 1 counts as the first");
  assert.equal(backoffDelay(Number.NaN, undefined, () => 0), 1250);
  assert.equal(backoffDelay(3, { baseMs: 100, maxMs: 1000 }, () => 0.5), 300);
  for (let i = 0; i < 200; i++) {
    const d = backoffDelay(4);
    assert.ok(Number.isInteger(d) && d >= 10000 && d <= 20000, String(d));
  }
});

// ---------- merge ----------
const m = (id, t, extra = {}) => ({ id, created_at: "2026-10-22T10:00:" + String(t).padStart(2, "0") + "Z", body: id, ...extra });

test("merge drops duplicates by id, keeps the first copy, and orders by created_at", () => {
  const cur = [m("a", 1), m("c", 3)];
  const out = mergeMessages(cur, [m("b", 2), m("a", 1, { body: "changed" }), m("c", 3), m("d", 4)]);
  assert.deepEqual(out.map((x) => x.id), ["a", "b", "c", "d"]);
  assert.equal(out[0].body, "a", "an id already shown is not replaced");
  assert.equal(mergeMessages(out, [m("d", 4)]), out, "nothing new returns the same array (no re-render)");
});

test("merge ignores items without an id, tolerates odd timestamps and keeps only the newest MAX_KEPT_MESSAGES", () => {
  const out = mergeMessages([], [null, {}, { id: "" }, m("x", 5), { id: "y", created_at: "not a date", body: "y" }]);
  assert.deepEqual(out.map((x) => x.id), ["x", "y"], "an unparseable time sorts last, nothing throws");
  const many = Array.from({ length: MAX_KEPT_MESSAGES + 50 }, (_, i) => ({ id: "m" + i, created_at: new Date(1e12 + i * 1000).toISOString() }));
  const capped = mergeMessages([], many);
  assert.equal(capped.length, MAX_KEPT_MESSAGES);
  assert.equal(capped[0].id, "m50");
  assert.equal(capped.at(-1).id, "m" + (MAX_KEPT_MESSAGES + 49));
  assert.equal(mergeMessages([], many, 3).length, 3);
});

// ---------- history back-fill size (p5 fix 2, owner 22 Oct 2026: 100 instead of 60) ----------
test("the history GET asks for the latest 100, and the page keeps at least 200 (2 x the back-fill)", () => {
  assert.equal(HISTORY_LIMIT, 100);
  assert.ok(MAX_KEPT_MESSAGES >= 200, "in-memory cap is at least 200");
  assert.ok(MAX_KEPT_MESSAGES >= 2 * HISTORY_LIMIT, "a full back-fill never pushes out more than it brings");
  assert.equal(communityHistoryUrl("https://api.example/v1", "irhay"), "https://api.example/v1/public/artist/irhay/chat?limit=100");
  assert.equal(communityHistoryUrl("https://api.example/v1", "a b/c?d"), "https://api.example/v1/public/artist/a%20b%2Fc%3Fd/chat?limit=100");
  assert.equal(communityHistoryUrl("https://api.example/v1", "zv", 25), "https://api.example/v1/public/artist/zv/chat?limit=25");
});

test("first load of 100, live messages, then a reconnect back-fill of the newest 100: nothing lost, no duplicates", () => {
  const at = (i) => ({ id: "h" + i, created_at: new Date(2e12 + i * 1000).toISOString(), body: "h" + i });
  const range = (a, b) => Array.from({ length: b - a }, (_, k) => at(a + k));
  let held = mergeMessages([], range(0, HISTORY_LIMIT));              // first load: h0..h99
  held = mergeMessages(held, range(100, 130));                        // 30 live messages: h100..h129
  assert.equal(held.length, 130);
  // dropped for a while; h130..h159 were broadcast meanwhile; the back-fill returns the newest 100 = h60..h159
  held = mergeMessages(held, range(60, 160));
  assert.equal(held.length, 160, "70 overlapping are deduped, 30 missed are added");
  assert.deepEqual(held.map((x) => x.id), range(0, 160).map((x) => x.id), "ascending, contiguous, no duplicates");
  held = mergeMessages(held, range(160, 260));                        // 100 more live
  assert.equal(held.length, MAX_KEPT_MESSAGES);
  assert.equal(held[0].id, "h" + (260 - MAX_KEPT_MESSAGES));
  assert.equal(held.at(-1).id, "h259");
});

// ---------- reconnector harness ----------
function harness(opts = {}) {
  const timers = []; const channels = []; const closed = []; const live = []; let resub = 0;
  const h = {
    timers, channels, closed, live, get resub() { return resub; },
    openThrows: 0, syncStatus: null,
    deps: {
      open(onStatus) {
        if (h.openThrows > 0) { h.openThrows -= 1; throw new Error("tried to subscribe multiple times"); }
        const ch = { n: channels.length + 1, onStatus, open: true };
        channels.push(ch);
        if (h.syncStatus) { const s = h.syncStatus; h.syncStatus = null; onStatus(s); }
        return ch;
      },
      close(ch) { ch.open = false; closed.push(ch.n); ch.onStatus("CLOSED"); return Promise.resolve("ok"); },  // removeChannel fires CLOSED
      setTimer(fn, ms) { const t = { fn, ms, cleared: false }; timers.push(t); return t; },
      clearTimer(t) { t.cleared = true; },
      random: () => 0,
      onLive: (v) => live.push(v),
      onResubscribed: () => { resub += 1; },
      ...opts,
    },
  };
  h.fire = async () => { const t = timers.filter((x) => !x.cleared && !x.fired).at(-1); assert.ok(t, "a timer is pending"); t.fired = true; t.fn(); await flush(); };
  h.pending = () => timers.filter((x) => !x.cleared && !x.fired);
  h.openNow = () => channels.filter((c) => c.open);
  return h;
}
const flush = () => new Promise((r) => setImmediate(r));

test("the reconnect statuses are exactly CLOSED, CHANNEL_ERROR and TIMED_OUT", () => {
  assert.deepEqual([...RECONNECT_STATUSES].sort(), ["CHANNEL_ERROR", "CLOSED", "TIMED_OUT"]);
});

test("24 h cap: a server CLOSED tears the channel down, waits, subscribes again and back-fills once", async () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start();
  assert.equal(h.channels.length, 1);
  h.channels[0].onStatus("SUBSCRIBED");
  assert.deepEqual(h.live, [true]);
  assert.equal(h.resub, 0, "the first subscribe is not a re-subscribe");
  h.channels[0].onStatus("CLOSED");                       // the server ends the public connection
  await flush();
  assert.deepEqual(h.closed, [1], "the old channel is removed exactly once");
  assert.deepEqual(h.live, [true, false]);
  assert.equal(h.pending().length, 1, "exactly one reconnect is scheduled (the CLOSED from removeChannel is ignored)");
  assert.equal(h.pending()[0].ms, 1250);
  await h.fire();
  assert.equal(h.channels.length, 2, "a new channel is opened");
  h.channels[1].onStatus("SUBSCRIBED");
  assert.deepEqual(h.live, [true, false, true]);
  assert.equal(h.resub, 1, "history is refetched once after the re-subscribe");
  assert.equal(r.state().attempts, 1, "SUBSCRIBED alone does not reset the backoff (F-4 flapping guard)");
  assert.deepEqual(h.pending().map((t) => t.ms), [30000], "only the stable-period timer is pending while live");
  await h.fire();                                         // the channel stayed up for the stable period
  assert.equal(r.state().attempts, 0, "a stable SUBSCRIBED resets the backoff");
});

test("CHANNEL_ERROR then TIMED_OUT for one failure schedules one reconnect, and the backoff grows until a stable SUBSCRIBED", async () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start();
  h.channels[0].onStatus("CHANNEL_ERROR");
  h.channels[0].onStatus("TIMED_OUT");
  await flush();
  assert.equal(h.pending().length, 1);
  assert.deepEqual(h.closed, [1]);
  await h.fire(); h.channels[1].onStatus("TIMED_OUT"); await flush();
  await h.fire(); h.channels[2].onStatus("CHANNEL_ERROR"); await flush();
  assert.deepEqual(h.timers.map((t) => t.ms), [1250, 2500, 5000]);
  await h.fire(); h.channels[3].onStatus("SUBSCRIBED");
  await h.fire();                                         // stayed SUBSCRIBED for the stable period
  h.channels[3].onStatus("CLOSED"); await flush();
  assert.equal(h.timers.at(-1).ms, 1250, "after a stable subscribe the next failure starts from the bottom again");
  assert.equal(r.state().attempts, 1);
});

test("over many 24 h cycles there is never more than one open channel and never a stacked timer", async () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start();
  for (let day = 0; day < 30; day++) {
    const ch = h.channels.at(-1);
    ch.onStatus("SUBSCRIBED");
    await h.fire();                                       // up for (much more than) the stable period
    ch.onStatus("CLOSED"); ch.onStatus("CHANNEL_ERROR");
    await flush();
    assert.equal(h.openNow().length, 0);
    assert.equal(h.pending().length, 1);
    assert.equal(h.pending()[0].ms, 1250, "a long-lived channel reconnects from the bottom of the backoff");
    await h.fire();
    assert.equal(h.openNow().length, 1);
  }
  assert.equal(h.channels.length, 31);
  assert.equal(h.resub, 29, "every re-subscribe but the first subscribe refetches");
});

test("a late status from an old channel is ignored", async () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start();
  const first = h.channels[0];
  first.onStatus("CLOSED"); await flush(); await h.fire();
  first.onStatus("SUBSCRIBED"); first.onStatus("CHANNEL_ERROR");
  await flush();
  assert.deepEqual(h.live, [], "the old channel cannot flip the live dot (it was never live)");
  assert.equal(r.state().live, false);
  assert.equal(h.pending().length, 0);
  assert.equal(h.channels.length, 2);
});

test("stop() during the wait clears the timer, removes nothing twice and ignores everything after", async () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start();
  h.channels[0].onStatus("CLOSED"); await flush();
  r.stop();
  assert.equal(h.pending().length, 0);
  h.channels[0].onStatus("CHANNEL_ERROR"); await flush();
  assert.equal(h.channels.length, 1, "no new channel after stop");
  assert.deepEqual(h.closed, [1]);
  r.start();
  assert.equal(h.channels.length, 1, "a stopped reconnector does not restart");
});

test("stop() while live removes the current channel once", async () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start(); h.channels[0].onStatus("SUBSCRIBED");
  r.stop(); await flush();
  assert.deepEqual(h.closed, [1]);
  assert.equal(h.pending().length, 0);
});

test("stop() while removeChannel is still pending schedules nothing", async () => {
  let release; const h = harness({ close: (ch) => { ch.open = false; h.closed.push(ch.n); return new Promise((res) => { release = res; }); } });
  const r = createReconnector(h.deps);
  r.start();
  h.channels[0].onStatus("TIMED_OUT");
  await flush();                                // removeChannel has been called and is still pending
  assert.equal(typeof release, "function");
  r.stop();
  release("ok"); await flush();
  assert.equal(h.pending().length, 0);
  assert.equal(h.channels.length, 1);
});

test("the next channel is opened only after removeChannel has settled (supabase.channel would re-use a registered one)", async () => {
  let release; const h = harness({ close: (ch) => { ch.open = false; h.closed.push(ch.n); return new Promise((res) => { release = res; }); } });
  const r = createReconnector(h.deps);
  r.start(); h.channels[0].onStatus("SUBSCRIBED");
  h.channels[0].onStatus("CLOSED");
  await flush(); await flush();
  assert.equal(h.pending().length, 0, "no reconnect is scheduled while the old channel is still being removed");
  release("ok"); await flush();
  assert.equal(h.pending().length, 1);
  await h.fire();
  assert.equal(h.channels.length, 2);
  r.stop();
});

test("listenCommunityFeed never binds a handler twice to a channel object that supabase.channel() hands back again", async () => {
  const { listenCommunityFeed } = await import("../lib/realtimeReconnect.ts");
  const mk = (n) => ({ n, ons: 0, cb: null, on(type, filter, cb) { this.ons += 1; this.handler = cb; return this; }, subscribe(cb) { this.cb = cb; return this; } });
  const stuck = mk(1); const fresh = mk(2);
  let next = stuck; const removed = []; const got = [];
  const client = { channel: () => next, removeChannel: (ch) => { removed.push(ch.n); return Promise.resolve("ok"); } };
  const r = listenCommunityFeed(client, "community:x", true, { onMessage: (p) => got.push(p.id), backoff: { baseMs: 4, maxMs: 8 } });
  assert.equal(stuck.ons, 1);
  stuck.cb("SUBSCRIBED");
  stuck.handler({ payload: { id: "a" } });
  stuck.handler({ payload: { noid: 1 } }); stuck.handler({}); stuck.handler(null);
  stuck.cb("CLOSED");                                         // removal "fails": the client keeps returning `stuck`
  await new Promise((res) => setTimeout(res, 60));
  assert.equal(stuck.ons, 1, "the re-used channel was not bound a second time");
  assert.ok(removed.filter((n) => n === 1).length >= 2, "it was removed again instead");
  next = fresh;                                               // the client now creates a new channel
  await new Promise((res) => setTimeout(res, 80));
  assert.equal(fresh.ons, 1);
  fresh.cb("SUBSCRIBED");
  fresh.handler({ payload: { id: "b" } });
  assert.deepEqual(got, ["a", "b"], "only payloads with an id reach onMessage, once each");
  r.stop();
});

test("open() throwing (e.g. a re-used channel) counts as a failed attempt and is retried", async () => {
  const h = harness(); h.openThrows = 2;
  const r = createReconnector(h.deps);
  r.start(); await flush();
  assert.equal(h.channels.length, 0);
  assert.deepEqual(h.pending().map((t) => t.ms), [1250]);
  await h.fire();
  assert.deepEqual(h.pending().map((t) => t.ms), [2500]);
  await h.fire();
  assert.equal(h.channels.length, 1);
  h.channels[0].onStatus("SUBSCRIBED");
  assert.equal(r.state().attempts, 2, "not reset until the channel has stayed up");
  await h.fire();
  assert.equal(r.state().attempts, 0);
});

// ---------- F-4 flapping guard ----------
test("flapping (join accepted, then dropped at once) backs off instead of resetting on every SUBSCRIBED", async () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start();
  const delays = [];
  for (let i = 0; i < 8; i++) {
    const ch = h.channels.at(-1);
    ch.onStatus("SUBSCRIBED");
    ch.onStatus("CLOSED");                                // the server drops it straight away
    await flush();
    assert.equal(h.pending().length, 1, "only the reconnect timer is pending (the stable timer was cleared)");
    delays.push(h.pending()[0].ms);
    await h.fire();
  }
  assert.deepEqual(delays, [1250, 2500, 5000, 10000, 20000, 30000, 30000, 30000], "exponential up to the cap (random 0)");
  assert.equal(h.resub, 7, "one history refetch per re-subscribe, so refetches are bounded by the same backoff");
  assert.equal(h.openNow().length, 1);
  assert.equal(h.pending().length, 0, "no stable timer leaks (the 9th channel has not subscribed yet)");
  assert.equal(r.state().attempts, 8);
  r.stop();
});

test("the backoff resets only once the channel has stayed SUBSCRIBED for the whole stable period", async () => {
  const h = harness({ stableMs: 45000 }); const r = createReconnector(h.deps);
  r.start();
  h.channels[0].onStatus("CLOSED"); await flush(); await h.fire();      // attempts 1
  h.channels[1].onStatus("TIMED_OUT"); await flush(); await h.fire();   // attempts 2
  h.channels[2].onStatus("SUBSCRIBED");
  const stable = h.pending();
  assert.deepEqual(stable.map((t) => t.ms), [45000], "stableMs is configurable");
  assert.equal(r.state().attempts, 2);
  h.channels[2].onStatus("CLOSED"); await flush();                     // dropped before the period ended
  assert.equal(stable[0].cleared, true, "a failure cancels the stable timer");
  assert.equal(h.pending()[0].ms, 5000, "and the backoff keeps growing");
  await h.fire();
  h.channels[3].onStatus("SUBSCRIBED");
  h.channels[3].onStatus("SUBSCRIBED");
  assert.equal(h.pending().length, 1, "a repeated SUBSCRIBED arms no second stable timer");
  assert.equal(r.state().attempts, 3);
  await h.fire();
  assert.equal(r.state().attempts, 0);
  h.channels[3].onStatus("SUBSCRIBED");
  assert.equal(h.pending().length, 0, "nor after the channel is already stable");
  h.channels[3].onStatus("CLOSED"); await flush();
  assert.equal(h.pending()[0].ms, 1250);
  r.stop();
  assert.equal(h.pending().length, 0);
});

test("stop() while the stable timer is pending clears it", () => {
  const h = harness(); const r = createReconnector(h.deps);
  r.start(); h.channels[0].onStatus("SUBSCRIBED");
  const stable = h.pending();
  assert.deepEqual(stable.map((t) => t.ms), [30000]);
  r.stop();
  assert.equal(stable[0].cleared, true);
  assert.equal(h.pending().length, 0);
});

test("a stable timer that fires late for an old channel does not reset the backoff", async () => {
  // A clearTimer that does nothing models a timer that still fires after its channel failed.
  const h = harness({ clearTimer: () => {} }); const r = createReconnector(h.deps);
  r.start();
  h.channels[0].onStatus("SUBSCRIBED");
  const stale = h.timers[0];
  h.channels[0].onStatus("CLOSED"); await flush();
  assert.equal(r.state().attempts, 1);
  stale.fired = true; stale.fn();
  assert.equal(r.state().attempts, 1, "the old generation's stable timer is ignored");
  r.stop();
});

// ---------- F-5 first history load ----------
test("the first history load is retried once after a backoff, then given up; nothing retries after unmount", async () => {
  const { loadWithRetry } = await import("../lib/realtimeReconnect.ts");
  const sleeps = []; const sleep = (ms) => { sleeps.push(ms); return Promise.resolve(); };
  const delayMs = (n) => backoffDelay(n, undefined, () => 0);
  let calls = 0;
  const flaky = () => { calls += 1; return calls === 1 ? Promise.reject(new Error("down")) : Promise.resolve("ok"); };
  assert.equal(await loadWithRetry(flaky, { retries: 1, delayMs, sleep }), "ok");
  assert.equal(calls, 2); assert.deepEqual(sleeps, [1250]);

  calls = 0; sleeps.length = 0;
  const down = () => { calls += 1; return Promise.reject(new Error("down " + calls)); };
  await assert.rejects(loadWithRetry(down, { retries: 1, delayMs, sleep }), /down 2/);
  assert.equal(calls, 2, "exactly one retry"); assert.deepEqual(sleeps, [1250]);

  calls = 0; sleeps.length = 0;
  await assert.rejects(loadWithRetry(down, { retries: 1, delayMs, sleep, alive: () => false }), /down 1/);
  assert.equal(calls, 1, "no retry once the component is gone");

  calls = 0; sleeps.length = 0; let alive = true;
  const sleepThenUnmount = (ms) => { sleeps.push(ms); alive = false; return Promise.resolve(); };
  await assert.rejects(loadWithRetry(down, { retries: 1, delayMs, sleep: sleepThenUnmount, alive: () => alive }), /down 1/);
  assert.equal(calls, 1, "unmounted during the wait: no retry");

  calls = 0; sleeps.length = 0;
  assert.equal(await loadWithRetry(() => { calls += 1; return Promise.resolve(7); }, { retries: 1, delayMs, sleep }), 7);
  assert.equal(calls, 1); assert.deepEqual(sleeps, [], "no wait when the first try works");

  calls = 0;
  await assert.rejects(loadWithRetry(down, { sleep }), /down 2/, "defaults: one retry");
  assert.equal(calls, 2);
});

test("CommunityChat uses the retrying first load and shows 'off' when history cannot be loaded", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../components/CommunityChat.tsx", import.meta.url), "utf8");
  assert.match(src, /loadWithRetry\(loadHistory/);
  assert.match(src, /r\.status >= 500 \|\| r\.status === 429/);
  assert.match(src, /\.catch\(\(\) => \{ if \(alive\) setFeed\("off"\); \}\)/);
});

test("CommunityChat loads history (first load and re-subscribe back-fill) through communityHistoryUrl only", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../components/CommunityChat.tsx", import.meta.url), "utf8");
  assert.match(src, /const historyUrl = communityHistoryUrl\(TEOS_API, slug\);/);
  assert.equal((src.match(/fetch\(historyUrl\)/g) || []).length, 1, "one history fetch, shared by first load and back-fill");
  assert.match(src, /onResubscribed: \(\) => \{\s*loadHistory\(\)/, "the back-fill reuses loadHistory");
  assert.doesNotMatch(src, /"\/chat"\)?;?\s*$/m, "no hand-built history URL without the limit");
});

test("a failure reported synchronously inside open() still removes that channel and retries once", async () => {
  const h = harness(); h.syncStatus = "CHANNEL_ERROR";
  const r = createReconnector(h.deps);
  r.start(); await flush();
  assert.deepEqual(h.closed, [1]);
  assert.equal(h.pending().length, 1);
  await h.fire();
  assert.equal(h.channels.length, 2);
});

test("removeChannel rejecting does not stop the reconnect", async () => {
  const h = harness({ close: (ch) => { ch.open = false; h.closed.push(ch.n); return Promise.reject(new Error("timed out")); } });
  const r = createReconnector(h.deps);
  r.start(); h.channels[0].onStatus("CLOSED"); await flush();
  assert.equal(h.pending().length, 1);
});

// ---------- publishable key ----------
test("only an sb_publishable_ key is accepted; legacy JWTs, secret keys and blanks are refused by name", () => {
  assert.equal(PUBLISHABLE_KEY_ENV, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const ok = resolvePublishableKey("  sb_publishable_AbC-123_xyz  ");
  assert.deepEqual(ok, { ok: true, key: "sb_publishable_AbC-123_xyz" });
  assert.deepEqual(resolvePublishableKey(undefined), { ok: false, reason: "missing" });
  assert.deepEqual(resolvePublishableKey("   "), { ok: false, reason: "missing" });
  assert.deepEqual(resolvePublishableKey("eyJ-FAKE-HEADER.eyJ-FAKE-BODY.fake"), { ok: false, reason: "legacy-jwt" });
  assert.deepEqual(resolvePublishableKey("sb_secret_abcdef"), { ok: false, reason: "secret-key" });
  assert.deepEqual(resolvePublishableKey("sb_publishable_"), { ok: false, reason: "unrecognised" });
  assert.deepEqual(resolvePublishableKey("sb_publishable_has space"), { ok: false, reason: "unrecognised" });
  assert.deepEqual(resolvePublishableKey("anything-else"), { ok: false, reason: "unrecognised" });
  for (const bad of ["eyJx.eyJy.z", "sb_secret_abcdef"]) assert.equal(JSON.stringify(resolvePublishableKey(bad)).includes(bad), false, "a refused value is never echoed");
});

// ---------- Netlify build gate ----------
test("the build gate refuses a missing or wrong key on Netlify and in CI, and only warns locally", async () => {
  const { publishableKeyProblems, assertPublishableKey } = await import("../release-gate.mjs");
  const good = "sb_publishable_AbC123";
  assert.deepEqual(publishableKeyProblems({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: good }), []);
  assert.match(publishableKeyProblems({}).join(), /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set/);
  assert.match(publishableKeyProblems({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "eyJa.eyJb.c" }).join(), /legacy JWT/);
  assert.match(publishableKeyProblems({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_x1" }).join(), /secret key/i);
  for (const host of [{ NETLIFY: "true" }, { CONTEXT: "production" }, { CONTEXT: "deploy-preview" }, { CI: "true" }]) {
    assert.throws(() => assertPublishableKey(host), /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/, JSON.stringify(host));
    assert.throws(() => assertPublishableKey({ ...host, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_zz" }), /secret key/i);
    assert.doesNotThrow(() => assertPublishableKey({ ...host, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: good }));
  }
  const warnings = [];
  assert.doesNotThrow(() => assertPublishableKey({}, (w) => warnings.push(w)));
  assert.equal(warnings.length, 1, "a local build without the key warns once");
  try { assertPublishableKey({ NETLIFY: "true", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_DONOTECHO" }); }
  catch (e) { assert.equal(String(e.message).includes("DONOTECHO"), false, "the gate never prints the value"); }
});

test("next.config.mjs runs the key gate and CommunityChat holds no key literal and reads only the publishable variable", async () => {
  const { readFileSync } = await import("node:fs");
  const cfg = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8");
  assert.match(cfg, /assertPublishableKey\(process\.env\)/);
  const src = readFileSync(new URL("../components/CommunityChat.tsx", import.meta.url), "utf8");
  assert.equal(/eyJ[A-Za-z0-9_-]{8,}\./.test(src), false, "no JWT literal");
  assert.equal(/sb_(publishable|secret)_[A-Za-z0-9]/.test(src), false, "no new-format key literal");
  assert.equal(src.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"), false, "the legacy variable is not read any more");
  assert.match(src, /process\.env\.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/, "literal process.env access so Next inlines it");
});
