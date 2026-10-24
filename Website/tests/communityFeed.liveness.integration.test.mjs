// P-5 bfcache / sleep round (24 Oct 2026): the REAL supabase-js (package-lock: 2.110.8, realtime-js 2.110.8,
// @supabase/phoenix 0.4.5) against the local Phoenix-style server in tests/fakeRealtime.mjs. No network, no key.
//
// Incident (Sat 24 Oct): a fan tab left open ~26 h kept saying "live" but never reconnected. Root cause: on a bfcache
// restore phoenix opens a new socket in `pageshow` before the OLD socket's close event arrives; the late
// Socket.onConnClose() then runs `this.conn.onclose = () => {}` on the NEW socket. From then on a dead socket reports
// nothing to the channel, phoenix schedules no reconnect, the heartbeat stops at "disconnected", and connect() is a
// no-op while the closed conn is still set. Test 1 shows that state with the real library; tests 2-6 show the fix.
// Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { listenCommunityFeed, createHeartbeatMonitor } from "../lib/realtimeReconnect.ts";
import { startServer, broadcast, dropSockets, blackholeSockets, waitFor, pause, TOPIC } from "./fakeRealtime.mjs";

const KEY = "sb_publishable_" + "TESTONLY000";
const msg = (id) => ({ id, created_at: new Date().toISOString(), body: id });

function client(port, hb, extra = {}) {
  return createClient("http://127.0.0.1:" + port, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 5 }, reconnectAfterMs: () => 100, ...(hb ? { heartbeatCallback: hb.callback } : {}), ...extra },
  });
}
/**
 * The incident state, as the browser sees it. (1) What phoenix's Socket.onConnClose does to the CURRENT conn when a
 * stale socket's close event arrives late: `this.conn.onclose = () => {}`. (2) Chromium/Edge fire ONLY `close` (1006)
 * when the server resets or ends the TCP connection, no `error`; Node's undici fires `error` first, which phoenix would
 * turn into CHANNEL_ERROR. Checked in Edge 155 vs Node 24 on 24 Oct 2026 (p5-bfcache-report section 2). So, to model
 * the browser, the conn's `onerror` is silenced as well.
 */
const disableCurrentOnclose = (sb) => {
  const conn = sb.realtime.socketAdapter.getSocket().conn;
  conn.onclose = () => {};
  conn.onerror = () => {};
};
const fakePage = () => {
  let listeners = 0;
  const counted = () => {
    const t = new EventTarget(); const add = t.addEventListener.bind(t); const rm = t.removeEventListener.bind(t);
    t.addEventListener = (type, fn, o) => { listeners += 1; add(type, fn, o); };
    t.removeEventListener = (type, fn, o) => { listeners -= 1; rm(type, fn, o); };
    return t;
  };
  const win = counted(); const doc = counted(); doc.visibilityState = "visible";
  const fire = (target, type, props = {}) => { const e = new Event(type); for (const k in props) Object.defineProperty(e, k, { value: props[k] }); target.dispatchEvent(e); };
  return { win, doc, fire, listeners: () => listeners };
};
async function cleanup(sb, server, state, feed) {
  if (feed) feed.stop();
  await sb.removeAllChannels().catch(() => {});
  for (const c of state.sockets) c.socket.destroy();
  await new Promise((res) => server.close(res));
}

test("root cause, real library: with the current socket's onclose disabled, a dead socket reports nothing and nothing reconnects", async () => {
  const { server, state, port } = await startServer();
  const beats = [];
  const sb = client(port, null, { heartbeatIntervalMs: 150, heartbeatCallback: (s) => beats.push(s) });
  const statuses = [];
  sb.channel(TOPIC, { config: { private: true } }).on("broadcast", { event: "message" }, () => {}).subscribe((s) => statuses.push(String(s)));
  try {
    await waitFor(() => statuses.includes("SUBSCRIBED") && beats.includes("ok"), "SUBSCRIBED + a heartbeat ack");
    disableCurrentOnclose(sb);
    dropSockets(state);                                   // the network / server ends the socket
    await pause(1500);                                    // 10 heartbeat periods
    assert.equal(sb.realtime.isConnected(), false, "the socket is gone");
    assert.deepEqual(statuses, ["SUBSCRIBED"], "but the channel reported nothing: no CHANNEL_ERROR, no CLOSED -> the page stays 'live'");
    assert.equal(beats.includes("timeout"), false, "the heartbeat never times out: sendHeartbeat() stops at 'disconnected'");
    assert.equal(state.handshakes, 1, "phoenix scheduled no reconnect");
    sb.realtime.connect();                                // what RealtimeChannel.subscribe() does
    await pause(300);
    assert.equal(state.handshakes, 1, "connect() is a no-op while the closed conn is still set");
    assert.equal(sb.realtime.connectionState(), "closed");
  } finally { await cleanup(sb, server, state); }
});

test("the incident, fixed: the watchdog sees the socket is down, says 'reconnecting', resets the transport, rejoins once and back-fills", async () => {
  const { server, state, port } = await startServer();
  const hb = createHeartbeatMonitor();
  const sb = client(port, hb);
  const got = []; const live = []; let resub = 0;
  const feed = listenCommunityFeed(sb, TOPIC, true, {
    onMessage: (p) => got.push(p.id), onLive: (v) => live.push(v), onResubscribed: () => { resub += 1; },
    backoff: { baseMs: 40, maxMs: 200 }, heartbeat: hb, watchdogMs: 150, lifecycle: null,
  });
  try {
    await waitFor(() => live.at(-1) === true, "first SUBSCRIBED");
    broadcast(state, msg("m1")); await waitFor(() => got.includes("m1"), "m1");
    disableCurrentOnclose(sb);
    dropSockets(state);
    await waitFor(() => live.at(-1) === false, "label leaves 'live' without any channel event", 3000);
    await waitFor(() => state.joins === 2 && live.at(-1) === true, "fresh socket + rejoin", 5000);
    assert.equal(state.handshakes, 2, "a NEW socket was opened (transport reset), exactly one");
    await pause(600);                                     // room for any (wrong) extra rejoin
    assert.equal(state.joins, 2, "exactly one rejoin");
    assert.equal(resub, 1, "history back-filled once");
    assert.equal(broadcast(state, msg("m2")), 1);
    await waitFor(() => got.includes("m2"), "m2");
    await pause(100);
    assert.deepEqual(got, ["m1", "m2"], "each message once");
    assert.equal(state.maxJoined, 1, "never two joined channels");
    assert.deepEqual(live, [true, false, true]);
  } finally { await cleanup(sb, server, state, feed); }
});

test("bfcache restore: pageshow (persisted) with a socket the browser closed forces a full re-subscribe at once", async () => {
  const { server, state, port } = await startServer();
  const hb = createHeartbeatMonitor();
  const sb = client(port, hb);
  const page = fakePage();
  const got = []; const live = []; let resub = 0;
  const feed = listenCommunityFeed(sb, TOPIC, true, {
    onMessage: (p) => got.push(p.id), onLive: (v) => live.push(v), onResubscribed: () => { resub += 1; },
    backoff: { baseMs: 40, maxMs: 200 }, heartbeat: hb, watchdogMs: 600000, lifecycle: { win: page.win, doc: page.doc },
  });
  try {
    await waitFor(() => live.at(-1) === true, "first SUBSCRIBED");
    page.fire(page.win, "pageshow", { persisted: false });   // a normal pageshow changes nothing
    await pause(300);
    assert.equal(state.joins, 1);
    disableCurrentOnclose(sb);                               // the page was frozen; the browser closed the socket
    dropSockets(state);
    await pause(400);
    assert.equal(live.at(-1), true, "no channel event and no watchdog tick yet: only the lifecycle event can help");
    page.fire(page.win, "pageshow", { persisted: true });
    await waitFor(() => state.joins === 2 && live.at(-1) === true, "re-subscribed after pageshow", 3000);
    assert.equal(state.handshakes, 2);
    assert.equal(resub, 1);
    broadcast(state, msg("after-restore"));
    await waitFor(() => got.includes("after-restore"), "message after restore");
    assert.equal(state.maxJoined, 1);
  } finally { await cleanup(sb, server, state, feed); }
});

test("a burst of lifecycle events (pageshow, resume, online, visible after a long hide) gives exactly one rejoin", async () => {
  const { server, state, port } = await startServer();
  const hb = createHeartbeatMonitor();
  const sb = client(port, hb);
  const page = fakePage();
  const live = [];
  const feed = listenCommunityFeed(sb, TOPIC, true, {
    onMessage: () => {}, onLive: (v) => live.push(v), backoff: { baseMs: 40, maxMs: 200 },
    heartbeat: hb, watchdogMs: 600000, lifecycle: { win: page.win, doc: page.doc }, longHiddenMs: 50,
  });
  try {
    await waitFor(() => live.at(-1) === true, "first SUBSCRIBED");
    page.doc.visibilityState = "hidden"; page.fire(page.doc, "visibilitychange");
    page.fire(page.doc, "freeze");
    await pause(120);
    page.doc.visibilityState = "visible";
    page.fire(page.doc, "resume"); page.fire(page.doc, "visibilitychange");
    page.fire(page.win, "pageshow", { persisted: true }); page.fire(page.win, "online"); page.fire(page.win, "focus");
    await waitFor(() => state.joins === 2 && live.at(-1) === true, "one rejoin", 3000);
    await pause(700);
    assert.equal(state.joins, 2, "exactly one rejoin for the whole burst");
    assert.equal(state.handshakes, 2, "and one new socket");
    assert.equal(state.maxJoined, 1);
    assert.deepEqual(live, [true, false, true]);
  } finally { await cleanup(sb, server, state, feed); }
});

test("a dead peer (no heartbeat answers) leads to exactly one rejoin, and nothing more afterwards", async () => {
  const { server, state, port } = await startServer();
  const hb = createHeartbeatMonitor();
  const sb = client(port, hb, { heartbeatIntervalMs: 150 });
  const live = []; let resub = 0; const got = [];
  const feed = listenCommunityFeed(sb, TOPIC, true, {
    onMessage: (p) => got.push(p.id), onLive: (v) => live.push(v), onResubscribed: () => { resub += 1; },
    backoff: { baseMs: 40, maxMs: 200 }, heartbeat: hb, watchdogMs: 600000, lifecycle: null,
  });
  try {
    await waitFor(() => live.at(-1) === true && hb.lastAckAt() !== null, "SUBSCRIBED + ack");
    blackholeSockets(state);                                 // PC asleep / half-open TCP: nothing comes back
    await waitFor(() => state.joins === 2 && live.at(-1) === true, "rejoin after heartbeat timeout", 4000);
    await pause(1000);
    assert.equal(state.joins, 2, "heartbeat timeout + channel error + monitor: still one rejoin");
    assert.equal(resub, 1);
    assert.equal(state.maxJoined, 1);
    broadcast(state, msg("after-dead-peer"));
    await waitFor(() => got.includes("after-dead-peer"), "delivered");
  } finally { await cleanup(sb, server, state, feed); }
});

test("stop() detaches every lifecycle listener and the heartbeat subscription: nothing rejoins after unmount", async () => {
  const { server, state, port } = await startServer();
  const hb = createHeartbeatMonitor();
  const sb = client(port, hb);
  const page = fakePage(); const live = [];
  const feed = listenCommunityFeed(sb, TOPIC, true, {
    onMessage: () => {}, onLive: (v) => live.push(v), backoff: { baseMs: 40, maxMs: 200 },
    heartbeat: hb, watchdogMs: 100, lifecycle: { win: page.win, doc: page.doc },
  });
  try {
    await waitFor(() => live.at(-1) === true, "first SUBSCRIBED");
    assert.equal(page.listeners(), 7, "pageshow, pagehide, online, focus, visibilitychange, freeze, resume");
    feed.stop();
    assert.equal(page.listeners(), 0, "every page listener removed on unmount (no leak per mount)");
    await waitFor(() => state.joined.size === 0, "left on stop");
    page.fire(page.win, "pageshow", { persisted: true }); page.fire(page.win, "online"); page.fire(page.doc, "resume");
    hb.callback("timeout");
    await pause(500);
    assert.equal(state.joins, 1, "no rejoin after stop");
    assert.equal(hb.listenerCount(), 0, "heartbeat subscription removed");
  } finally { await cleanup(sb, server, state); }
});
