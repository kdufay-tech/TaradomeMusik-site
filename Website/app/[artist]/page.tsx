import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReleasePlayer from "../../components/ReleasePlayer";
import JoinCommunity from "../../components/JoinCommunity";
import { fetchArtist, fetchPublishedSlugs } from "../../lib/teos";

const SITE = "https://taradomemusik.com";

const PLATFORM_LABEL: Record<string, string> = {
  spotify: "Spotify",
  applemusic: "Apple Music",
  apple: "Apple Music",
  audiomack: "Audiomack",
  boomplay: "Boomplay",
  youtube: "YouTube",
  youtubemusic: "YouTube Music",
  soundcloud: "SoundCloud",
  deezer: "Deezer",
  tidal: "Tidal",
  instagram: "Instagram",
  twitter: "X",
  x: "X",
  facebook: "Facebook",
  tiktok: "TikTok",
};

function plabel(k: string): string {
  return PLATFORM_LABEL[k] || k.charAt(0).toUpperCase() + k.slice(1);
}

// Preferred order for the hero "Listen" call-to-action.
const LISTEN_ORDER = [
  "spotify",
  "applemusic",
  "apple",
  "audiomack",
  "boomplay",
  "youtubemusic",
  "youtube",
  "soundcloud",
  "deezer",
  "tidal",
];

/* Static export: only pre-rendered (published) slugs exist; anything else 404s. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await fetchPublishedSlugs();
  return slugs.map((artist) => ({ artist }));
}

export async function generateMetadata({
  params,
}: {
  params: { artist: string };
}): Promise<Metadata> {
  const a = await fetchArtist(params.artist);
  if (!a) return { title: "Artist — TáradomeMusik" };

  const url = `${SITE}/${a.slug}`;
  const title = `${a.name} — TáradomeMusik`;
  const description =
    a.shortBio || a.tagline || `${a.name} on TáradomeMusik.`;
  const image = a.heroImage || a.profileImage || undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title,
      description,
      siteName: "TáradomeMusik",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: { artist: string };
}) {
  const a = await fetchArtist(params.artist);
  if (!a) notFound();

  // Primary "Listen" target for the hero CTA: first available streaming DSP.
  const socialKeys = Object.keys(a.socials);
  let listenKey =
    LISTEN_ORDER.find((k) => a.socials[k]) ||
    socialKeys.find((k) => !!a.socials[k]) ||
    "";
  const listenUrl = listenKey ? a.socials[listenKey] : a.website || "";
  const listenLabel = listenKey
    ? `Listen on ${plabel(listenKey)}`
    : "Official Site";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: a.name,
    url: `${SITE}/${a.slug}`,
    genre: a.genre || undefined,
    description: a.shortBio || a.tagline || undefined,
    image: a.heroImage || a.profileImage || undefined,
    sameAs: Object.values(a.socials).filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        {a.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.heroImage}
            alt={a.name}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: a.brandGradient }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <div className="max-w-6xl mx-auto">
            {a.tagline ? (
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-[3px] h-5 rounded-sm"
                  style={{ background: a.brandColor }}
                />
                <span className="text-white/50 text-xs font-body tracking-[0.1em] uppercase">
                  {a.tagline}
                </span>
              </div>
            ) : null}
            <h1
              className="font-display text-white font-bold mb-2"
              style={{ fontSize: "clamp(48px, 8vw, 80px)" }}
            >
              {a.name}
            </h1>
            {a.subGenre ? (
              <p className="font-body text-lg text-white/50">{a.subGenre}</p>
            ) : null}
            {listenUrl ? (
              <a
                href={listenUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full font-body text-sm font-semibold text-ink-950 no-underline transition-transform hover:scale-[1.03]"
                style={{ background: a.brandColor }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                {listenLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="section-label" style={{ color: a.brandColor }}>
              About
            </span>
            <h2 className="section-heading mt-2 mb-6">{a.name}</h2>
            {(a.longBio || a.shortBio)
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p
                  key={i}
                  className="font-body text-white/45 leading-relaxed mb-4"
                >
                  {para}
                </p>
              ))}

            {a.genre || a.tags.length ? (
              <div className="flex gap-2 flex-wrap mt-6">
                {[a.genre, ...a.tags]
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={tag + i}
                      className="font-body text-[11px] tracking-wide text-white/55 border border-white/10 rounded-full px-3 py-1 capitalize"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            ) : null}

            {Object.keys(a.socials).length ? (
              <div className="flex gap-3 flex-wrap mt-5">
                {Object.entries(a.socials).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="dsp-badge no-underline hover:text-white/60 hover:border-white/20 transition-colors"
                  >
                    {plabel(platform)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {a.profileImage ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.profileImage}
                alt={`${a.name} profile`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Releases */}
      {a.releases.length ? (
        <section className="py-16 px-6 bg-ink-900 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto">
            <span className="section-label" style={{ color: a.brandColor }}>
              Discography
            </span>
            <h2 className="section-heading mt-2 mb-8">Releases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {a.releases.map((r) => (
                <ReleasePlayer
                  key={r.title}
                  title={r.title}
                  artistName={a.name}
                  date={r.date}
                  type={r.type}
                  coverImage={r.coverImage}
                  brandColor={r.brandColor}
                  spotifyId={r.spotifyId}
                  spotifyType={r.spotifyType}
                  presave={r.presave}
                  dsps={r.dsps}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Membership tiers — what each level unlocks */}
      {a.tiers.length ? (
        <section className="py-16 px-6 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto">
            <span className="section-label" style={{ color: a.brandColor }}>
              Membership
            </span>
            <h2 className="section-heading mt-2 mb-3">Join the inner circle</h2>
            <p className="text-white/50 text-sm mb-8 max-w-2xl">
              Each tier includes everything from the tiers below it. Become a fan
              to start at Bronze, then climb.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {a.tiers.map((t) => (
                <div
                  key={t.key}
                  className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.02] flex flex-col"
                >
                  <div
                    className="px-5 py-4"
                    style={{
                      borderTop: `3px solid ${t.color}`,
                      background: `${t.color}14`,
                    }}
                  >
                    <div className="text-white font-bold text-base">{t.short}</div>
                    <div className="text-white/50 text-xs">{t.label}</div>
                  </div>
                  <ul className="px-5 py-4 flex flex-col gap-3 flex-1">
                    {t.perks.map((p, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <span
                          className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full text-white text-[10px] leading-4 text-center"
                          style={{ background: t.color }}
                        >
                          ✓
                        </span>
                        <div className="min-w-0">
                          <div className="text-white/90 text-[13px] font-semibold">
                            {p.title}
                          </div>
                          {p.description ? (
                            <div className="text-white/45 text-[11.5px] leading-snug">
                              {p.description}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Join the community */}
      <JoinCommunity slug={a.slug} artistName={a.name} brandColor={a.brandColor} />

      {/* Gallery */}
      {a.gallery.length ? (
        <section className="py-16 px-6 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto">
            <span className="section-label" style={{ color: a.brandColor }}>
              Gallery
            </span>
            <h2 className="section-heading mt-2 mb-8">Visuals</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {a.gallery.slice(0, 12).map((src, i) => (
                <div
                  key={src + i}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${a.name} photo ${i + 1}`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Back link */}
      <div className="py-8 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/artists"
            className="font-body text-sm text-white/30 no-underline hover:text-white/60 transition-colors"
          >
            ← Back to Artists
          </Link>
        </div>
      </div>
    </div>
  );
}
