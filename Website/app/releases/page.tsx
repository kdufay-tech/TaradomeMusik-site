import Image from "next/image";
import { RELEASES } from "@/lib/data";

export default function ReleasesPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label text-jade-400">Discography</span>
        <h1 className="section-heading mt-2 mb-4" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>All Releases.</h1>
        <p className="font-body text-white/40 text-sm mb-12">Tap to preview (up to 60 seconds) — jump directly to your streaming platform.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {RELEASES.map((r) => (
            <div key={r.title} className="release-cover-card" style={{ "--glow": `${r.brandColor}30` } as React.CSSProperties}>
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={r.coverImage}
                  alt={`${r.title} — ${r.artistName}`}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 pointer-events-none z-10"
                  style={{ background: "linear-gradient(to top, rgba(7,7,10,0.7) 0%, transparent 50%)" }} />
                <span className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-sm text-white/70 text-[10px] font-semibold font-body px-3 py-1 rounded-full tracking-wide uppercase border border-white/[0.08]">
                  {r.type}
                </span>
              </div>
              <div className="p-5">
                <h4 className="font-body text-base font-semibold text-white mb-1">{r.title}</h4>
                <p className="font-body text-[13px] text-white/40 mb-0.5">{r.artistName}</p>
                <p className="font-body text-[11px] text-white/25">{r.date}</p>
                <div className="flex gap-2 mt-3.5 flex-wrap">
                  {Object.keys(r.dsps).map((dsp) => (
                    <a key={dsp} href={(r.dsps as Record<string, string>)[dsp]} target="_blank" rel="noreferrer" className="dsp-badge no-underline hover:text-white/60 transition-colors capitalize">{dsp}</a>
                  ))}
                  {r.presave && <a href={r.presave} target="_blank" rel="noreferrer" className="text-[10px] font-body text-ember-400 border border-ember-400/30 px-2.5 py-0.5 rounded-full font-semibold tracking-wide no-underline hover:border-ember-400/60 transition-colors">Pre-Save</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
