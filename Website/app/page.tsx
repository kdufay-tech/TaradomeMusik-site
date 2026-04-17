import Image from "next/image";
import Link from "next/link";
import { ARTISTS, RELEASES, ECOSYSTEM, SITE } from "@/lib/data";

/* ════════════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden px-6 pt-28 pb-20"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,106,61,0.07) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(47,230,184,0.03) 0%, transparent 60%),
          #07070a
        `,
      }}
    >
      <div className="grain-overlay" />

      {/* Institution badge */}
      <div className="brand-pill mb-8 relative z-10 opacity-0 animate-fade-up">
        <span className="w-1.5 h-1.5 rounded-full bg-jade-400" style={{ boxShadow: "0 0 8px #2fe6b8" }} />
        A Music Institution · Est. 2021
      </div>

      {/* Headline */}
      <h1 className="font-display font-bold text-white leading-[1.05] tracking-tight mb-6 relative z-10 opacity-0 animate-fade-up-delay"
        style={{ fontSize: "clamp(42px, 7vw, 88px)" }}
      >
        African Artistry.
        <br />
        <span className="text-gradient-warm">Global Legacy.</span>
      </h1>

      {/* Subheadline */}
      <p className="font-body text-white/50 leading-relaxed max-w-lg mb-10 relative z-10 opacity-0 animate-fade-up-delay-2"
        style={{ fontSize: "clamp(15px, 2vw, 18px)" }}
      >
        {SITE.description}
      </p>

      {/* CTAs */}
      <div className="flex gap-4 flex-wrap justify-center relative z-10 opacity-0 animate-fade-up-delay-2">
        <Link href="/artists"
          className="bg-white text-ink-950 px-8 py-3.5 rounded-lg text-sm font-semibold font-body tracking-wide no-underline hover:bg-white/90 transition-colors"
        >
          Discover Artists
        </Link>
        <Link href="/releases"
          className="border border-white/15 text-white px-8 py-3.5 rounded-lg text-sm font-semibold font-body tracking-wide no-underline hover:border-white/30 transition-colors"
        >
          Listen Now
        </Link>
        <a href="https://onerpm.link/143394760138" target="_blank" rel="noreferrer"
          className="border border-ember-400/30 text-ember-400 px-8 py-3.5 rounded-lg text-sm font-semibold font-body tracking-wide no-underline hover:border-ember-400/60 transition-colors"
        >
          Pre-Save ↗
        </a>
      </div>

      {/* Scrolling ticker */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-10 border-t border-white/[0.04] flex items-center">
        <div className="flex gap-12 animate-ticker whitespace-nowrap text-white/20 text-xs font-body tracking-[0.1em] uppercase font-medium">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="flex gap-12">
              <span>✦ Easy On Me — IRhay</span>
              <span>✦ Wings — IRhay</span>
              <span>✦ Surface — IRhay</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   ARTIST CARDS
   ════════════════════════════════════════════════════════════ */
function ArtistCard({ artist, index }: { artist: typeof ARTISTS[number]; index: number }) {
  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="group block no-underline"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div
        className="artist-card group-hover:border-white/20"
        style={{
          ["--brand" as string]: artist.brandColor,
        }}
      >
        {/* Photo */}
        <Image
          src={artist.heroImage}
          alt={artist.name}
          fill
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-[3px] h-4 rounded-sm"
              style={{ background: artist.brandColor }}
            />
            <span className="text-white/50 text-[11px] font-body tracking-[0.1em] uppercase">
              {artist.origin}
            </span>
          </div>
          <h3 className="font-display text-[28px] font-bold text-white mb-1">
            {artist.name}
          </h3>
          <p className="font-body text-[13px] text-white/45">
            {artist.subGenre}
          </p>
          <p
            className="font-body text-[13px] mt-1 italic"
            style={{ color: artist.brandColor }}
          >
            &ldquo;{artist.tagline}&rdquo;
          </p>
        </div>
      </div>
    </Link>
  );
}

function ArtistsSection() {
  return (
    <section className="bg-ink-950 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-12">
          <div>
            <span className="section-label text-ember-400">Our Roster</span>
            <h2 className="section-heading mt-2">The Artists.</h2>
          </div>
          <Link href="/artists" className="nav-link border-b border-white/10 pb-0.5 no-underline">
            Full Roster →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARTISTS.map((a, i) => (
            <ArtistCard key={a.slug} artist={a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   RELEASES
   ════════════════════════════════════════════════════════════ */
function ReleaseCard({ release, index }: { release: typeof RELEASES[number]; index: number }) {
  return (
    <div className="card-surface p-5" style={{ animationDelay: `${index * 0.15}s` }}>
      {/* Cover art placeholder — replace with actual cover art when available */}
      <div
        className="aspect-square rounded-lg mb-4 relative overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, #1a1a27, ${release.brandColor}30)`,
        }}
      >
        <span
          className="font-display text-4xl font-bold"
          style={{ color: release.brandColor, opacity: 0.6 }}
        >
          {release.title.charAt(0)}
        </span>
        <span className="absolute top-2.5 left-2.5 bg-black/50 text-white/60 text-[10px] font-semibold font-body px-2.5 py-0.5 rounded-full tracking-wide uppercase">
          {release.type}
        </span>
      </div>

      <h4 className="font-body text-base font-semibold text-white mb-1">
        {release.title}
      </h4>
      <p className="font-body text-[13px] text-white/40 mb-0.5">{release.artistName}</p>
      <p className="font-body text-[11px] text-white/25">{release.date}</p>

      {/* DSP badges */}
      <div className="flex gap-2 mt-3.5 flex-wrap">
        {Object.keys(release.dsps).map((dsp) => (
          <a
            key={dsp}
            href={(release.dsps as Record<string, string>)[dsp]}
            target="_blank"
            rel="noreferrer"
            className="dsp-badge no-underline hover:text-white/60 hover:border-white/20 transition-colors"
          >
            {dsp.charAt(0).toUpperCase() + dsp.slice(1)}
          </a>
        ))}
        {release.presave && (
          <a
            href={release.presave}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-body text-ember-400 border border-ember-400/30 px-2.5 py-0.5 rounded-full font-semibold tracking-wide no-underline hover:border-ember-400/60 transition-colors"
          >
            Pre-Save
          </a>
        )}
      </div>
    </div>
  );
}

function ReleasesSection() {
  return (
    <section className="bg-ink-900 py-24 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="section-label text-jade-400">New Music</span>
          <h2 className="section-heading mt-2">Latest Releases.</h2>
          <p className="font-body text-sm text-white/35 mt-3">
            Tap to preview (up to 60 seconds) — jump directly to your streaming platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RELEASES.map((r, i) => (
            <ReleaseCard key={r.title} release={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   INSTITUTION / PILLARS
   ════════════════════════════════════════════════════════════ */
const PILLARS = [
  { label: "Artist-Centricity", desc: "Artists are primary stakeholders in every decision we make.", icon: "◇" },
  { label: "Masters Ownership", desc: "Artists retain their catalog. Always. No exceptions.", icon: "✦" },
  { label: "Data-Informed Creativity", desc: "Fan analytics combined with instinct and cultural knowledge.", icon: "◈" },
  { label: "Operational Excellence", desc: "Repeatable systems that scale with the roster.", icon: "❖" },
];

function InstitutionSection() {
  return (
    <section className="bg-ink-950 py-24 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="section-label text-sand-200">The Institution</span>
          <h2 className="section-heading mt-2">Not just a label. A legacy.</h2>
          <p className="font-body text-base text-white/45 max-w-xl leading-relaxed mt-4">
            TáradomeMusik was founded on a conviction: African artists deserve
            more than a platform — they deserve a partner who fights for ownership,
            invests in development, and builds toward generational wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p) => (
            <div key={p.label} className="card-surface p-6">
              <span className="text-xl text-sand-200 block mb-3">{p.icon}</span>
              <h4 className="font-body text-[15px] font-semibold text-white mb-1.5">
                {p.label}
              </h4>
              <p className="font-body text-[13px] text-white/35 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-16 mt-16 flex-wrap">
          {[
            { val: "2021", label: "Founded" },
            { val: "2", label: "Artists on Roster" },
            { val: "3", label: "Releases Out Now" },
            { val: "Lagos", label: "Headquarters" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold text-white">
                {s.val}
              </div>
              <div className="font-body text-[11px] text-white/30 tracking-[0.12em] uppercase mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   SPOTLIGHT (Artist of the Month)
   ════════════════════════════════════════════════════════════ */
function SpotlightSection() {
  const featured = ARTISTS[0]; // IRhay
  return (
    <section className="bg-ink-900 py-24 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto">
        <span className="section-label text-ember-400">
          Artist of the Month · April 2026
        </span>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Photo */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src={featured.heroImage}
              alt={featured.name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
            <div className="absolute top-4 left-4 brand-pill text-[10px]">
              ✦ Featured Artist
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display text-4xl font-bold text-white mb-2">
              {featured.name}
            </h3>
            <p className="font-body text-sm text-white/40 mb-6">
              {featured.genre} · {featured.origin}
            </p>
            <blockquote
              className="font-display italic text-xl text-white/70 border-l-2 pl-4 mb-6"
              style={{ borderColor: featured.brandColor }}
            >
              &ldquo;Music that feels like a safe space.&rdquo;
            </blockquote>
            <p className="font-body text-sm text-white/40 leading-relaxed mb-8">
              This month we spotlight IRhay&apos;s evolving sound — soulful Afro-fusion
              rooted in emotional honesty and upliftment. Fans get early snippets,
              behind-the-scenes footage, and exclusive drops through the CRM.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/join"
                className="bg-ember-400 text-white px-6 py-3 rounded-lg text-sm font-semibold font-body no-underline hover:bg-ember-500 transition-colors"
              >
                Join the fan list
              </Link>
              <Link
                href={`/artists/${featured.slug}`}
                className="border border-white/15 text-white px-6 py-3 rounded-lg text-sm font-semibold font-body no-underline hover:border-white/30 transition-colors"
              >
                Full Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FAN CTA
   ════════════════════════════════════════════════════════════ */
function FanCTASection() {
  return (
    <section className="bg-ink-950 py-20 px-6 border-t border-white/[0.04]">
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="font-display text-2xl font-bold text-white mb-3">
          Join the Fan List
        </h3>
        <p className="font-body text-sm text-white/40 mb-6">
          Early drops, behind-the-scenes, VIP access — delivered by CRM segmentation.
        </p>
        <form
          className="flex gap-3 max-w-md mx-auto"
          action="/api/crm/subscribe"
          method="POST"
        >
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            required
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm font-body text-white placeholder:text-white/25 focus:outline-none focus:border-ember-400/40 transition-colors"
          />
          <button
            type="submit"
            className="bg-ember-400 text-white px-6 py-3 rounded-lg text-sm font-semibold font-body hover:bg-ember-500 transition-colors whitespace-nowrap"
          >
            Join Free
          </button>
        </form>
        <p className="font-body text-[11px] text-white/20 mt-3">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   ECOSYSTEM BAR
   ════════════════════════════════════════════════════════════ */
function EcosystemBar() {
  return (
    <section className="bg-ink-800 py-16 px-6 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 flex-wrap">
        <span className="font-body text-xs text-white/30 tracking-[0.1em] uppercase">
          Part of TáraDome Entertainment Group
        </span>
        <div className="flex gap-3">
          {ECOSYSTEM.map((d) => (
            <a
              key={d.name}
              href={d.url}
              target={d.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="ecosystem-link no-underline"
              style={{
                color: d.active ? d.color : "rgba(255,255,255,0.25)",
                borderColor: d.active ? `${d.color}25` : "rgba(255,255,255,0.06)",
              }}
            >
              {d.name} {d.url.startsWith("http") ? "↗" : ""}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-ink-950 pt-16 pb-8 px-6 border-t border-white/[0.04] font-body">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div>
          <div className="mb-4">
            <span className="font-display text-[22px] font-bold text-white">
              Táradome
            </span>
            <span className="text-[10px] font-bold text-ember-400 tracking-[0.2em] uppercase ml-1.5">
              MUSIK
            </span>
          </div>
          <p className="text-[13px] text-white/30 leading-relaxed max-w-[240px]">
            An African-owned music institution — building legacy, one release at a time.
          </p>
          {/* Social icons row */}
          <div className="flex gap-3 mt-4">
            {[
              { label: "IG", url: "https://www.instagram.com/taradomemusik_/" },
              { label: "YT", url: "https://www.youtube.com/@irhayofficial" },
              { label: "X", url: "https://x.com/irhayofficial" },
              { label: "SP", url: "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP" },
              { label: "AM", url: "https://audiomack.com/irhayofficial" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-white/30 border border-white/[0.08] rounded-md px-2 py-1 no-underline hover:text-white/60 hover:border-white/20 transition-colors font-semibold tracking-wide"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Music */}
        <div>
          <h5 className="text-[11px] text-white/50 tracking-[0.12em] uppercase font-semibold mb-4">
            Music
          </h5>
          {[
            { label: "New Releases", href: "/releases" },
            { label: "Artists", href: "/artists" },
            { label: "Spotlight", href: "/spotlight" },
            { label: "Sync Licensing", href: "/contact" },
            { label: "Submit Music", href: "/studio" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="block text-[13px] text-white/30 no-underline mb-2.5 hover:text-white/60 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Company */}
        <div>
          <h5 className="text-[11px] text-white/50 tracking-[0.12em] uppercase font-semibold mb-4">
            Company
          </h5>
          {[
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Studio", href: "/studio" },
            { label: "Privacy Policy", href: "/privacy" },
          ].map((l) => (
            <Link key={l.label} href={l.href} className="block text-[13px] text-white/30 no-underline mb-2.5 hover:text-white/60 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h5 className="text-[11px] text-white/50 tracking-[0.12em] uppercase font-semibold mb-4">
            Contact
          </h5>
          <a href={`mailto:${SITE.email.general}`} className="block text-[13px] text-white/30 no-underline mb-2.5 hover:text-white/60 transition-colors">
            {SITE.email.general}
          </a>
          <a href={`mailto:${SITE.email.booking}`} className="block text-[13px] text-white/30 no-underline mb-2.5 hover:text-white/60 transition-colors">
            {SITE.email.booking}
          </a>
          <a href={`tel:${SITE.phone.lagos}`} className="block text-[13px] text-white/30 no-underline mb-2.5 hover:text-white/60 transition-colors">
            Lagos: +234 916 012 3499
          </a>
          <a href={`tel:${SITE.phone.usa}`} className="block text-[13px] text-white/30 no-underline mb-1 hover:text-white/60 transition-colors">
            USA: +1 678 379 8706
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04] pt-6 flex justify-between items-center flex-wrap gap-4 max-w-6xl mx-auto">
        <span className="text-xs text-white/20">
          © 2026 TáraDome Entertainment Group. All rights reserved.
        </span>
        <div className="flex gap-4">
          <Link href="/privacy" className="text-xs text-white/20 no-underline hover:text-white/40 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/privacy" className="text-xs text-white/20 no-underline hover:text-white/40 transition-colors">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ArtistsSection />
      <ReleasesSection />
      <InstitutionSection />
      <SpotlightSection />
      <FanCTASection />
      <EcosystemBar />
      <Footer />
    </>
  );
}
