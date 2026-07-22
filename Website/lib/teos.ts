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
};

const FALLBACK_COLOR = "#ff6a3d";

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
  };
}

/* ─── Public API ─── */

/** All published, non-reserved artist slugs (for generateStaticParams). */
export async function fetchPublishedSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${TEOS_API}/public/artists`, {
      cache: "no-store",
    });
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
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const raw: TeosArtistRaw = await res.json();
    if (!raw || !raw.slug) return null;
    return mapArtist(raw);
  } catch {
    return null;
  }
}
