import { RELEASES } from "@/lib/data";

export default function ReleasesPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <span className="section-label text-jade-400">Discography</span>
        <h1 className="section-heading mt-2 mb-4" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>All Releases.</h1>
        <p className="font-body text-white/40 text-sm mb-12">Tap to preview (up to 60 seconds) — jump directly to your streaming platform.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RELEASES.map((r) => (
            <div key={r.title} className="card-surface p-5">
              <div className="aspect-square rounded-lg mb-4 relative overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, #1a1a27, ${r.brandColor}30)` }}>
                <span className="font-display text-4xl font-bold" style={{ color: r.brandColor, opacity: 0.6 }}>{r.title.charAt(0)}</span>
                <span className="absolute top-2.5 left-2.5 bg-black/50 text-white/60 text-[10px] font-semibold font-body px-2.5 py-0.5 rounded-full tracking-wide uppercase">{r.type}</span>
              </div>
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
          ))}
        </div>
      </div>
    </section>
  );
}
