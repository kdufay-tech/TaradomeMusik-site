import { RELEASES } from "@/lib/data";
import ReleasePlayer from "@/components/ReleasePlayer";

export default function ReleasesPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label text-jade-400">Discography</span>
        <h1 className="section-heading mt-2 mb-4" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>All Releases.</h1>
        <p className="font-body text-white/40 text-sm mb-12">Click any release to play — streams count on Spotify.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {RELEASES.map((r) => (
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
  );
}
