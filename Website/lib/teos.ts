/* ─── TEOS public API bridge ───
 * Feeds the marketing site's dynamic /[artist] pages from the TEOS ERP
 * public endpoints. Only artists with public_published=true are exposed.
 * Fetched at BUILD TIME (static export); a Netlify build hook re-runs the
 * build when an artist is published/unpublished in TEOS.
 */

const TEOS_API =
  process.env.NEXT_PUBLIC_TEOS_API ||
  "https://api-production-f6b6.up.railway.app/v1";

/* Route names that must never be treated as an artist slug. */
export const RESERVED_SLUGS = new Set([
  "about",
  "artists",
  "contact",
  "join",
  "releases",
  "spotlight",
  "studio",
  "privacy",
  "films",
  "api",
]);

/* ─── Raw shapes returned by the TEOS public API ─── */
type TeosRelease = {
  title: string;
  asset_type?: string;
  release_date?: string;
  image_url?: string;
  links?:
    | Array<{ platform?: string; label?: string; name?: string; url: string }>
    | Record<string, string>;
  spotify_id?: string;
};

type TeosArtistRaw = {
  slug: string;
  stage_name?: string;
  tagline?: string;
  primary_genre?: string;
  secondary_genres?: string[];
  music_tags?: string[];
  short_bio?: string;
  long_bio?: string;
  primary_color?: string;
  secondary_color?: string;
  profile_image_key?: string;
  banner_image_key?: string;
  logo_image_key?: string;
  website?: string;
  socials?: Array<{ platform: string; url: string }> | Record<string, string>;
  releases?: TeosRelease[];
  gallery?: string[];
};

/* ─── Marketing view model (mirrors lib/data.ts shapes) ─── */
export type PublicRelease = {
  title: string;
  type: string;
  date: string;
  dateISO: string;
  coverImage: string;
  brandColor: string;
  spotifyId: string;
  spotifyType: "track" | "album";
  presave: string;
  dsps: Record<string, string>;
};

export type PublicArtist = {
  name: string;
  slug: string;
  tagline: string;
  genre: string;
  subGenre: string;
  shortBio: string;
  longBio: string;
  heroImage: string;
  profileImage: string;
  logoImage: string;
  brandColor: string;
  brandGradient: string;
  website: string;
  socials: Record<string, string>;
  releases: PublicRelease[];
  gallery: string[];
  tags: string[];
  tiers: PublicTier[];
  merch: PublicMerchItem[];
  giveaways: PublicGiveaway[];
  events: PublicEvent[];
};

export type PublicEvent = {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startsAt: string;
  location: string;
  isVirtual: boolean;
  minTier: string;
  price: number;
  priceLabel: string;
  spotsLeft: number | null;
  image: string;
};

export type PublicGiveaway = {
  id: string;
  title: string;
  description: string;
  prize: string;
  image: string;
  minTier: string;
};

export type PublicMerchItem = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  image: string;
  category: string;
  variants: string[];
};

export type PublicPerk = { title: string; description: string; category: string };
export type PublicTier = {
  key: string;
  short: string;
  label: string;
  color: string;
  perks: PublicPerk[]; // cumulative: everything a fan at this tier unlocks
  price: string;       // USD monthly price, formatted, e.g. "$9.99/mo" ("" if none)
  priceNGN: string;    // NGN monthly price, formatted, e.g. "₦12,000/mo" ("" if none)
};

const FALLBACK_COLOR = "#ff6a3d";

/* Membership tier metadata (mirrors the TEOS portal's fanTiers). Free is the
 * baseline and has no perk card. */
const TIER_META: Array<{ key: string; short: string; label: string; color: string }> = [
  { key: "bronze", short: "Bronze", label: "Supporter", color: "#B07A3C" },
  { key: "gold", short: "Gold", label: "The Oga's Pack", color: "#C8952A" },
  { key: "platinum", short: "Platinum", label: "The Jora Council", color: "#8E9BB3" },
  { key: "diamond", short: "Diamond", label: "Igwe's Council — Afrobeats Royalty", color: "#7C3AED" },
];

function socialsToMap(
  socials: TeosArtistRaw["socials"],
): Record<string, string> {
  if (!socials) return {};
  if (Array.isArray(socials)) {
    const out: Record<string, string> = {};
    for (const s of socials) {
      if (s && s.platform && s.url) out[String(s.platform).toLowerCase()] = s.url;
    }
    return out;
  }
  return socials;
}

function fmtDate(iso?: string): { date: string; dateISO: string } {
  if (!iso) return { date: "", dateISO: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: iso, dateISO: iso };
  return {
    date: d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    dateISO: d.toISOString().slice(0, 10),
  };
}

/* Release links may arrive as an array of {platform,url} or a plain map.
 * Normalize to a DSP map and pull out any pre-save link. */
function linksToDsps(links: TeosRelease["links"]): {
  dsps: Record<string, string>;
  presave: string;
} {
  const dsps: Record<string, string> = {};
  let presave = "";
  if (Array.isArray(links)) {
    for (const l of links) {
      if (!l || !l.url) continue;
      const key = String(l.platform || l.label || l.name || "link")
        .toLowerCase()
        .trim();
      if (/pre[-\s]?save/.test(key)) presave = l.url;
      else dsps[key] = l.url;
    }
  } else if (links && typeof links === "object") {
    for (const [k, v] of Object.entries(links)) {
      if (!v) continue;
      if (/pre[-\s]?save/i.test(k)) presave = v;
      else dsps[k.toLowerCase()] = v;
    }
  }
  return { dsps, presave };
}

function mapArtist(raw: TeosArtistRaw): PublicArtist {
  const brand = raw.primary_color || FALLBACK_COLOR;
  const secondary = raw.secondary_color || "#0A0A0A";
  const releases: PublicRelease[] = (raw.releases || []).map((r) => {
    const { date, dateISO } = fmtDate(r.release_date);
    const type = (r.asset_type || "Single").trim();
    const isAlbum = /album|ep/i.test(type);
    const { dsps, presave } = linksToDsps(r.links);
    return {
      title: r.title,
      type,
      date,
      dateISO,
      coverImage: r.image_url || "",
      brandColor: brand,
      spotifyId: r.spotify_id || "",
      spotifyType: isAlbum ? "album" : "track",
      presave,
      dsps,
    };
  });

  return {
    name: raw.stage_name || raw.slug,
    slug: raw.slug,
    tagline: raw.tagline || "",
    genre: raw.primary_genre || "",
    subGenre:
      raw.secondary_genres && raw.secondary_genres.length
        ? raw.secondary_genres.join(" / ")
        : raw.primary_genre || "",
    shortBio: raw.short_bio || "",
    longBio: raw.long_bio || raw.short_bio || "",
    heroImage: raw.banner_image_key || "",
    profileImage: raw.profile_image_key || "",
    logoImage: raw.logo_image_key || "",
    brandColor: brand,
    brandGradient: `linear-gradient(135deg, ${secondary} 0%, ${brand} 100%)`,
    website: raw.website || "",
    socials: socialsToMap(raw.socials),
    releases,
    gallery: (raw.gallery || []).filter(
      (u) => typeof u === "string" && /^https?:\/\//.test(u),
    ),
    tags: (raw.music_tags || [])
      .map((t) => String(t || "").trim())
      .filter(Boolean)
      .slice(0, 8),
    tiers: [],
    merch: [],
    giveaways: [],
    events: [],
  };
}

/* Upcoming events/workshops for an artist. */
async function fetchEvents(slug: string): Promise<PublicEvent[]> {
  try {
    const res = await fetch(`${TEOS_API}/public/artist/${encodeURIComponent(slug)}/events`);
    if (!res.ok) return [];
    const data = await res.json();
    const rows: any[] = data?.rows || [];
    return rows.map((r) => {
      const cur = r.currency || "USD";
      const price = Number(r.price) || 0;
      return {
        id: String(r.id),
        title: String(r.title || ""),
        description: String(r.description || ""),
        eventType: String(r.event_type || "event"),
        startsAt: r.starts_at || "",
        location: String(r.location || ""),
        isVirtual: r.is_virtual !== false,
        minTier: String(r.min_tier || "free"),
        price,
        priceLabel: price ? (cur === "USD" ? "$" : cur + " ") + price.toLocaleString() : "Free",
        spotsLeft: r.spots_left == null ? null : Number(r.spots_left),
        image: typeof r.image_url === "string" ? r.image_url : "",
      };
    });
  } catch {
    return [];
  }
}

/* Open giveaways for an artist. */
async function fetchGiveaways(slug: string): Promise<PublicGiveaway[]> {
  try {
    const res = await fetch(`${TEOS_API}/public/artist/${encodeURIComponent(slug)}/giveaways`);
    if (!res.ok) return [];
    const data = await res.json();
    const rows: any[] = data?.rows || [];
    return rows.map((r) => ({
      id: String(r.id),
      title: String(r.title || ""),
      description: String(r.description || ""),
      prize: String(r.prize || ""),
      image: typeof r.image_url === "string" ? r.image_url : "",
      minTier: String(r.min_tier || "free"),
    }));
  } catch {
    return [];
  }
}

/* Published merch for an artist (physical + digital). */
async function fetchMerch(slug: string): Promise<PublicMerchItem[]> {
  try {
    const res = await fetch(`${TEOS_API}/public/artist/${encodeURIComponent(slug)}/merch`);
    if (!res.ok) return [];
    const data = await res.json();
    const rows: any[] = data?.rows || [];
    return rows.map((r) => {
      const cur = r.currency || "USD";
      const price = r.price == null ? "" : (cur === "USD" ? "$" : cur + " ") + Number(r.price).toLocaleString();
      return {
        id: String(r.id),
        name: String(r.name || ""),
        description: String(r.description || ""),
        priceLabel: price,
        image: typeof r.image_url === "string" ? r.image_url : "",
        category: String(r.category || ""),
        variants: Array.isArray(r.variants) ? r.variants.map((v: any) => String(v)) : [],
      };
    });
  } catch {
    return [];
  }
}

/* Fetch tier perks and fold them into cumulative membership tiers.
 * The API returns perks grouped by the tier that introduces them; here we make
 * each tier card show everything a fan at that level unlocks (its own + lower). */
async function fetchTiers(slug: string): Promise<PublicTier[]> {
  try {
    const res = await fetch(`${TEOS_API}/public/artist/${encodeURIComponent(slug)}/perks`);
    if (!res.ok) return [];
    const data = await res.json();
    const byTier: Record<string, Array<{ title?: string; description?: string; category?: string }>> =
      data?.byTier || {};
    const prices: Record<string, Record<string, number>> = data?.prices || {};
    const fmtUSD = (a?: number) => (a == null ? "" : "$" + Number(a).toLocaleString() + "/mo");
    const fmtNGN = (a?: number) => (a == null ? "" : "₦" + Number(a).toLocaleString() + "/mo");
    let running: PublicPerk[] = [];
    const out: PublicTier[] = [];
    for (const meta of TIER_META) {
      const own = (byTier[meta.key] || []).map((p) => ({
        title: String(p.title || ""),
        description: String(p.description || ""),
        category: String(p.category || ""),
      }));
      running = running.concat(own);
      const pr = prices[meta.key] || {};
      out.push({ ...meta, perks: running.slice(), price: fmtUSD(pr.USD), priceNGN: fmtNGN(pr.NGN) });
    }
    // Only surface tiers that actually have perks.
    return out.filter((t) => t.perks.length > 0);
  } catch {
    return [];
  }
}

/* ─── Public API ─── */

/** All published, non-reserved artist slugs (for generateStaticParams). */
export async function fetchPublishedSlugs(): Promise<string[]> {
  try {
    // Static export: this runs at BUILD time. Do NOT use no-store — a dynamic
    // fetch makes the route dynamically-rendered, which output:export silently
    // drops from out/. Default (cached) fetch keeps the route exportable.
    const res = await fetch(`${TEOS_API}/public/artists`);
    if (!res.ok) return [];
    const data = await res.json();
    const rows: Array<{ slug: string }> = data?.rows || data || [];
    return rows
      .map((r) => String(r.slug || "").toLowerCase().trim())
      .filter((s) => s && !RESERVED_SLUGS.has(s));
  } catch {
    return [];
  }
}

/** Full public profile for one artist, mapped to the marketing view model. */
export async function fetchArtist(slug: string): Promise<PublicArtist | null> {
  const s = String(slug || "").toLowerCase().trim();
  if (!s || RESERVED_SLUGS.has(s)) return null;
  try {
    const res = await fetch(
      `${TEOS_API}/public/artist/${encodeURIComponent(s)}`,
    );
    if (!res.ok) return null;
    const raw: TeosArtistRaw = await res.json();
    if (!raw || !raw.slug) return null;
    const artist = mapArtist(raw);
    artist.tiers = await fetchTiers(s);
    artist.merch = await fetchMerch(s);
    artist.giveaways = await fetchGiveaways(s);
    artist.events = await fetchEvents(s);
    return artist;
  } catch {
    return null;
  }
}
