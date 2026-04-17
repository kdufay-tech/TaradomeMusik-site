"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { site } from "@/data/site";
import { AudioPreview } from "@/components/AudioPreview";
import { formatDate } from "@/lib/utils";

// ─── Intersection observer hook ──────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("in-view"); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Waveform bars (hero decoration) ─────────────────
const BARS = Array.from({ length: 38 }, (_, i) => ({
  h:  22 + Math.abs(Math.sin(i * 0.55)) * 78,
  d:  i * 0.048,
  ac: i % 7 === 0,
}));

// ─── Section label atom ───────────────────────────────
function Label({ text, color = "ember" }: { text: string; color?: "ember" | "jade" }) {
  const c = color === "jade" ? "#2fe6b8" : "#ff6a3d";
  return (
    <div className="flex items-center gap-3 mb-4" style={{ fontFamily:"'Syne',sans-serif", fontSize:"10.5px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:c }}>
      <span style={{ display:"inline-block", width:"28px", height:"1px", background:c, flexShrink:0 }}/>
      {text}
    </div>
  );
}

// ─── DSP badge row ────────────────────────────────────
function DspBadges({ links }: { links: Record<string, string | undefined> }) {
  const platforms: Record<string, string> = {
    spotify:"Spotify", apple:"Apple Music", boomplay:"Boomplay", audiomack:"AudioMack", presave:"Pre-Save",
  };
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {Object.entries(links).map(([key, href]) =>
  platforms[key] && href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer"
            className="border border-white/10 px-2.5 py-1 text-white/40 hover:text-white hover:border-white/35 transition-colors"
            style={{ fontFamily:"'Syne',sans-serif", fontSize:"8.5px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}
          >{platforms[key]}</a>
        ) : null
      )}
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────
function HeroSection() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const featured = site.releases[0];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ paddingTop:"72px" }}>

      {/* Extra ambient glow layers */}
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background:"radial-gradient(ellipse 70% 60% at 15% 20%, rgba(255,77,45,0.14), transparent)" }}/>
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background:"radial-gradient(ellipse 50% 50% at 85% 70%, rgba(47,230,184,0.08), transparent)" }}/>

      {/* Main grid */}
      <div className="mx-auto w-full max-w-7xl flex-1 grid items-center gap-10 md:grid-cols-12 px-6 md:px-10 py-16 md:py-24">

        {/* Left: Copy */}
        <div className="md:col-span-7 animate-fadeUp">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-8"
            style={{ fontFamily:"'Syne',sans-serif", fontSize:"10.5px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"#ff6a3d" }}>
            <span className="inline-block w-7 h-px bg-ember-400"/>
            A Music Institution · Est. 2021
          </div>

          {/* Headline */}
          <h1 className="mb-6 leading-none">
            <span className="block text-sand-100"
              style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(52px,7.5vw,96px)", fontWeight:900, letterSpacing:"-0.035em" }}>
              African
            </span>
            <span className="block"
              style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(52px,7.5vw,96px)", fontWeight:900, letterSpacing:"-0.035em",
                background:"linear-gradient(130deg,#ffd07a 0%,#ff6a3d 65%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Artistry.
            </span>
            <span className="block text-white/40 mt-2"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(20px,3vw,40px)", fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase" }}>
              Global Legacy.
            </span>
          </h1>

          <p className="max-w-lg text-white/55 mb-10 leading-relaxed" style={{ fontSize:"clamp(15px,1.6vw,17px)", fontFamily:"'DM Sans',sans-serif" }}>
            {site.mission}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-12">
            <Link href="/artists"
              className="bg-ember-500 hover:bg-ember-400 text-white transition-colors px-8 py-4"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
              Discover Artists
            </Link>
            <Link href="/releases"
              className="border border-white/20 hover:border-white/50 text-white px-8 py-4 transition-colors"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
              Listen Now
            </Link>
            <a href={site.presaveUrl} target="_blank" rel="noopener noreferrer"
              className="border border-jade-400/40 hover:border-jade-400 text-jade-400 px-8 py-4 transition-colors"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
              Pre-Save ↗
            </a>
          </div>

          {/* Inline CRM form */}
          <div className="rounded-2xl border border-white/08 bg-white/[0.03] p-5">
            <div className="mb-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,240,214,0.5)" }}>
              Join the Fan List
            </div>
            <p className="text-white/40 text-sm mb-4" style={{ fontFamily:"'DM Sans',sans-serif" }}>
              Early drops, behind-the-scenes, VIP access — delivered by CRM segmentation.
            </p>
            {joined ? (
              <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"20px", color:"#2fe6b8" }}>
                You're in. Welcome to the circle.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (email) setJoined(true); }} className="flex gap-2 flex-wrap">
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" name="email"
                  className="h-12 flex-1 min-w-0 border border-white/10 bg-ink-900 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-ember-500/50 transition-colors"
                  style={{ fontFamily:"'DM Sans',sans-serif" }}
                />
                <button type="submit"
                  className="h-12 px-6 bg-ember-500 hover:bg-ember-400 text-white transition-colors"
                  style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", flexShrink:0 }}>
                  Join Free
                </button>
              </form>
            )}
            <p className="text-white/25 text-[11px] mt-2" style={{ fontFamily:"'DM Sans',sans-serif" }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Right: Featured release card */}
        <div className="md:col-span-5 flex justify-center items-center animate-float">
          <div className="w-full max-w-sm border border-white/08 bg-white/[0.04] overflow-hidden"
            style={{ boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>

            {/* Art */}
            <div className="relative w-full aspect-square overflow-hidden">
              <Image src={featured.cover} alt={featured.title} fill className="object-cover" />
              <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, transparent 50%, rgba(7,7,10,0.9) 100%)" }}/>
              <div className="absolute top-3 left-3 bg-ink-950/80 px-2.5 py-1"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#ff6a3d" }}>
                ✦ Latest Release
              </div>
              {/* Vinyl rings overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[110,72,40].map(sz => (
                  <div key={sz} className="absolute rounded-full border border-white/08"
                    style={{ width:`${sz}px`, height:`${sz}px` }}/>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="text-white/30 mb-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase" }}>
                {featured.type} · {new Date(featured.date).getFullYear()}
              </div>
              <div className="text-sand-100 mb-1" style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"22px", fontWeight:800, lineHeight:1.2 }}>
                {featured.title}
              </div>
              <div className="text-white/45 mb-4 text-sm" style={{ fontFamily:"'DM Sans',sans-serif" }}>
                {featured.artist}
              </div>
              <AudioPreview src={featured.previewUrl} />
              <DspBadges links={featured.dspLinks} />
            </div>
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-end justify-center gap-px h-12 overflow-hidden px-10">
        {BARS.map((b, i) => (
          <div key={i} style={{
            width:"2.5px", flexShrink:0,
            height:`${b.h}%`,
            background: b.ac ? "#ff6a3d" : `rgba(255,240,214,${0.06 + b.h * 0.0012})`,
            animation:`waveBar ${0.75 + (b.h / 100) * 1.1}s ease-in-out infinite`,
            animationDelay:`${b.d}s`,
          }}/>
        ))}
      </div>

      {/* Marquee */}
      <div className="bg-ember-500 py-3 overflow-hidden whitespace-nowrap">
        <div style={{ display:"inline-flex", animation:"marquee 26s linear infinite" }}>
          {[...Array(5)].flatMap((_, ri) =>
            site.releases.map(r => (
              <span key={`${r.id}-${ri}`} className="text-white/85 px-8"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"10.5px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}>
                {r.title} — {r.artist} &nbsp;✦
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// ─── ARTISTS ─────────────────────────────────────────
function ArtistsSection() {
  const ref = useReveal();
  const [hov, setHov] = useState<string | null>(null);

  return (
    <section ref={ref} className="reveal py-24 md:py-32 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <Label text="Our Roster" />
            <h2 className="text-sand-100 leading-none"
              style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(36px,5vw,64px)", fontWeight:900, letterSpacing:"-0.03em" }}>
              The Artists<span className="text-ember-400">.</span>
            </h2>
          </div>
          <Link href="/artists"
            className="text-sand-300 border-b border-sand-300 pb-0.5 hover:text-white hover:border-white transition-colors"
            style={{ fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
            Full Roster →
          </Link>
        </div>

        <div className="grid gap-px" style={{ gridTemplateColumns:"repeat(2, 1fr)" }}>
          {site.roster.map(a => (
            <Link key={a.slug} href={`/artists/${a.slug}`}
              onMouseEnter={() => setHov(a.slug)}
              onMouseLeave={() => setHov(null)}
              className="relative overflow-hidden cursor-pointer block"
              style={{ aspectRatio:"3/4" }}
            >
              {/* Image */}
              <Image src={a.image} alt={a.name} fill
                className="object-cover transition-transform duration-500"
                style={{ transform: hov === a.slug ? "scale(1.06)" : "scale(1)" }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 transition-opacity duration-400"
                style={{ background:`linear-gradient(to top, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.3) 50%, transparent 100%)`,
                  opacity: hov === a.slug ? 1 : 0.75 }}/>

              {/* Accent line top */}
              <div className="absolute top-0 left-0 right-0 h-0.5 transition-colors duration-300"
                style={{ background: hov === a.slug ? "#ff6a3d" : "transparent" }}/>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-white/45 mb-1.5 transition-all duration-300"
                  style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase",
                    transform: hov === a.slug ? "none" : "translateY(4px)", opacity: hov === a.slug ? 1 : 0.6 }}>
                  {a.origin}
                </div>
                <div className="text-sand-100 mb-1.5"
                  style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(22px,3vw,32px)", fontWeight:800, lineHeight:1.15 }}>
                  {a.name}
                </div>
                <div className="transition-all duration-300 text-white/45 text-sm"
                  style={{ fontFamily:"'DM Sans',sans-serif",
                    transform: hov === a.slug ? "none" : "translateY(8px)", opacity: hov === a.slug ? 1 : 0 }}>
                  {a.genre} · {a.subgenres.slice(0,2).join(" / ")}
                </div>
                <div className="transition-all duration-300 mt-3"
                  style={{ transform: hov === a.slug ? "none" : "translateY(10px)", opacity: hov === a.slug ? 1 : 0 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#ff6a3d" }}>
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

// ─── RELEASES ─────────────────────────────────────────
function ReleasesSection() {
  const ref = useReveal();

  return (
    <section ref={ref} className="reveal py-24 md:py-32" style={{ background:"rgba(16,16,26,0.6)" }}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <Label text="New Music" color="jade" />
            <h2 className="text-sand-100 leading-none"
              style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(36px,5vw,64px)", fontWeight:900, letterSpacing:"-0.03em" }}>
              Latest Releases<span className="text-jade-400">.</span>
            </h2>
          </div>
          <Link href="/releases"
            className="text-jade-400 border-b border-jade-400 pb-0.5 hover:text-white hover:border-white transition-colors"
            style={{ fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
            All Releases →
          </Link>
        </div>

        <p className="text-white/45 text-sm mb-8 -mt-4" style={{ fontFamily:"'DM Sans',sans-serif" }}>
          Tap to preview (up to 60 seconds) — jump directly to your streaming platform.
        </p>
      </div>

      {/* Horizontal scroll */}
      <div className="scroll-hide flex gap-5 overflow-x-auto scroll-snap-x px-6 md:px-10 pb-4">
        {site.releases.map(r => (
          <div key={r.id} className="flex-shrink-0 w-72 scroll-snap-start group cursor-pointer">
            {/* Art */}
            <div className="relative w-full aspect-square overflow-hidden mb-4 transition-transform duration-300 group-hover:-translate-y-1.5">
              <Image src={r.cover} alt={r.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"/>
              <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, transparent 55%, rgba(7,7,10,0.85) 100%)" }}/>
              {/* Vinyl rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[45,30,14].map(pct => (
                  <div key={pct} className="absolute rounded-full border border-white/08"
                    style={{ width:`${pct}%`, height:`${pct}%` }}/>
                ))}
              </div>
              {/* Type badge */}
              <div className="absolute bottom-3 left-3 bg-ink-950/80 px-2 py-0.5"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#2fe6b8" }}>
                {r.type}
              </div>
            </div>

            <div className="text-white/30 mb-1" style={{ fontFamily:"'Syne',sans-serif", fontSize:"9.5px", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase" }}>
              {formatDate(r.date)}
            </div>
            <div className="text-sand-100 mb-0.5"
              style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"20px", fontWeight:800, lineHeight:1.2 }}>
              {r.title}
            </div>
            <div className="text-white/45 text-sm mb-4" style={{ fontFamily:"'DM Sans',sans-serif" }}>
              {r.artist}
            </div>
            <AudioPreview src={r.previewUrl} />
            <DspBadges links={r.dspLinks} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MISSION ──────────────────────────────────────────
function MissionSection() {
  const ref = useReveal();

  return (
    <section ref={ref} className="reveal py-24 md:py-36 px-6 md:px-10" style={{ background:"#fff9f0" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left */}
          <div>
            <div className="flex items-center gap-3 mb-6"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"10.5px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"#ff4d2d" }}>
              <span className="inline-block w-7 h-px bg-ember-500"/>
              The Institution
            </div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(36px,5vw,60px)", fontWeight:900, color:"#0b0b12", letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:"28px" }}>
              Not just a label.<br/>
              <span style={{ color:"#ff4d2d" }}>A legacy.</span>
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"17px", lineHeight:"1.7", color:"#1a1a27", marginBottom:"20px" }}>
              {site.missionLong}
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px", lineHeight:"1.7", color:"rgba(26,26,39,0.55)", marginBottom:"40px" }}>
              Based at #5/7 Ademola Street, Ikoyi, Lagos — distributed globally across Spotify, Apple Music, Boomplay, AudioMack, and OneRPM.
            </p>
            <Link href="/about"
              className="inline-block bg-ember-500 hover:bg-ember-400 text-white px-8 py-4 transition-colors"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
              Our Story →
            </Link>
          </div>

          {/* Right: Principles grid */}
          <div className="grid grid-cols-2 gap-px">
            {site.principles.slice(0, 4).map((p, i) => (
              <div key={i} className="bg-ink-900 p-7"
                style={{ borderTop:`2px solid ${i < 2 ? "#ff6a3d" : "#2fe6b8"}` }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:"17px", fontWeight:700, color:"#fff0d6", lineHeight:1.3, marginBottom:"10px" }}>
                  {p.title}
                </div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px", lineHeight:"1.6", color:"rgba(255,240,214,0.38)" }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SPOTLIGHT ────────────────────────────────────────
function SpotlightSection() {
  const ref = useReveal();
  const aotm = site.artistOfTheMonth;
  const artist = site.roster.find(a => a.slug === aotm.artistSlug);
  const release = site.releases.find(r => r.artistSlug === aotm.artistSlug);
  if (!artist) return null;

  return (
    <section ref={ref} className="reveal py-24 md:py-32 px-6 md:px-10 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 w-1/2 h-full -z-10"
        style={{ background:"radial-gradient(ellipse 80% 60% at 80% 40%, rgba(255,77,45,0.12), transparent)" }}/>

      <div className="mx-auto max-w-7xl">
        <Label text={`Artist of the Month · ${aotm.month}`} />

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Art */}
          <div className="relative overflow-hidden" style={{ aspectRatio:"3/4" }}>
            <Image src={artist.image} alt={artist.name} fill className="object-cover"/>
            <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, transparent 40%, rgba(7,7,10,0.95) 100%)" }}/>
            <div className="absolute bottom-8 left-8 right-6">
              <div className="text-ember-400 mb-2"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase" }}>
                ✦ Featured Artist
              </div>
              <div className="text-sand-100"
                style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(28px,4vw,44px)", fontWeight:900, lineHeight:1.1 }}>
                {artist.name}
              </div>
              <div className="text-white/45 mt-1 text-sm" style={{ fontFamily:"'DM Sans',sans-serif" }}>
                {artist.genre} · {artist.origin}
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <blockquote className="mb-6"
              style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"clamp(26px,3.5vw,46px)", fontWeight:900, color:"#fff0d6", lineHeight:1.12, letterSpacing:"-0.025em" }}>
              "{aotm.quote}"
            </blockquote>
            <p className="text-white/45 leading-relaxed mb-8"
              style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"clamp(14px,1.5vw,16.5px)", lineHeight:"1.7" }}>
              {aotm.spotlightCopy}
            </p>

            {release && (
              <div className="border border-white/08 bg-white/[0.03] p-5 mb-8">
                <div className="text-white/30 mb-2"
                  style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}>
                  Latest Track
                </div>
                <div className="text-sand-100 mb-3"
                  style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"19px", fontWeight:800 }}>
                  {release.title}
                </div>
                <AudioPreview src={release.previewUrl} />
                <DspBadges links={release.dspLinks} />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href="/join"
                className="bg-ember-500 hover:bg-ember-400 text-white px-7 py-3.5 transition-colors"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
                {aotm.ctaText}
              </Link>
              <Link href={`/artists/${artist.slug}`}
                className="border border-white/20 hover:border-white/50 text-white px-7 py-3.5 transition-colors"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
                Full Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STATS STRIP ──────────────────────────────────────
function StatsStrip() {
  const ref = useReveal();
  return (
    <section ref={ref} className="reveal border-t border-b border-white/06 py-10 px-6 md:px-10"
      style={{ background:"rgba(11,11,18,0.8)" }}>
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-px">
        {site.stats.map(s => (
          <div key={s.label} className="py-8 px-6 text-center bg-white/[0.015]">
            <div className="text-sand-300 mb-1"
              style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700, lineHeight:1 }}>
              {s.value}
            </div>
            <div className="text-white/35"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"9.5px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── ROOT ─────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ArtistsSection />
      <ReleasesSection />
      <StatsStrip />
      <MissionSection />
      <SpotlightSection />
    </>
  );
}
