// Realtime reconnect for the community chat (TEOS key rotation P-5, plan L-4, 22 Oct 2026; bfcache / sleep round
// 24 Oct 2026).
//
// The fan page listens on a Realtime channel with the PUBLIC publishable key and no signed-in user. Supabase ends
// such public connections after at most 24 h ("API keys" doc, Known limitations), and any socket can drop. So when
// the channel reports CLOSED, CHANNEL_ERROR or TIMED_OUT we remove it, wait a jittered exponential backoff and
// subscribe again. The backoff resets only after the channel has stayed SUBSCRIBED for STABLE_MS (review F-4: a
// server that accepts the join and drops it at once must not get a re-join every second).
//
// 24 Oct 2026 incident: a tab left open ~26 h said "live" but never reconnected. The channel callback is NOT a
// reliable signal: on a bfcache restore @supabase/phoenix 0.4.5 opens a new socket in `pageshow` before the old
// socket's close event arrives, and the late Socket.onConnClose() disables `onclose` on the NEW socket. After that a
// dead socket reports nothing to the channel, phoenix never reconnects, and connect() is a no-op while the closed
// conn is still set. So the SOCKET is now the source of truth: a watchdog checks the connection and the heartbeat
// acks, page-lifecycle returns (bfcache restore, resume from freezing, online, a long hide) force a full re-subscribe,
// and every rebuild after a dead socket resets the transport (realtime.disconnect()) before the new channel opens.
//
// Pure and framework-free so it is unit-tested (tests/realtimeReconnect.test.mjs, tests/realtimeLiveness.test.mjs,
// tests/communityFeed*.integration.test.mjs); CommunityChat.tsx wires it to supabase-js.
//
// Plain, erasable TypeScript only (no enums / parameter properties): node --test runs this file directly.

export const RECONNECT_STATUSES: readonly string[] = ["CLOSED", "CHANNEL_ERROR", "TIMED_OUT"];

export type Backoff = { baseMs: number; maxMs: number };
export const DEFAULT_BACKOFF: Backoff = { baseMs: 2500, maxMs: 60000 };
/** How long a channel must stay SUBSCRIBED before the backoff starts again from the bottom (review F-4). */
export const STABLE_MS = 30000;

/** Liveness watchdog period (24 Oct 2026). One timer, cleared on stop. */
export const WATCHDOG_MS = 10000;
/**
 * No heartbeat ack for this long while visible = the socket is dead. realtime-js 2.110.8 sends a heartbeat every
 * 25 s and phoenix itself gives up after 2 periods (50 s); 65 s is the backstop for when phoenix's heartbeat chain
 * has stopped (it stops silently once the socket is not open).
 */
export const STALE_ACK_MS = 65000;
/** The watchdog fired this much later than planned while visible: the machine slept or the page was frozen. */
export const CLOCK_JUMP_MS = 30000;
/** A tab hidden (or frozen / in the back-forward cache) at least this long is re-subscribed when it comes back. */
export const LONG_HIDDEN_MS = 60000;
/** A join or a transport reset that has not finished after this long is abandoned and retried. */
export const STUCK_MS = 30000;

/**
 * Delay before reconnect attempt `attempt` (1 = first retry). Exponential from `baseMs`, capped at `maxMs`, with
 * "equal jitter": half of it fixed, half random, so many open fan pages do not all reconnect (and refetch history
 * from the TEOS API) in the same second after one Realtime restart.
 */
export function backoffDelay(attempt: number, backoff: Backoff = DEFAULT_BACKOFF, random: () => number = Math.random): number {
  const n = Number.isFinite(attempt) && attempt >= 1 ? Math.floor(attempt) : 1;
  const exp = Math.min(backoff.maxMs, backoff.baseMs * 2 ** Math.min(n - 1, 30));
  const r = Math.min(1, Math.max(0, Number(random()) || 0));
  return Math.round(exp / 2 + (r * exp) / 2);
}

/** How many messages a page keeps (and renders). A page left open for days stays bounded. */
export const MAX_KEPT_MESSAGES = 200;

/**
 * How many of the latest messages the history GET asks for, on the first load and on every re-subscribe back-fill
 * (owner, 22 Oct 2026: 100 instead of 60). MAX_KEPT_MESSAGES stays at 2 x this, so a full back-fill plus live
 * traffic is kept and deduped by id. NOTE: TEOS `GET /v1/public/artist/:slug/chat` (chat.service.ts `recent()`)
 * returns a fixed 60 and ignores `limit` until the TEOS API reads it; the page then gets 100 with no change here.
 */
export const HISTORY_LIMIT = 100;

/** The TEOS history URL for an artist's community chat: `<api>/public/artist/<slug>/chat?limit=<limit>`. */
export function communityHistoryUrl(api: string, slug: string, limit: number = HISTORY_LIMIT): string {
  return api + "/public/artist/" + encodeURIComponent(slug) + "/chat?limit=" + String(limit);
}

type HasId = { id: string; created_at?: string };

function timeOf(x: HasId): number {
  const t = Date.parse(String(x.created_at ?? ""));
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/**
 * Adds `incoming` to `current` without duplicates (by id; the copy already shown wins), oldest first, keeping the
 * newest `max`. Items without an id are dropped. Returns `current` itself when nothing new arrived, so React does not
 * re-render.
 */
export function mergeMessages<T extends HasId>(current: T[], incoming: unknown[], max: number = MAX_KEPT_MESSAGES): T[] {
  const seen = new Set(current.map((x) => x.id));
  const added: T[] = [];
  for (const item of incoming) {
    const x = item as T | null;
    if (!x || typeof x !== "object" || typeof x.id !== "string" || !x.id || seen.has(x.id)) continue;
    seen.add(x.id);
    added.push(x);
  }
  if (!added.length && current.length <= max) return current;
  const all = current.concat(added);
  all.sort((a, b) => timeOf(a) - timeOf(b) || 0);   // stable: equal times keep arrival order
  return all.length > max ? all.slice(all.length - max) : all;
}

/**
 * What the socket says about itself. `lastAckAt` undefined = no heartbeat source (no staleness check); null = no ack
 * seen yet (the SUBSCRIBED time counts as the last ack).
 */
export type SocketHealth = { connected: boolean; lastAckAt?: number | null };

export type ReconnectDeps<C> = {
  /** Create the channel, bind the message handler and subscribe; report every subscribe status to `onStatus`. */
  open: (onStatus: (status: string) => void) => C;
  /** Remove the channel (supabase.removeChannel). May fire CLOSED on it; that is ignored. */
  close: (channel: C) => unknown;
  setTimer: (fn: () => void, ms: number) => unknown;
  clearTimer: (timer: unknown) => void;
  random?: () => number;
  backoff?: Backoff;
  /** Time a channel must stay SUBSCRIBED before the backoff resets (default STABLE_MS). */
  stableMs?: number;
  onLive?: (live: boolean) => void;
  /**
   * Called on every SUBSCRIBED after the first one: refetch the history to fill the gap. Not delayed by the stable
   * period (the gap should fill at once); a flapping channel still cannot call it faster than the backoff allows.
   */
  onResubscribed?: () => void;
  /**
   * Tear the transport down so the next subscribe opens a fresh WebSocket (supabase.realtime.disconnect()). Called
   * after a forced resync and after any failure while the socket is not connected; awaited, errors ignored.
   */
  reset?: () => unknown;
  /** The socket's state (realtime.isConnected() + heartbeat acks). When given, the liveness watchdog runs. */
  health?: () => SocketHealth;
  /** document.visibilityState === "hidden". Hidden tabs' timers are throttled, so only "connected" is trusted then. */
  isHidden?: () => boolean;
  now?: () => number;
  watchdogMs?: number;
  staleMs?: number;
  clockJumpMs?: number;
  stuckMs?: number;
  /** Diagnostics: why a forced re-subscribe started. */
  onResync?: (reason: string) => void;
};

export type ResyncResult = "resync" | "pending" | "ignored";
export type CheckResult = ResyncResult | "healthy";
export type Phase = "idle" | "joining" | "live" | "closing" | "waiting" | "resetting" | "stopped";

export type Reconnector = {
  start: () => void;
  stop: () => void;
  /**
   * Forced full re-subscribe: the label leaves "live" at once, the channel is removed, the transport is reset, a new
   * channel is opened after the backoff (`fast`: at most the first-step delay). While a reconnect is already on its
   * way it only marks the transport reset (and with `fast` pulls a long wait in). "resync" | "pending" | "ignored".
   */
  resync: (reason: string, opts?: { fast?: boolean }) => ResyncResult;
  /** Health check: resyncs only when the socket is not connected, or (visible) its heartbeat is stale. */
  check: (reason: string) => CheckResult;
  /** `subscribedAt`: when the current channel last reported SUBSCRIBED (0 = never). */
  state: () => { attempts: number; live: boolean; stopped: boolean; generation: number; phase: Phase; subscribedAt: number };
};

/**
 * One channel at a time, one pending reconnect at a time. Each open gets a generation number and a status from an
 * older generation is ignored: removeChannel fires CLOSED on the channel it removes, and one failure can report both
 * CHANNEL_ERROR and TIMED_OUT. The next channel is opened only after the old one's removal has settled, because
 * supabase.channel(topic) returns the existing channel while one with that topic is still registered.
 *
 * Phases: joining (channel opened, waiting for SUBSCRIBED) -> live -> closing (removing the channel) -> waiting
 * (backoff timer) -> [resetting (transport reset)] -> joining ... Timers: at most one of {reconnect, stable} plus the
 * single watchdog timer (only when `health` is given); all cleared on stop().
 */
export function createReconnector<C>(deps: ReconnectDeps<C>): Reconnector {
  const now = deps.now ?? (() => Date.now());
  const isHidden = deps.isHidden ?? (() => false);
  const backoff = deps.backoff ?? DEFAULT_BACKOFF;
  const random = deps.random ?? Math.random;
  const watchdogMs = deps.watchdogMs ?? WATCHDOG_MS;
  const staleMs = deps.staleMs ?? STALE_ACK_MS;
  const clockJumpMs = deps.clockJumpMs ?? CLOCK_JUMP_MS;
  const stuckMs = deps.stuckMs ?? STUCK_MS;

  let generation = 0;
  let attempts = 0;
  let live = false;
  let started = false;
  let stopped = false;
  let everSubscribed = false;
  let current: C | null = null;
  let phase: Phase = "idle";
  let phaseSince = now();
  let timer: unknown = null;
  let timerDueAt = 0;
  // F-4: armed on SUBSCRIBED; when it fires for the still-current generation the backoff resets. Cleared on any
  // failure and on stop(), so at most one of {reconnect timer, stable timer} is ever pending.
  let stableTimer: unknown = null;
  let stableGen = -1;                                   // generation the stable timer was armed (or fired) for
  let resetNext = false;                                // reset the transport before the next open
  let fastNext = false;                                 // the next wait is at most the first-step delay
  let resetToken = 0;                                   // invalidates a transport reset that is abandoned
  let subscribedAt = 0;
  let watchdog: unknown = null;
  let tickPlannedAt = 0;
  let hiddenAtArm = false;

  const setPhase = (p: Phase) => { phase = p; phaseSince = now(); };
  const setLive = (v: boolean) => { if (live !== v) { live = v; deps.onLive?.(v); } };

  const clearStable = () => {
    if (stableTimer !== null) { deps.clearTimer(stableTimer); stableTimer = null; }
    stableGen = -1;
  };

  const armStable = (gen: number) => {
    if (stableGen === gen) return;                     // already armed, or already stable, for this channel
    clearStable();
    stableGen = gen;
    const t: unknown = deps.setTimer(() => {
      if (stableTimer === t) stableTimer = null;          // never forget a newer timer because an old one fired
      if (stopped || gen !== generation) return;        // a late timer of an old channel changes nothing
      attempts = 0;
    }, deps.stableMs ?? STABLE_MS);
    stableTimer = t;
  };

  const safeClose = (ch: C | null): Promise<void> =>
    ch === null ? Promise.resolve() : Promise.resolve().then(() => deps.close(ch)).then(() => undefined, () => undefined);

  const socketUp = () => (deps.health ? !!deps.health().connected : true);

  const startWait = (ms: number) => {
    setPhase("waiting");
    timerDueAt = now() + ms;
    const t: unknown = deps.setTimer(() => { if (timer !== t) return; timer = null; reopen(); }, ms);
    timer = t;
  };

  const schedule = () => {
    if (stopped) return;
    attempts += 1;
    let ms = backoffDelay(attempts, backoff, random);
    if (fastNext) { ms = Math.min(ms, backoffDelay(1, backoff, random)); fastNext = false; }
    startWait(ms);
  };

  /** Failure of generation `gen`: invalidate it, remove its channel, then wait and reconnect. */
  const fail = (gen: number, ch: C | null, opts: { reset?: boolean; fast?: boolean } = {}) => {
    if (stopped || gen !== generation) return;
    generation += 1;                          // every later status of this channel is stale
    clearStable();                            // it did not stay up: the backoff keeps growing
    if (current === ch) current = null;
    setLive(false);
    if (opts.reset) resetNext = true;
    if (opts.fast) fastNext = true;
    setPhase("closing");
    void safeClose(ch).then(schedule);
  };

  /**
   * After the wait: reset the transport first when asked to, or when the socket is not connected. A closed but
   * non-null phoenix conn makes every connect() a no-op (socket.js `if (this.conn && !this.disconnecting) return`),
   * so a new channel on it would never join.
   */
  const reopen = () => {
    if (stopped) return;
    const needReset = !!deps.reset && (resetNext || !socketUp());
    resetNext = false;
    if (!needReset) { connect(); return; }
    setPhase("resetting");
    const token = ++resetToken;
    void Promise.resolve().then(() => deps.reset?.()).then(() => undefined, () => undefined).then(() => {
      if (stopped || token !== resetToken || phase !== "resetting") return;
      connect();
    });
  };

  const connect = () => {
    if (stopped) return;
    const gen = ++generation;
    setPhase("joining");
    let handle: C | null = null;
    let returned = false;
    let earlyFailure = false;
    const onStatus = (status: string) => {
      if (stopped || gen !== generation) return;
      if (status === "SUBSCRIBED") {
        armStable(gen);                         // attempts reset only if it stays up (F-4)
        subscribedAt = now();                   // the join reply is a server reply: counts as a fresh ack
        if (phase !== "live") setPhase("live");
        setLive(true);
        if (everSubscribed) deps.onResubscribed?.();
        everSubscribed = true;
        return;
      }
      if (!RECONNECT_STATUSES.includes(status)) return;
      if (!returned) { earlyFailure = true; return; }   // reported inside open(): handled once it returns
      fail(gen, handle);
    };
    try {
      handle = deps.open(onStatus);
    } catch {
      returned = true;
      fail(gen, null);
      return;
    }
    returned = true;
    if (stopped || gen !== generation) { void safeClose(handle); return; }
    current = handle;
    if (earlyFailure) fail(gen, handle);
  };

  const resync = (reason: string, opts: { fast?: boolean } = {}): ResyncResult => {
    if (!started || stopped) return "ignored";
    if (phase === "live" || phase === "joining") {
      deps.onResync?.(reason);
      fail(generation, current, { reset: true, fast: !!opts.fast });
      return "resync";
    }
    // closing / waiting / resetting: a reconnect is already on its way; make sure it starts from a fresh transport.
    resetNext = true;
    if (opts.fast) {
      if (phase === "closing") fastNext = true;
      else if (phase === "waiting" && timer !== null) {
        const fastMs = backoffDelay(1, backoff, random);
        if (timerDueAt - now() > fastMs) { deps.clearTimer(timer); timer = null; startWait(fastMs); }
      }
    }
    return "pending";
  };

  const check = (reason: string): CheckResult => {
    if (!started || stopped) return "ignored";
    if (phase !== "live") return "pending";
    if (!deps.health) return "healthy";
    const h = deps.health();
    if (!h.connected) return resync(reason + ":socket-down");
    if (h.lastAckAt !== undefined && !isHidden()) {
      const last = Math.max(subscribedAt, h.lastAckAt ?? 0);
      if (now() - last > staleMs) return resync(reason + ":stale");
    }
    return "healthy";
  };

  const armWatchdog = () => {
    if (stopped || !deps.health) return;
    tickPlannedAt = now() + watchdogMs;
    hiddenAtArm = isHidden();
    const t: unknown = deps.setTimer(() => { if (watchdog !== t) return; watchdog = null; tick(); }, watchdogMs);
    watchdog = t;
  };

  const tick = () => {
    if (stopped) return;
    const t = now();
    if (phase === "live") {
      // Fired far later than planned while visible the whole time: the machine slept or the page was frozen.
      if (!hiddenAtArm && !isHidden() && t - tickPlannedAt > clockJumpMs) resync("watchdog:clock-jump");
      else check("watchdog");
    } else if (phase === "joining" && t - phaseSince > stuckMs) {
      resync("watchdog:stuck-joining");
    } else if (phase === "resetting" && t - phaseSince > stuckMs) {
      deps.onResync?.("watchdog:stuck-reset");
      resetToken += 1;                                   // the hung reset can no longer open a channel
      connect();
    }
    armWatchdog();
  };

  return {
    start() { if (started || stopped) return; started = true; connect(); armWatchdog(); },
    stop() {
      if (stopped) return;
      stopped = true;
      generation += 1;
      resetToken += 1;
      if (timer !== null) { deps.clearTimer(timer); timer = null; }
      if (watchdog !== null) { deps.clearTimer(watchdog); watchdog = null; }
      clearStable();
      const ch = current; current = null;
      void safeClose(ch);
      live = false;
      setPhase("stopped");
    },
    resync,
    check,
    state: () => ({ attempts, live, stopped, generation, phase, subscribedAt }),
  };
}

// ---- Heartbeat monitor (24 Oct 2026). realtime-js calls `heartbeatCallback(status, latency)` with "sent" / "ok" /
// "error" / "timeout" (it filters "disconnected" out). Created once per Supabase client.

export type HeartbeatMonitor = {
  callback: (status: string, latency?: number) => void;
  lastAckAt: () => number | null;
  /** "timeout" / "error" listeners; returns the unsubscribe function. */
  onProblem: (fn: (status: string) => void) => () => void;
  listenerCount: () => number;
};

export function createHeartbeatMonitor(now: () => number = () => Date.now()): HeartbeatMonitor {
  let lastAck: number | null = null;
  const subs = new Set<(status: string) => void>();
  return {
    callback(status: string) {
      if (status === "ok") { lastAck = now(); return; }
      if (status !== "timeout" && status !== "error") return;
      for (const fn of Array.from(subs)) { try { fn(status); } catch { /* never throw into realtime-js */ } }
    },
    lastAckAt: () => lastAck,
    onProblem(fn) { subs.add(fn); return () => { subs.delete(fn); }; },
    listenerCount: () => subs.size,
  };
}

// ---- Page lifecycle (24 Oct 2026). The page is NOT blocked from the back/forward cache (no unload / beforeunload,
// nothing done on pagehide): it restores and recovers on its own.

export type LifecycleTarget = {
  addEventListener(type: string, fn: (e: any) => void): void;
  removeEventListener(type: string, fn: (e: any) => void): void;
};
export type LifecycleDoc = LifecycleTarget & { visibilityState?: string };
export type LifecycleOptions = { now?: () => number; longHiddenMs?: number; idleMs?: number };

/**
 * - pageshow with persisted (back/forward cache restore), resume (Page Lifecycle: Edge sleeping tabs, frozen
 *   background tabs) and online -> forced fast resync;
 * - visibilitychange -> visible after >= longHiddenMs hidden (pagehide / freeze also start the hidden clock) ->
 *   forced fast resync, unless the channel is live and was (re)subscribed after the hide began (e.g. already rebuilt
 *   on `resume`): then a health check only; after a shorter hide -> health check only (no re-join per tab switch);
 * - focus after >= idleMs without any lifecycle check -> health check.
 * Returns the function that removes every listener.
 */
export function watchPageLifecycle(
  win: LifecycleTarget, doc: LifecycleDoc,
  r: Pick<Reconnector, "resync" | "check"> & { state?: () => { live: boolean; subscribedAt: number } },
  opts: LifecycleOptions = {},
): () => void {
  const now = opts.now ?? (() => Date.now());
  const longHiddenMs = opts.longHiddenMs ?? LONG_HIDDEN_MS;
  const idleMs = opts.idleMs ?? LONG_HIDDEN_MS;
  let hiddenAt: number | null = doc.visibilityState === "hidden" ? now() : null;
  let lastCheck = now();
  const mark = () => { lastCheck = now(); };
  const away = () => { if (hiddenAt === null) hiddenAt = now(); };
  const onPageShow = (e: { persisted?: boolean } | null) => {
    if (!e || !e.persisted) return;
    mark(); hiddenAt = null;
    r.resync("pageshow-bfcache", { fast: true });
  };
  const onResume = () => { mark(); r.resync("resume", { fast: true }); };
  const onOnline = () => { mark(); r.resync("online", { fast: true }); };
  const onVisibility = () => {
    if (doc.visibilityState === "hidden") { away(); return; }
    const since = hiddenAt;
    const hiddenFor = since === null ? 0 : now() - since;
    hiddenAt = null; mark();
    const st = r.state ? r.state() : null;
    const rebuiltSince = !!st && st.live && since !== null && st.subscribedAt >= since;
    if (hiddenFor >= longHiddenMs && !rebuiltSince) r.resync("visible-after-hidden", { fast: true });
    else r.check("visible");
  };
  const onFocus = () => { if (now() - lastCheck >= idleMs) { mark(); r.check("focus"); } };
  const bindings: [LifecycleTarget, string, (e: any) => void][] = [
    [win, "pageshow", onPageShow], [win, "pagehide", away], [win, "online", onOnline], [win, "focus", onFocus],
    [doc, "visibilitychange", onVisibility], [doc, "freeze", away], [doc, "resume", onResume],
  ];
  for (const [t, type, fn] of bindings) t.addEventListener(type, fn);
  return () => { for (const [t, type, fn] of bindings) t.removeEventListener(type, fn); };
}

// ---- The wiring CommunityChat.tsx uses, kept here so it is tested against the real supabase-js
// (tests/communityFeed*.integration.test.mjs). Structural types only, so this file imports nothing.

export type FeedChannel = {
  on(type: "broadcast", filter: { event: string }, callback: (message: { payload?: unknown }) => void): FeedChannel;
  subscribe(callback: (status: string) => void): unknown;
};
/** The parts of supabase.realtime (RealtimeClient) the liveness logic uses. */
export type FeedRealtime = { isConnected?: () => boolean; disconnect?: () => unknown };
export type FeedClient<C extends FeedChannel> = {
  channel(topic: string, options: { config: { private: boolean } }): C;
  removeChannel(channel: C): unknown;
  realtime?: FeedRealtime;
};
export type FeedHandlers = {
  /** One broadcast "message" payload that carries an id. Dedupe happens in mergeMessages. */
  onMessage: (payload: { id: string }) => void;
  onLive?: (live: boolean) => void;
  onResubscribed?: () => void;
  backoff?: Backoff;
  stableMs?: number;
  random?: () => number;
  /** The monitor whose `callback` was given to createClient as realtime.heartbeatCallback. */
  heartbeat?: HeartbeatMonitor | null;
  /** window + document for the page-lifecycle triggers; null in tests / outside a browser. */
  lifecycle?: { win: LifecycleTarget; doc: LifecycleDoc } | null;
  watchdogMs?: number;
  staleMs?: number;
  longHiddenMs?: number;
  now?: () => number;
};

// Module-wide, so a channel still being removed by an earlier mount (same topic) is not re-bound either.
const boundChannels = new WeakSet<object>();

/**
 * Listen to the community topic and keep listening: one channel at a time, re-created after CLOSED /
 * CHANNEL_ERROR / TIMED_OUT, after the socket is found dead (watchdog, heartbeat timeout) and after a page-lifecycle
 * return (see createReconnector / watchPageLifecycle). A channel object is never bound twice: if
 * supabase.channel() hands back one that is still registered, it is removed and the attempt is retried
 * after the backoff, so a message handler can never be attached twice (which would duplicate every message).
 */
export function listenCommunityFeed<C extends FeedChannel>(client: FeedClient<C>, topic: string, isPrivate: boolean, h: FeedHandlers): Reconnector {
  const bound = boundChannels;
  const rt = client.realtime;
  const hb = h.heartbeat ?? null;
  const life = h.lifecycle ?? null;
  const reconnector = createReconnector<C>({
    open: (onStatus) => {
      const ch = client.channel(topic, { config: { private: isPrivate } });
      if (bound.has(ch)) {
        void Promise.resolve().then(() => client.removeChannel(ch)).catch(() => undefined);
        throw new Error("channel still registered");
      }
      bound.add(ch);
      ch.on("broadcast", { event: "message" }, (message) => {
        const p = message ? (message.payload as { id?: unknown } | null | undefined) : null;
        if (p && typeof p === "object" && typeof p.id === "string" && p.id) h.onMessage(p as { id: string });
      });
      ch.subscribe((status) => onStatus(String(status)));
      return ch;
    },
    close: (ch) => client.removeChannel(ch),
    setTimer: (fn, ms) => setTimeout(fn, ms),
    clearTimer: (t) => clearTimeout(t as ReturnType<typeof setTimeout>),
    random: h.random,
    backoff: h.backoff,
    stableMs: h.stableMs,
    onLive: h.onLive,
    onResubscribed: h.onResubscribed,
    reset: rt && typeof rt.disconnect === "function" ? () => rt.disconnect?.() : undefined,
    health: () => ({
      connected: rt && typeof rt.isConnected === "function" ? !!rt.isConnected() : true,
      lastAckAt: hb ? hb.lastAckAt() : undefined,
    }),
    isHidden: () => !!life && life.doc.visibilityState === "hidden",
    now: h.now,
    watchdogMs: h.watchdogMs,
    staleMs: h.staleMs,
  });
  reconnector.start();
  const offHeartbeat = hb ? hb.onProblem((status) => { reconnector.resync("heartbeat-" + status); }) : null;
  const detach = life ? watchPageLifecycle(life.win, life.doc, reconnector, { longHiddenMs: h.longHiddenMs, now: h.now }) : null;
  return {
    start: reconnector.start,
    resync: reconnector.resync,
    check: reconnector.check,
    state: reconnector.state,
    stop() {
      if (detach) detach();
      if (offHeartbeat) offHeartbeat();
      reconnector.stop();
    },
  };
}

export type RetryOptions = {
  /** Extra tries after the first one (default 1: one retry). */
  retries?: number;
  /** Wait before retry `n` (1 = first retry); default backoffDelay(n), i.e. 1.25-2.5 s for the first. */
  delayMs?: (attempt: number) => number;
  sleep?: (ms: number) => Promise<void>;
  /** False once the caller is gone (unmounted): no further try is made. */
  alive?: () => boolean;
};

/**
 * Review F-5: the first history load is what opens the live channel, so one TEOS API blip at page load used to leave
 * the page on "connecting" until a reload. Retry it (once by default) after a backoff; reject with the last error.
 */
export async function loadWithRetry<T>(load: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = Math.max(0, Math.floor(opts.retries ?? 1));
  const delayMs = opts.delayMs ?? ((n: number) => backoffDelay(n));
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((res) => { setTimeout(res, ms); }));
  const alive = opts.alive ?? (() => true);
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      if (!alive()) break;
      await sleep(delayMs(attempt));
      if (!alive()) break;
    }
    try {
      return await load();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
