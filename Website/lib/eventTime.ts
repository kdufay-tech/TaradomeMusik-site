// Event start-time text for the event cards (P-5 bfcache round, item 3, 24 Oct 2026).
//
// React hydration errors #425 / #418 / #423 on the artist pages: the static export is rendered at build time in UTC,
// the browser renders in the visitor's time zone, so `toLocaleTimeString()` gave different text on the two sides and
// React threw the server HTML away. The FIRST render (server and client) must produce identical text: a fixed zone
// (UTC), said explicitly, built without Intl/ICU (the build's Node ICU and the browser's ICU can differ, e.g. a
// U+202F narrow space before AM/PM). After mount the card shows the visitor's local time, as it always did.
//
// Plain, erasable TypeScript only: node --test runs this file directly (tests/eventTime.test.mjs).

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TBA = "Date TBA";

function parse(iso: unknown): Date | null {
  if (!iso || typeof iso !== "string") return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Sep 15, 2026 · 6:00 PM UTC" -- identical on every machine and in every engine. */
export function formatEventTimeUTC(iso: unknown): string {
  const d = parse(iso);
  if (!d) return TBA;
  const h24 = d.getUTCHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear() +
    " · " + h12 + ":" + mm + " " + (h24 < 12 ? "AM" : "PM") + " UTC";
}

/** The visitor's local time, exactly as the cards showed it before (client only, after mount). */
export function formatEventTimeLocal(iso: unknown): string {
  const d = parse(iso);
  if (!d) return TBA;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** What a card renders: the fixed UTC text until the component has mounted on the client, then local time. */
export function eventTimeText(iso: unknown, mounted: boolean): string {
  return mounted ? formatEventTimeLocal(iso) : formatEventTimeUTC(iso);
}
