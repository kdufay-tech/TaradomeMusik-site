// P-5 / L-4 integration test: lib/realtimeReconnect.ts listenCommunityFeed() driven by the REAL supabase-js
// (the version in package-lock) against a tiny local Phoenix-style Realtime server (no network, no key, no deps:
// the WebSocket server below is node:http + RFC 6455 framing). It proves, with the real library:
//   - a server-side channel close (what the 24 h cap on public connections does) leads to a fresh join and the
//     feed keeps delivering; the CLOSED that removeChannel itself fires is ignored (one rejoin, not two);
//   - a dropped socket (CHANNEL_ERROR) also recovers;
//   - every broadcast reaches the handler exactly once (no second handler on a re-used channel);
//   - never more than one joined channel for the topic at a time; stop() leaves and nothing rejoins.
// Run from Website/: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { listenCommunityFeed } from "../lib/realtimeReconnect.ts";

const TOPIC = "community:2021495d-4b53-4d43-93c9-f6dd015e5502";
const RT = "realtime:" + TOPIC;

function frame(text) {
  const p = Buffer.from(text);
  const head = p.length < 126 ? Buffer.from([0x81, p.length])
    : p.length < 65536 ? Buffer.from([0x81, 126, p.length >> 8, p.length & 255])
    : (() => { const b = Buffer.alloc(10); b[0] = 0x81; b[1] = 127; b.writeBigUInt64BE(BigInt(p.length), 2); return b; })();
  return Buffer.concat([head, p]);
}

/** Minimal Realtime stand-in: speaks the Phoenix v2 (array) and v1 (object) JSON text protocol. */
function startServer() {
  const state = { joins: 0, leaves: 0, joined: new Map(), maxJoined: 0, sockets: new Set(), log: [] };
  const server = createServer();
  server.on("upgrade", (req, socket) => {
    const key = req.headers["sec-websocket-key"];
    const accept = createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n");
    const vsn2 = /vsn=2/.test(req.url || "");
    const conn = { socket, joinRef: null, vsn2 };
    state.sockets.add(conn);
    const send = (joinRef, ref, topic, event, payload) =>
      socket.write(frame(JSON.stringify(vsn2 ? [joinRef, ref, topic, event, payload] : { join_ref: joinRef, ref, topic, event, payload })));
    conn.send = send;
    let buf = Buffer.alloc(0);
    const gone = () => { if (conn.joinRef !== null) { state.joined.delete(conn); conn.joinRef = null; } state.sockets.delete(conn); };
    socket.on("close", gone); socket.on("error", gone);
    socket.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      for (;;) {
        if (buf.length < 2) return;
        const op = buf[0] & 15; let len = buf[1] & 127; let off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        const masked = (buf[1] & 128) !== 0; const mask = masked ? buf.subarray(off, off + 4) : null; if (masked) off += 4;
        if (buf.length < off + len) return;
        const data = Buffer.from(buf.subarray(off, off + len)); buf = buf.subarray(off + len);
        if (mask) for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
        if (op === 8) { socket.end(Buffer.from([0x88, 0])); return; }
        if (op === 9) { socket.write(Buffer.concat([Buffer.from([0x8a, data.length]), data])); continue; }
        if (op !== 1) continue;
        const m = JSON.parse(data.toString());
        const [joinRef, ref, topic, event, payload] = Array.isArray(m) ? m : [m.join_ref, m.ref, m.topic, m.event, m.payload];
        state.log.push(event + " " + topic);
        if (event === "heartbeat") { send(null, ref, "phoenix", "phx_reply", { status: "ok", response: {} }); continue; }
        if (topic !== RT) { send(joinRef, ref, topic, "phx_reply", { status: "ok", response: {} }); continue; }
        if (event === "phx_join") {
          state.joins += 1; conn.joinRef = joinRef; state.joined.set(conn, joinRef);
          state.maxJoined = Math.max(state.maxJoined, state.joined.size);
          state.lastPrivate = payload?.config?.private;
          send(joinRef, ref, topic, "phx_reply", { status: "ok", response: { postgres_changes: [] } });
        } else if (event === "phx_leave") {
          state.leaves += 1; state.joined.delete(conn); conn.joinRef = null;
          send(joinRef, ref, topic, "phx_reply", { status: "ok", response: {} });
        } else {
          send(joinRef, ref, topic, "phx_reply", { status: "ok", response: {} });
        }
      }
    });
  });
  return new Promise((res) => server.listen(0, "127.0.0.1", () => res({ server, state, port: server.address().port })));
}

const broadcast = (state, msg) => { for (const [conn, jr] of state.joined) conn.send(jr, null, RT, "broadcast", { type: "broadcast", event: "message", payload: msg }); };
const closeChannel = (state) => { for (const [conn, jr] of state.joined) { conn.send(jr, null, RT, "phx_close", {}); state.joined.delete(conn); conn.joinRef = null; } };
const dropSockets = (state) => { for (const conn of state.sockets) conn.socket.destroy(); };
const waitFor = async (cond, what, ms = 8000) => { const t0 = Date.now(); while (!cond()) { if (Date.now() - t0 > ms) throw new Error("timeout waiting for " + what); await new Promise((r) => setTimeout(r, 20)); } };

test("real supabase-js: the feed survives a server close (24 h cap) and a dropped socket, with each message delivered once", async () => {
  const { server, state, port } = await startServer();
  const sb = createClient("http://127.0.0.1:" + port, "sb_publishable_TESTONLY000", {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 5 }, reconnectAfterMs: () => 100 },
  });
  const got = []; const live = []; let resub = 0;
  const r = listenCommunityFeed(sb, TOPIC, true, {
    onMessage: (p) => got.push(p.id), onLive: (v) => live.push(v), onResubscribed: () => { resub += 1; },
    backoff: { baseMs: 40, maxMs: 200 },
  });
  try {
    await waitFor(() => live.at(-1) === true, "first SUBSCRIBED");
    assert.equal(state.joins, 1);
    assert.equal(state.lastPrivate, true, "the private flag reaches the join");
    broadcast(state, { id: "m1", created_at: new Date().toISOString(), body: "one" });
    await waitFor(() => got.length >= 1, "m1");

    // 1. The server ends the channel, as Realtime does when a public connection reaches 24 h.
    closeChannel(state);
    await waitFor(() => live.at(-1) === false, "live off after close");
    await waitFor(() => state.joins === 2 && live.at(-1) === true, "re-join after close");
    await new Promise((r2) => setTimeout(r2, 400));             // room for any (wrong) extra rejoin
    assert.equal(state.joins, 2, "exactly one re-join: the CLOSED fired by removeChannel is ignored");
    assert.equal(resub, 1, "history refetch requested once");
    broadcast(state, { id: "m2", created_at: new Date().toISOString(), body: "two" });
    await waitFor(() => got.includes("m2"), "m2");

    // 2. The socket drops (network cut / server restart): CHANNEL_ERROR, socket reconnect, re-join.
    dropSockets(state);
    await waitFor(() => state.joins >= 3 && live.at(-1) === true, "re-join after socket drop");
    await new Promise((r2) => setTimeout(r2, 400));
    broadcast(state, { id: "m3", created_at: new Date().toISOString(), body: "three" });
    await waitFor(() => got.includes("m3"), "m3");
    await new Promise((r2) => setTimeout(r2, 200));

    assert.deepEqual(got, ["m1", "m2", "m3"], "each broadcast reached the handler exactly once");
    assert.equal(state.maxJoined, 1, "never more than one joined channel for the topic");
    assert.equal(sb.getChannels().length, 1, "the client holds one channel");

    // 3. Unmount: leave, and nothing comes back.
    const joinsBefore = state.joins;
    r.stop();
    await waitFor(() => state.joined.size === 0, "leave on stop");
    await new Promise((r2) => setTimeout(r2, 500));
    assert.equal(state.joins, joinsBefore, "no re-join after stop");
  } finally {
    r.stop();
    await sb.removeAllChannels().catch(() => {});
    for (const conn of state.sockets) conn.socket.destroy();
    await new Promise((res) => server.close(res));
  }
});
