import Image from "next/image";
import Link from "next/link";
import { ARTISTS } from "@/lib/data";

export default function ArtistsPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label text-ember-400">The Roster</span>
        <h1 className="font-display text-white font-bold tracking-tight mt-2 mb-4"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Our Artists.
        </h1>
        <p className="font-body text-white/40 text-base max-w-lg mb-12 leading-relaxed">
          Every artist on TáradomeMusik retains their masters. We invest in development,
          data-informed strategy, and long-term career architecture.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ARTISTS.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artists/${artist.slug}`}
              className="group block no-underline"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] group-hover:border-white/20 transition-all duration-500 group-hover:-translate-y-1"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={artist.heroImage}
                  alt={artist.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-[3px] h-5 rounded-sm" style={{ background: artist.brandColor }} />
                    <span className="text-white/50 text-xs font-body tracking-[0.1em] uppercase">
                      {artist.origin}
                    </span>
                  </div>
                  <h2 className="font-display text-4xl font-bold text-white mb-2">
                    {artist.name}
                  </h2>
                  <p className="font-body text-sm text-white/45 mb-1">{artist.subGenre}</p>
                  <p className="font-body text-sm mt-2 italic" style={{ color: artist.brandColor }}>
                    &ldquo;{artist.tagline}&rdquo;
                  </p>
                  <p className="font-body text-sm text-white/30 mt-3 leading-relaxed max-w-sm">
                    {artist.shortBio}
                  </p>
                  <span className="inline-block mt-4 text-xs font-body font-semibold tracking-wide text-white/50 border-b border-white/20 pb-0.5 group-hover:text-white/80 group-hover:border-white/40 transition-colors">
                    View Profile →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
