// Realtime reconnect for the community chat (TEOS key rotation P-5, plan L-4, 22 Oct 2026).
//
// The fan page listens on a Realtime channel with the PUBLIC publishable key and no signed-in user. Supabase ends
// such public connections after at most 24 h ("API keys" doc, Known limitations), and any socket can drop. So when
// the channel reports CLOSED, CHANNEL_ERROR or TIMED_OUT we remove it, wait a jittered exponential backoff and
// subscribe again. The backoff resets only after the channel has stayed SUBSCRIBED for STABLE_MS (review F-4: a
// server that accepts the join and drops it at once must not get a re-join every second). Pure and framework-free so it is unit-tested
// (tests/realtimeReconnect.test.mjs); CommunityChat.tsx wires it to supabase-js.
//
// Plain, erasable TypeScript only (no enums / parameter properties): node --test runs this file directly.

export const RECONNECT_STATUSES: readonly string[] = ["CLOSED", "CHANNEL_ERROR", "TIMED_OUT"];

export type Backoff = { baseMs: number; maxMs: number };
export const DEFAULT_BACKOFF: Backoff = { baseMs: 2500, maxMs: 60000 };
/** How long a channel must stay SUBSCRIBED before the backoff starts again from the bottom (review F-4). */
export const STABLE_MS = 30000;

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
};

export type Reconnector = {
  start: () => void;
  stop: () => void;
  state: () => { attempts: number; live: boolean; stopped: boolean; generation: number };
};

/**
 * One channel at a time, one pending reconnect at a time. Each open gets a generation number and a status from an
 * older generation is ignored: removeChannel fires CLOSED on the channel it removes, and one failure can report both
 * CHANNEL_ERROR and TIMED_OUT. The next channel is opened only after the old one's removal has settled, because
 * supabase.channel(topic) returns the existing channel while one with that topic is still registered.
 */
export function createReconnector<C>(deps: ReconnectDeps<C>): Reconnector {
  let generation = 0;
  let attempts = 0;
  let live = false;
  let started = false;
  let stopped = false;
  let everSubscribed = false;
  let current: C | null = null;
  let timer: unknown = null;
  // F-4: armed on SUBSCRIBED; when it fires for the still-current generation the backoff resets. Cleared on any
  // failure and on stop(), so at most one of {reconnect timer, stable timer} is ever pending.
  let stableTimer: unknown = null;
  let stableGen = -1;                                   // generation the stable timer was armed (or fired) for

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

  const schedule = () => {
    if (stopped) return;
    attempts += 1;
    const ms = backoffDelay(attempts, deps.backoff ?? DEFAULT_BACKOFF, deps.random ?? Math.random);
    timer = deps.setTimer(() => { timer = null; connect(); }, ms);
  };

  /** Failure of generation `gen`: invalidate it, remove its channel, then wait and reconnect. */
  const fail = (gen: number, ch: C | null) => {
    if (stopped || gen !== generation) return;
    generation += 1;                          // every later status of this channel is stale
    clearStable();                            // it did not stay up: the backoff keeps growing
    if (current === ch) current = null;
    setLive(false);
    void safeClose(ch).then(schedule);
  };

  const connect = () => {
    if (stopped) return;
    const gen = ++generation;
    let handle: C | null = null;
    let returned = false;
    let earlyFailure = false;
    const onStatus = (status: string) => {
      if (stopped || gen !== generation) return;
      if (status === "SUBSCRIBED") {
        armStable(gen);                         // attempts reset only if it stays up (F-4)
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

  return {
    start() { if (started || stopped) return; started = true; connect(); },
    stop() {
      if (stopped) return;
      stopped = true;
      generation += 1;
      if (timer !== null) { deps.clearTimer(timer); timer = null; }
      clearStable();
      const ch = current; current = null;
      void safeClose(ch);
      live = false;
    },
    state: () => ({ attempts, live, stopped, generation }),
  };
}

// ---- The wiring CommunityChat.tsx uses, kept here so it is tested against the real supabase-js
// (tests/communityFeed.integration.test.mjs). Structural types only, so this file imports nothing.

export type FeedChannel = {
  on(type: "broadcast", filter: { event: string }, callback: (message: { payload?: unknown }) => void): FeedChannel;
  subscribe(callback: (status: string) => void): unknown;
};
export type FeedClient<C extends FeedChannel> = {
  channel(topic: string, options: { config: { private: boolean } }): C;
  removeChannel(channel: C): unknown;
};
export type FeedHandlers = {
  /** One broadcast "message" payload that carries an id. Dedupe happens in mergeMessages. */
  onMessage: (payload: { id: string }) => void;
  onLive?: (live: boolean) => void;
  onResubscribed?: () => void;
  backoff?: Backoff;
  stableMs?: number;
  random?: () => number;
};

// Module-wide, so a channel still being removed by an earlier mount (same topic) is not re-bound either.
const boundChannels = new WeakSet<object>();

/**
 * Listen to the community topic and keep listening: one channel at a time, re-created after CLOSED /
 * CHANNEL_ERROR / TIMED_OUT (see createReconnector). A channel object is never bound twice: if
 * supabase.channel() hands back one that is still registered, it is removed and the attempt is retried
 * after the backoff, so a message handler can never be attached twice (which would duplicate every message).
 */
export function listenCommunityFeed<C extends FeedChannel>(client: FeedClient<C>, topic: string, isPrivate: boolean, h: FeedHandlers): Reconnector {
  const bound = boundChannels;
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
  });
  reconnector.start();
  return reconnector;
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
