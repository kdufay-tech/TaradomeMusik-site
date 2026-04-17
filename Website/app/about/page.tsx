import Link from "next/link";
import { SITE, ECOSYSTEM } from "@/lib/data";

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-ink-950 pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <span className="section-label text-sand-200">About</span>
        <h1 className="section-heading mt-2 mb-6" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>The Institution.</h1>
        <div className="space-y-6 font-body text-white/45 leading-relaxed">
          <p>TáradomeMusik was founded in 2021 on a conviction: African artists deserve more than a platform — they deserve a partner who fights for ownership, invests in development, and builds toward generational wealth.</p>
          <p>We are the music division of TáraDome Entertainment Group, an African-owned institution spanning music, film, fashion, and technology. Rooted in Lagos, distributed globally across Spotify, Apple Music, Boomplay, AudioMack, and OneRPM.</p>
          <p>Based at {SITE.address} — our mission is to build lasting, profitable careers for our artists through transparent, data-informed, and creatively empowering partnership.</p>
          <h2 className="font-display text-2xl font-bold text-white mt-12 mb-4">Our Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { t: "Artist-Centricity", d: "Artists are primary stakeholders in every decision we make." },
              { t: "Masters Ownership", d: "Artists retain their catalog. Always. No exceptions." },
              { t: "Data-Informed Creativity", d: "Fan analytics combined with instinct and cultural knowledge." },
              { t: "Operational Excellence", d: "Repeatable systems that scale with the roster." },
            ].map((p) => (
              <div key={p.t} className="card-surface p-5">
                <h4 className="font-body text-sm font-semibold text-white mb-1">{p.t}</h4>
                <p className="font-body text-[13px] text-white/35">{p.d}</p>
              </div>
            ))}
          </div>
          <h2 className="font-display text-2xl font-bold text-white mt-12 mb-4">The Ecosystem</h2>
          <div className="flex gap-3 flex-wrap">
            {ECOSYSTEM.map((d) => (
              <a key={d.name} href={d.url} target={d.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                className="ecosystem-link no-underline" style={{ color: d.color, borderColor: `${d.color}25` }}>
                {d.name} {d.url.startsWith("http") ? "↗" : ""}
              </a>
            ))}
          </div>
          <h2 className="font-display text-2xl font-bold text-white mt-12 mb-4">Contact</h2>
          <p>General: <a href={`mailto:${SITE.email.general}`} className="text-ember-400 no-underline">{SITE.email.general}</a></p>
          <p>Booking: <a href={`mailto:${SITE.email.booking}`} className="text-ember-400 no-underline">{SITE.email.booking}</a></p>
          <p>Lagos: <a href={`tel:${SITE.phone.lagos}`} className="text-white/60 no-underline">+234 916 012 3499</a></p>
          <p>USA: <a href={`tel:${SITE.phone.usa}`} className="text-white/60 no-underline">+1 678 379 8706</a></p>
        </div>
      </div>
    </section>
  );
}
