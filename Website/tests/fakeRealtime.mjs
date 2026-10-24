// Test helper (not a test file): a tiny local Phoenix-style Realtime server for the integration tests. It speaks the
// Phoenix v2 (array) and v1 (object) JSON text protocol over node:http + RFC 6455 framing; no deps, no network.
// Used by tests/communityFeed.liveness.integration.test.mjs (P-5 bfcache / sleep round, 24 Oct 2026).
import { createServer } from "node:http";
import { createHash } from "node:crypto";

export const TOPIC = "community:2021495d-4b53-4d43-93c9-f6dd015e5502";
export const RT = "realtime:" + TOPIC;

function frame(text) {
  const p = Buffer.from(text);
  const head = p.length < 126 ? Buffer.from([0x81, p.length])
    : p.length < 65536 ? Buffer.from([0x81, 126, p.length >> 8, p.length & 255])
    : (() => { const b = Buffer.alloc(10); b[0] = 0x81; b[1] = 127; b.writeBigUInt64BE(BigInt(p.length), 2); return b; })();
  return Buffer.concat([head, p]);
}

/**
 * state: handshakes (count), joins, leaves, heartbeats, joined (Map conn -> joinRef), maxJoined, sockets (Set).
 * conn.blackhole = true makes a socket a dead peer: nothing is read or answered, the TCP connection stays open.
 */
export function startServer() {
  const state = { handshakes: 0, joins: 0, leaves: 0, heartbeats: 0, joined: new Map(), maxJoined: 0, sockets: new Set() };
  const server = createServer();
  server.on("upgrade", (req, socket) => {
    const key = req.headers["sec-websocket-key"];
    const accept = createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n");
    state.handshakes += 1;
    const vsn2 = /vsn=2/.test(req.url || "");
    const conn = { socket, joinRef: null, vsn2, blackhole: false };
    state.sockets.add(conn);
    conn.send = (joinRef, ref, topic, event, payload) => {
      if (!conn.blackhole) socket.write(frame(JSON.stringify(vsn2 ? [joinRef, ref, topic, event, payload] : { join_ref: joinRef, ref, topic, event, payload })));
    };
    let buf = Buffer.alloc(0);
    const gone = () => { state.joined.delete(conn); conn.joinRef = null; state.sockets.delete(conn); };
    socket.on("close", gone); socket.on("error", gone);
    socket.on("data", (chunk) => {
      if (conn.blackhole) return;
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
        if (op === 8) { try { socket.end(Buffer.from([0x88, 0])); } catch { /* gone */ } return; }
        if (op === 9) { socket.write(Buffer.concat([Buffer.from([0x8a, data.length]), data])); continue; }
        if (op !== 1) continue;
        const m = JSON.parse(data.toString());
        const [joinRef, ref, topic, event, payload] = Array.isArray(m) ? m : [m.join_ref, m.ref, m.topic, m.event, m.payload];
        if (event === "heartbeat") { state.heartbeats += 1; conn.send(null, ref, "phoenix", "phx_reply", { status: "ok", response: {} }); continue; }
        if (topic !== RT) { conn.send(joinRef, ref, topic, "phx_reply", { status: "ok", response: {} }); continue; }
        if (event === "phx_join") {
          state.joins += 1; conn.joinRef = joinRef; state.joined.set(conn, joinRef);
          state.maxJoined = Math.max(state.maxJoined, state.joined.size);
          conn.send(joinRef, ref, topic, "phx_reply", { status: "ok", response: { postgres_changes: [] } });
        } else if (event === "phx_leave") {
          state.leaves += 1; state.joined.delete(conn); conn.joinRef = null;
          conn.send(joinRef, ref, topic, "phx_reply", { status: "ok", response: {} });
        } else {
          conn.send(joinRef, ref, topic, "phx_reply", { status: "ok", response: {} });
        }
      }
    });
  });
  return new Promise((res) => server.listen(0, "127.0.0.1", () => res({ server, state, port: server.address().port })));
}

export const broadcast = (state, msg) => {
  let n = 0;
  for (const [conn, jr] of state.joined) { if (conn.blackhole) continue; conn.send(jr, null, RT, "broadcast", { type: "broadcast", event: "message", payload: msg }); n += 1; }
  return n;
};
export const dropSockets = (state) => { for (const conn of state.sockets) conn.socket.destroy(); };
/** Dead peer: the server side is gone (it forgets the join), the client's TCP connection stays open and silent. */
export const blackholeSockets = (state) => { for (const conn of state.sockets) { conn.blackhole = true; state.joined.delete(conn); conn.joinRef = null; } };
export const waitFor = async (cond, what, ms = 8000) => {
  const t0 = Date.now();
  while (!cond()) { if (Date.now() - t0 > ms) throw new Error("timeout waiting for " + what); await new Promise((r) => setTimeout(r, 20)); }
};
export const pause = (ms) => new Promise((r) => setTimeout(r, ms));
