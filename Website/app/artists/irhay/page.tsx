import Image from "next/image";
import Link from "next/link";
import { ARTISTS, RELEASES } from "@/lib/data";
import ReleasePlayer from "@/components/ReleasePlayer";

const artist = ARTISTS[0]; // IRhay
const artistReleases = RELEASES.filter((r) => r.artistSlug === "irhay");

export default function IRhayPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        <Image
          src={artist.heroImage}
          alt={artist.name}
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-[3px] h-5 rounded-sm" style={{ background: artist.brandColor }} />
              <span className="text-white/50 text-xs font-body tracking-[0.1em] uppercase">
                {artist.origin}
              </span>
            </div>
            <h1 className="font-display text-white font-bold mb-2"
              style={{ fontSize: "clamp(48px, 8vw, 80px)" }}
            >
              {artist.name}
            </h1>
            <p className="font-body text-lg text-white/50">{artist.subGenre}</p>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="section-label" style={{ color: artist.brandColor }}>About</span>
            <h2 className="section-heading mt-2 mb-6">The Hopeful Dreamer</h2>
            <p className="font-body text-white/45 leading-relaxed mb-4">
              IRhay is a soulful, introspective, emotionally expressive Afro-fusion artist
              with a clean yet slightly eccentric visual style. His image balances soft
              masculinity, vulnerability, and depth, capturing the energy of a young man
              who is still becoming.
            </p>
            <p className="font-body text-white/45 leading-relaxed mb-6">
              He represents the &ldquo;relatable dreamer&rdquo; — someone who wears his feelings
              with subtle flair and uses his voice to explore love, ambition, and identity
              with authenticity. Hopeful but layered, stylish but grounded, emotionally
              open but still guarded.
            </p>

            {/* Streaming links */}
            <div className="flex gap-3 flex-wrap">
              {Object.entries(artist.socials).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="dsp-badge no-underline hover:text-white/60 hover:border-white/20 transition-colors capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Profile image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <Image
              src="/images/irhay-profile.jpg"
              alt="IRhay profile"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Releases */}
      <section className="py-16 px-6 bg-ink-900 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <span className="section-label" style={{ color: artist.brandColor }}>Discography</span>
          <h2 className="section-heading mt-2 mb-8">Releases</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {artistReleases.map((r) => (
              <ReleasePlayer
                key={r.title}
                title={r.title}
                artistName={r.artistName}
                date={r.date}
                type={r.type}
                coverImage={r.coverImage}
                brandColor={r.brandColor}
                spotifyId={r.spotifyId}
                spotifyType={r.spotifyType}
                presave={r.presave}
                dsps={r.dsps as Record<string, string>}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <span className="section-label" style={{ color: artist.brandColor }}>Gallery</span>
          <h2 className="section-heading mt-2 mb-8">Visuals</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["/images/irhay-alt-1.jpg", "/images/irhay-alt-2.jpg", "/images/irhay-alt-3.jpg",
              "/images/irhay-alt-4.jpg", "/images/irhay-alt-5.jpg", "/images/irhay-alt-6.jpg"].map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                <Image src={src} alt={`IRhay photo ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="py-8 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <Link href="/artists" className="font-body text-sm text-white/30 no-underline hover:text-white/60 transition-colors">
            ← Back to Artists
          </Link>
        </div>
      </div>
    </div>
  );
}
