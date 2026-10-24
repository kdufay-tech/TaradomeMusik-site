// P-5 bfcache / sleep round (24 Oct 2026): the socket, not the channel callback, decides whether the chat is "live".
// Pins: resync (forced full re-subscribe), transport reset before the reopen, the watchdog (socket down, stale
// heartbeat, clock jump), the heartbeat monitor, the page-lifecycle triggers, and the old invariants (one channel,
// one reconnect per burst, growing backoff, everything cleared on stop). Fake clock + fake timers + EventTargets.
// Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createReconnector, createHeartbeatMonitor, watchPageLifecycle,
  WATCHDOG_MS, STALE_ACK_MS, CLOCK_JUMP_MS, LONG_HIDDEN_MS, STUCK_MS,
} from "../lib/realtimeReconnect.ts";

const flush = () => new Promise((r) => setImmediate(r));

function rig(opts = {}) {
  let clock = 1_000_000;
  const timers = []; const channels = []; const live = []; const order = []; const resyncs = []; const openTimes = [];
  let resub = 0; let hidden = false;
  const sock = { connected: true, lastAckAt: null };
  const h = {
    sock, timers, channels, live, order, resyncs, openTimes,
    get resub() { return resub; },
    get now() { return clock; },
    setHidden(v) { hidden = v; },
    deps: {
      open(onStatus) { const ch = { n: channels.length + 1, onStatus, open: true }; channels.push(ch); order.push("open:" + ch.n); openTimes.push(clock); return ch; },
      close(ch) { ch.open = false; order.push("close:" + ch.n); ch.onStatus("CLOSED"); return Promise.resolve("ok"); },
      reset() { order.push("reset"); sock.connected = false; return Promise.resolve("ok"); },
      health: () => ({ connected: sock.connected, lastAckAt: sock.lastAckAt }),
      isHidden: () => hidden,
      now: () => clock,
      setTimer(fn, ms) { const t = { fn, ms, due: clock + ms, cleared: false, fired: false }; timers.push(t); return t; },
      clearTimer(t) { if (t) t.cleared = true; },
      random: () => 0,
      onLive: (v) => live.push(v),
      onResubscribed: () => { resub += 1; },
      onResync: (why) => resyncs.push(why),
      ...opts,
    },
  };
  h.pending = () => timers.filter((t) => !t.cleared && !t.fired);
  /** Run every timer due within `ms`, in time order (timers they schedule included). */
  h.advance = async (ms) => {
    const end = clock + ms;
    await flush(); await flush();                            // let promise chains (close -> schedule) settle first
    for (;;) {
      const due = h.pending().filter((t) => t.due <= end).sort((a, b) => a.due - b.due)[0];
      if (!due) break;
      clock = Math.max(clock, due.due); due.fired = true; due.fn(); await flush(); await flush();
    }
    clock = end; await flush(); await flush();
  };
  /** The machine slept / the page was frozen: wall time moves on, no timer ran. */
  h.jump = (ms) => { clock += ms; };
  h.subscribe = () => { sock.connected = true; channels.at(-1).onStatus("SUBSCRIBED"); };
  h.openNow = () => channels.filter((c) => c.open);
  return h;
}

// ---------- resync ----------
test("resync from live: label off at once, channel removed, transport reset BEFORE the new channel, one rejoin, one back-fill", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  assert.deepEqual(h.live, [true]);
  assert.equal(r.resync("pageshow-bfcache"), "resync");
  assert.deepEqual(h.live, [true, false], "'reconnecting' from the first sign of trouble");
  await h.advance(0);
  assert.deepEqual(h.order, ["open:1", "close:1"]);
  await h.advance(1250);
  assert.deepEqual(h.order, ["open:1", "close:1", "reset", "open:2"], "fresh transport, then a fresh channel");
  h.channels[0].onStatus("SUBSCRIBED");
  assert.deepEqual(h.live, [true, false], "a SUBSCRIBED from the old channel cannot set 'live' again");
  h.subscribe();
  assert.deepEqual(h.live, [true, false, true]);
  assert.equal(h.resub, 1);
  assert.deepEqual(h.resyncs, ["pageshow-bfcache"]);
  r.stop();
});

test("a burst of triggers (pageshow, visible, resume, online, focus check) gives exactly one reconnect", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  const out = [r.resync("pageshow-bfcache", { fast: true }), r.resync("visible", { fast: true }), r.resync("resume", { fast: true }),
    r.resync("online", { fast: true }), r.check("focus")];
  assert.deepEqual(out, ["resync", "pending", "pending", "pending", "pending"]);
  await h.advance(5000);
  assert.equal(h.channels.length, 2);
  assert.equal(h.order.filter((x) => x === "reset").length, 1);
  assert.equal(h.pending().filter((t) => t.ms !== WATCHDOG_MS).length, 0, "nothing else queued");
  r.stop();
});

test("resync while a reconnect is waiting marks a transport reset and pulls a long wait in, without stacking timers", async () => {
  const WD = 7777;                                           // distinct from every backoff step
  const h = rig({ watchdogMs: WD }); const r = createReconnector(h.deps);
  r.start();
  for (let i = 0; i < 5; i++) { h.channels.at(-1).onStatus("CHANNEL_ERROR"); await h.advance(0); const w = h.pending().find((t) => t.ms !== WD); await h.advance(w.ms); }
  h.channels.at(-1).onStatus("CHANNEL_ERROR"); await h.advance(0);
  const wait = h.pending().find((t) => t.ms !== WD);
  assert.equal(wait.ms, 30000, "a long backoff wait (attempt 6)");
  h.sock.connected = true;                                   // pretend the socket looks fine: only the flag forces the reset
  assert.equal(r.resync("watchdog"), "pending", "no fast flag: the wait is kept");
  assert.equal(wait.cleared, false);
  assert.equal(r.resync("online", { fast: true }), "pending");
  assert.equal(wait.cleared, true, "the long wait is replaced");
  const fast = h.pending().filter((t) => t.ms !== WD);
  assert.deepEqual(fast.map((t) => t.ms), [1250], "one timer, at the first-step delay");
  const resetsBefore = h.order.filter((x) => x === "reset").length;
  await h.advance(1250);
  assert.equal(h.order.filter((x) => x === "reset").length, resetsBefore + 1, "the transport is reset before the reopen");
  assert.equal(r.state().attempts, 6, "pulling the wait in does not reset the backoff");
  r.stop();
});

test("after a channel failure the transport is reset only when the socket is not connected (a closed phoenix conn blocks connect())", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  h.channels[0].onStatus("CHANNEL_ERROR");                  // channel-level error, socket still fine
  await h.advance(1250);
  assert.deepEqual(h.order, ["open:1", "close:1", "open:2"], "no reset needed");
  h.subscribe();
  h.sock.connected = false;
  h.channels[1].onStatus("CHANNEL_ERROR");                  // the socket died
  await h.advance(2500);
  assert.deepEqual(h.order.slice(3), ["close:2", "reset", "open:3"]);
  r.stop();
});

// ---------- watchdog ----------
test("the incident: a dead socket with no channel event flips the label and reconnects within one watchdog period", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  h.sock.connected = false;                                  // no CHANNEL_ERROR, no CLOSED, nothing
  await h.advance(WATCHDOG_MS - 1);
  assert.deepEqual(h.live, [true], "not before the tick");
  await h.advance(1);
  assert.deepEqual(h.live, [true, false]);
  assert.deepEqual(h.resyncs, ["watchdog:socket-down"]);
  await h.advance(1250);
  assert.deepEqual(h.order, ["open:1", "close:1", "reset", "open:2"]);
  h.subscribe();
  assert.deepEqual(h.live, [true, false, true]);
  assert.equal(h.resub, 1);
  r.stop();
});

test("while visible, heartbeat acks keep it live; no ack for STALE_ACK_MS resyncs", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  for (let i = 0; i < 12; i++) { await h.advance(25000); h.sock.lastAckAt = h.now; }   // 5 minutes of healthy heartbeats
  assert.deepEqual(h.resyncs, []);
  const lastAck = h.now;
  await h.advance(STALE_ACK_MS - 5000);
  assert.deepEqual(h.resyncs, [], "not stale yet");
  await h.advance(10000 + WATCHDOG_MS);
  assert.deepEqual(h.resyncs, ["watchdog:stale"]);
  assert.ok(h.now - lastAck <= STALE_ACK_MS + WATCHDOG_MS + 10000);
  r.stop();
});

test("SUBSCRIBED counts as a fresh ack: a just-joined channel is not called stale by an old heartbeat time", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  h.sock.lastAckAt = h.now - 10 * 60000;                    // last ack 10 min ago (old socket)
  r.start(); h.subscribe();
  await h.advance(WATCHDOG_MS * 3);
  assert.deepEqual(h.resyncs, []);
  r.stop();
});

test("a clock jump while visible (the machine slept) resyncs once", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  await h.advance(WATCHDOG_MS);
  h.sock.lastAckAt = h.now;
  h.jump(CLOCK_JUMP_MS + WATCHDOG_MS + 1);                  // timers could not run
  await h.advance(0);
  assert.deepEqual(h.resyncs, ["watchdog:clock-jump"]);
  await h.advance(1250); h.subscribe();
  await h.advance(WATCHDOG_MS * 2);
  assert.deepEqual(h.resyncs, ["watchdog:clock-jump"], "only once");
  r.stop();
});

test("hidden: throttled ticks and old acks do not resync (no churn in background tabs); a socket that is down does", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  h.setHidden(true);
  for (let i = 0; i < 10; i++) { h.jump(60000); await h.advance(0); }   // ticks once a minute, no acks
  assert.deepEqual(h.resyncs, [], "hidden: no stale / clock-jump alarms");
  h.sock.connected = false;
  h.jump(60000); await h.advance(0);
  assert.deepEqual(h.resyncs, ["watchdog:socket-down"]);
  r.stop();
});

test("no tight loop: a socket that never becomes healthy is retried with a growing backoff, one timer at a time", async () => {
  const h = rig({ reset() { h.order.push("reset"); return Promise.resolve(); } });
  const r = createReconnector(h.deps);
  r.start();
  let maxPending = 0;
  for (let s = 0; s < 600; s++) {                            // 10 minutes in 1 s steps
    if (h.channels.at(-1).open && !r.state().live && r.state().phase === "joining") { h.channels.at(-1).onStatus("SUBSCRIBED"); h.sock.connected = false; }
    await h.advance(1000);
    maxPending = Math.max(maxPending, h.pending().length);
  }
  assert.ok(h.channels.length <= 25, "bounded re-joins in 10 min: " + h.channels.length);
  assert.ok(maxPending <= 2, "never more than {reconnect or stable} + watchdog pending: " + maxPending);
  const gaps = h.openTimes.slice(1).map((t, i) => t - h.openTimes[i]);
  assert.ok(gaps.slice(6).every((g) => g >= 30000), "once the backoff has grown, re-joins are >= 30 s apart: " + gaps.join(","));
  assert.ok(r.state().attempts >= 6, "attempts keep growing while it never stays healthy");
  r.stop();
});

test("a join that never answers, or a transport reset that never settles, is not waited on forever", async () => {
  const h = rig(); let hang = true;
  h.deps.reset = () => { h.order.push("reset"); return hang ? new Promise(() => {}) : Promise.resolve(); };
  const r = createReconnector(h.deps);
  r.start();                                                 // channel 1 never answers
  await h.advance(STUCK_MS + WATCHDOG_MS);
  assert.ok(h.resyncs.includes("watchdog:stuck-joining"), JSON.stringify(h.resyncs));
  h.sock.connected = false;
  await h.advance(2500);                                     // reopen needs a reset, which hangs
  assert.equal(r.state().phase, "resetting");
  await h.advance(STUCK_MS + WATCHDOG_MS);
  assert.ok(h.channels.length >= 2, "the hung reset was abandoned and a channel opened anyway");
  r.stop();
});

test("stop() clears the watchdog, the reconnect timer and the stable timer; resync/check afterwards do nothing", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  assert.equal(h.pending().length, 2, "stable timer + watchdog");
  r.stop();
  assert.equal(h.pending().length, 0);
  assert.equal(r.resync("online"), "ignored");
  assert.equal(r.check("focus"), "ignored");
  await h.advance(120000);
  assert.equal(h.channels.length, 1);
});

test("without a health source (old wiring) there is no watchdog timer", () => {
  const h = rig({ health: undefined }); const r = createReconnector(h.deps);
  r.start(); h.subscribe();
  assert.deepEqual(h.pending().map((t) => t.ms), [30000]);
  r.stop();
});

test("check(): healthy -> nothing; not connected -> resync; stale only when visible; not live -> pending", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start();
  assert.equal(r.check("focus"), "pending", "still joining");
  h.subscribe(); h.sock.lastAckAt = h.now;
  assert.equal(r.check("focus"), "healthy");
  h.jump(STALE_ACK_MS + 1);
  h.setHidden(true);
  assert.equal(r.check("visible"), "healthy", "hidden: heartbeat age is not trusted");
  h.setHidden(false);
  assert.equal(r.check("visible"), "resync");
  r.stop();
});

// ---------- heartbeat monitor ----------
test("heartbeat monitor: 'ok' records the ack time; 'timeout' and 'error' notify; other statuses do not; unsubscribe works", () => {
  let now = 5; const hb = createHeartbeatMonitor(() => now);
  const seen = []; const off = hb.onProblem((s) => seen.push(s));
  assert.equal(hb.lastAckAt(), null);
  hb.callback("sent"); hb.callback("ok", 12);
  assert.equal(hb.lastAckAt(), 5);
  now = 9; hb.callback("ok");
  assert.equal(hb.lastAckAt(), 9);
  hb.callback("timeout"); hb.callback("error"); hb.callback("disconnected"); hb.callback("sent");
  assert.deepEqual(seen, ["timeout", "error"]);
  assert.equal(hb.listenerCount(), 1);
  off();
  assert.equal(hb.listenerCount(), 0);
  hb.callback("timeout");
  assert.deepEqual(seen, ["timeout", "error"]);
  const bad = hb.onProblem(() => { throw new Error("listener bug"); });
  assert.doesNotThrow(() => hb.callback("timeout"), "a listener error never reaches realtime-js");
  bad();
});

// ---------- page lifecycle ----------
function page() {
  const win = new EventTarget(); const doc = new EventTarget(); doc.visibilityState = "visible";
  const fire = (target, type, props = {}) => { const e = new Event(type); for (const k in props) Object.defineProperty(e, k, { value: props[k] }); target.dispatchEvent(e); };
  return { win, doc, fire };
}
function fakeR() { const calls = []; return { calls, resync: (w, o) => { calls.push(["resync", w, !!(o && o.fast)]); return "resync"; }, check: (w) => { calls.push(["check", w]); return "healthy"; } }; }

test("lifecycle: pageshow persisted / resume / online force a fast resync; a normal pageshow does nothing", () => {
  const p = page(); const r = fakeR(); let now = 0;
  const detach = watchPageLifecycle(p.win, p.doc, r, { now: () => now });
  p.fire(p.win, "pageshow", { persisted: false });
  assert.deepEqual(r.calls, []);
  p.fire(p.win, "pageshow", { persisted: true });
  p.fire(p.doc, "resume");
  p.fire(p.win, "online");
  assert.deepEqual(r.calls, [["resync", "pageshow-bfcache", true], ["resync", "resume", true], ["resync", "online", true]]);
  detach();
});

test("lifecycle: visible after a long hide forces a resync, after a short hide only checks; focus checks only after idle", () => {
  const p = page(); const r = fakeR(); let now = 1000;
  const detach = watchPageLifecycle(p.win, p.doc, r, { now: () => now });
  p.doc.visibilityState = "hidden"; p.fire(p.doc, "visibilitychange");
  now += 5000; p.doc.visibilityState = "visible"; p.fire(p.doc, "visibilitychange");
  assert.deepEqual(r.calls, [["check", "visible"]]);
  p.doc.visibilityState = "hidden"; p.fire(p.doc, "visibilitychange");
  now += LONG_HIDDEN_MS; p.doc.visibilityState = "visible"; p.fire(p.doc, "visibilitychange");
  assert.deepEqual(r.calls.at(-1), ["resync", "visible-after-hidden", true]);
  r.calls.length = 0;
  now += 1000; p.fire(p.win, "focus");
  assert.deepEqual(r.calls, [], "focus right after a check: nothing");
  now += LONG_HIDDEN_MS; p.fire(p.win, "focus");
  assert.deepEqual(r.calls, [["check", "focus"]]);
  detach();
});

test("lifecycle: back after a long hide, but the channel was already rebuilt after the hide began (e.g. on resume) -> check only", () => {
  const p = page(); const r = fakeR(); let now = 1000;
  let st = { live: true, subscribedAt: 0 };
  r.state = () => st;
  const detach = watchPageLifecycle(p.win, p.doc, r, { now: () => now });
  p.doc.visibilityState = "hidden"; p.fire(p.doc, "visibilitychange");      // hidden at 1000
  now += 5 * 60000;
  st = { live: true, subscribedAt: now - 3000 };                             // rebuilt 3 s ago (resume resync)
  p.doc.visibilityState = "visible"; p.fire(p.doc, "visibilitychange");
  assert.deepEqual(r.calls, [["check", "visible"]], "no second re-join");
  p.doc.visibilityState = "hidden"; p.fire(p.doc, "visibilitychange");
  now += 5 * 60000;                                                          // this time nothing rebuilt it
  p.doc.visibilityState = "visible"; p.fire(p.doc, "visibilitychange");
  assert.deepEqual(r.calls.at(-1), ["resync", "visible-after-hidden", true]);
  st = { live: false, subscribedAt: now + 1 };                               // rebuild in progress: resync (coalesces)
  p.doc.visibilityState = "hidden"; p.fire(p.doc, "visibilitychange");
  now += 5 * 60000; st = { live: false, subscribedAt: now };
  p.doc.visibilityState = "visible"; p.fire(p.doc, "visibilitychange");
  assert.deepEqual(r.calls.at(-1), ["resync", "visible-after-hidden", true]);
  detach();
});

test("reconnector state() reports when the current channel subscribed", async () => {
  const h = rig(); const r = createReconnector(h.deps);
  r.start();
  assert.equal(r.state().subscribedAt, 0);
  await h.advance(5000); h.subscribe();
  assert.equal(r.state().subscribedAt, h.now);
  r.stop();
});

test("lifecycle: pagehide / freeze start the hidden clock (a bfcache or frozen stay counts as hidden time)", () => {
  const p = page(); const r = fakeR(); let now = 0;
  const detach = watchPageLifecycle(p.win, p.doc, r, { now: () => now });
  p.fire(p.doc, "freeze");
  now += LONG_HIDDEN_MS + 1; p.fire(p.doc, "visibilitychange");      // still "visible" in this fake
  assert.deepEqual(r.calls, [["resync", "visible-after-hidden", true]]);
  detach();
});

test("lifecycle: detach removes every listener", () => {
  const p = page(); const r = fakeR();
  const detach = watchPageLifecycle(p.win, p.doc, r, { now: () => 0 });
  detach();
  p.fire(p.win, "pageshow", { persisted: true }); p.fire(p.doc, "resume"); p.fire(p.win, "online");
  p.fire(p.doc, "visibilitychange"); p.fire(p.win, "focus"); p.fire(p.doc, "freeze"); p.fire(p.win, "pagehide");
  assert.deepEqual(r.calls, []);
});

test("CommunityChat wires the heartbeat monitor into the client and the page lifecycle into the feed", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../components/CommunityChat.tsx", import.meta.url), "utf8");
  assert.match(src, /createHeartbeatMonitor\(\)/);
  assert.match(src, /heartbeatCallback: heartbeat\.callback/);
  assert.match(src, /heartbeat,\s*\n?\s*lifecycle: typeof window !== "undefined" \? \{ win: window, doc: document \} : null/);
  assert.doesNotMatch(src, /addEventListener\("(unload|beforeunload)"/, "nothing that blocks the back/forward cache");
});
