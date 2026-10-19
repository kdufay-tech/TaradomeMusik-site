// Which image URLs the community chat may render (TEOS M4 fix round 1, review 12B Important 2).
//
// TEOS builds every attachment URL, but the page must still never load an image from anywhere it did
// not expect -- a forged message on the old public topic could otherwise carry any https URL (a
// tracking pixel). Fans only ever see public community images, so exactly one shape is accepted:
//   <this project's Supabase origin>/storage/v1/object/public/chat-media/<channel uuid>/<uuid>-<name>
// over https, canonical, with no query, fragment or credentials. Everything else renders as no image.
// Pure and dependency-free so it can be unit tested (tests/chatUrl.test.mjs, `npm test`).

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const PUBLIC_MEDIA = new RegExp("^/storage/v1/object/public/chat-media/" + UUID + "/" + UUID + "-[A-Za-z0-9._-]{1,80}$", "i");

/** The URL itself when the community chat may show it as an image, else null. */
export function safeCommunityImageUrl(u: unknown, storageOrigin: string): string | null {
  if (typeof u !== "string" || !u || u.length > 2048) return null;
  let origin: string;
  try { origin = new URL(storageOrigin).origin; } catch { return null; }
  let p: URL;
  try { p = new URL(u); } catch { return null; }
  if (p.href !== u) return null;                         // only canonical URLs (no ../, no odd casing)
  if (p.protocol !== "https:" || p.origin !== origin) return null;
  if (p.username || p.password || p.hash || p.search) return null;
  return PUBLIC_MEDIA.test(p.pathname) ? u : null;
}
