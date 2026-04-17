export default function StudioPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <span className="section-label text-ember-400">Submit</span>
        <h1 className="section-heading mt-2 mb-4" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>Artist Intake</h1>
        <p className="font-body text-white/40 text-sm mb-10 leading-relaxed">
          TáradomeMusik is selectively expanding our roster. If your sound aligns with our vision — African artistry with global reach — we want to hear from you.
        </p>
        <form action="/api/artist-intake" method="POST" className="space-y-5">
          {[
            { name: "artistName", label: "Artist / Stage Name", type: "text" },
            { name: "realName", label: "Legal Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "origin", label: "City / Country", type: "text" },
            { name: "genre", label: "Genre(s)", type: "text" },
            { name: "spotify", label: "Spotify / Streaming Link", type: "url" },
            { name: "instagram", label: "Instagram", type: "url" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block font-body text-xs text-white/40 mb-1.5 tracking-wide uppercase">{f.label}</label>
              <input type={f.type} name={f.name} required className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-body text-white placeholder:text-white/20 focus:outline-none focus:border-ember-400/40 transition-colors" />
            </div>
          ))}
          <div>
            <label className="block font-body text-xs text-white/40 mb-1.5 tracking-wide uppercase">Tell us about yourself</label>
            <textarea name="bio" rows={4} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-body text-white placeholder:text-white/20 focus:outline-none focus:border-ember-400/40 transition-colors resize-none" />
          </div>
          <button type="submit" className="w-full bg-ember-400 text-white py-3.5 rounded-lg text-sm font-semibold font-body hover:bg-ember-500 transition-colors">
            Submit Application
          </button>
          <p className="font-body text-[11px] text-white/20 text-center">We review every submission. Response within 2 weeks.</p>
        </form>
      </div>
    </section>
  );
}
