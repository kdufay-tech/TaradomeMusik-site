"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { site } from "@/data/site";
import { AudioPreview } from "@/components/AudioPreview";
import { formatDate } from "@/lib/utils";

const ARTIST = site.roster.find(a => a.slug === "irhay")!;
const RELEASES = site.releases.filter(r => r.artistSlug === "irhay");

// ── IRhay brand tokens ───────────────────────────────
const B = {
  brown:  "#5C3D2E",
  orange: "#D4844C",
  olive:  "#8D9A6A",
  cream:  "#F5EEE6",
  teal:   "#2C5E5A",
};

// ── Intersection reveal hook ─────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("in-view"); },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── DSP link row ─────────────────────────────────────
function StreamingRow({ links }: { links: Record<string, string> }) {
  const LABELS: Record<string, string> = {
    spotify: "Spotify", apple: "Apple Music", audiomack: "AudioMack",
    boomplay: "Boomplay", youtube: "YouTube", presave: "Pre-Save",
    instagram: "Instagram", twitter: "Twitter / X", facebook: "Facebook",
  };
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(links).map(([k, href]) =>
        LABELS[k] ? (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer"
            className="border border-white/10 px-3 py-1.5 text-white/45 hover:text-white hover:border-white/40 transition-colors"
            style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}
          >
            {LABELS[k]}
          </a>
        ) : null
      )}
    </div>
  );
}

// ── Social icon bar ──────────────────────────────────
function SocialBar() {
  const socials = [
    { label:"Spotify",   href: ARTIST.links.spotify,   color: B.orange },
    { label:"Instagram", href: ARTIST.links.instagram, color: B.orange },
    { label:"YouTube",   href: ARTIST.links.youtube,   color: B.orange },
    { label:"AudioMack", href: ARTIST.links.audiomack, color: B.olive  },
    { label:"Boomplay",  href: ARTIST.links.boomplay,  color: B.olive  },
    { label:"X / Twitter", href: ARTIST.links.twitter, color: B.teal   },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {socials.map(s => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 transition-colors"
          style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
            letterSpacing:"0.14em", textTransform:"uppercase",
            border:`1px solid ${s.color}30`, color: s.color }}
          onMouseEnter={e => (e.currentTarget.style.background = `${s.color}14`)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {s.label} ↗
        </a>
      ))}
    </div>
  );
}

// ── HERO ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ paddingTop:"72px" }}>

      {/* Warm ambient glows — IRhay brand palette */}
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background:`radial-gradient(ellipse 60% 70% at 80% 30%, ${B.orange}20, transparent)` }}/>
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background:`radial-gradient(ellipse 50% 50% at 10% 80%, ${B.teal}12, transparent)` }}/>

      <div className="mx-auto max-w-7xl px-6 md:px-10 pt-16 pb-12">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-end">

          {/* Left: Hero photo */}
          <div className="md:col-span-5">
            <div className="relative overflow-hidden" style={{ aspectRatio:"3/4" }}>
              {/*
                SWAP: Replace the gradient div below with:
                <Image src="/images/irhay-hero.jpg" alt="IRhay" fill className="object-cover object-top" />
                After adding the real photo to public/images/
              */}
              <div className="absolute inset-0"
                style={{ background:`linear-gradient(160deg, ${B.brown} 0%, #2a1a0e 30%, ${B.orange} 100%)` }}/>

              {/* Phoenix motif overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage:`radial-gradient(circle at 50% 30%, ${B.orange} 0%, transparent 60%)` }}/>

              {/* Bottom fade */}
              <div className="absolute inset-0"
                style={{ background:`linear-gradient(to top, #07070a 0%, transparent 55%)` }}/>

              {/* Name overlay */}
              <div className="absolute bottom-8 left-8 right-8">
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                  letterSpacing:"0.3em", textTransform:"uppercase", color:B.orange, marginBottom:"10px" }}>
                  ✦ TáradomeMusik Artist
                </div>
                <h1 style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
                  fontSize:"clamp(48px,6vw,72px)", fontWeight:900, color:"#fff0d6",
                  letterSpacing:"-0.035em", lineHeight:1 }}>
                  IRhay
                </h1>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
                  color:"rgba(255,240,214,0.5)", marginTop:"6px" }}>
                  {ARTIST.genre} · {ARTIST.origin}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio + links */}
          <div className="md:col-span-7 pb-8">

            {/* Subgenre tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {ARTIST.subgenres.map(g => (
                <span key={g} className="px-3 py-1"
                  style={{ border:`1px solid ${B.orange}30`, color:B.orange,
                    fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                    letterSpacing:"0.14em", textTransform:"uppercase" }}>
                  {g}
                </span>
              ))}
            </div>

            {/* Tagline */}
            <div className="mb-6">
              <span style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
                fontSize:"clamp(22px,2.8vw,34px)", fontWeight:700,
                color:B.cream, lineHeight:1.3 }}>
                "{ARTIST.tagline}"
              </span>
            </div>

            {/* Bio */}
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"16px",
              lineHeight:"1.75", color:"rgba(255,240,214,0.6)", marginBottom:"16px" }}>
              {ARTIST.bio}
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
              lineHeight:"1.75", color:"rgba(255,240,214,0.38)", marginBottom:"36px" }}>
              {ARTIST.bioLong}
            </p>

            {/* Streaming CTAs */}
            <div className="mb-6">
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                letterSpacing:"0.25em", textTransform:"uppercase",
                color:"rgba(255,240,214,0.25)", marginBottom:"12px" }}>
                Stream Now
              </div>
              <SocialBar />
            </div>

            {/* Brand narrative */}
            <div className="mt-8 p-5" style={{ borderLeft:`2px solid ${B.orange}`, background:`${B.brown}18` }}>
              <p style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
                fontSize:"15px", lineHeight:"1.7", color:B.cream, opacity:0.75 }}>
                {ARTIST.brandNarrative}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── RELEASES ─────────────────────────────────────────
function ReleasesSection() {
  const ref = useReveal();

  return (
    <section ref={ref} className="reveal py-24 px-6 md:px-10"
      style={{ background:"rgba(16,16,22,0.8)" }}>
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
                letterSpacing:"0.3em", textTransform:"uppercase", color:B.olive }}>
              <span style={{ display:"inline-block", width:"28px", height:"1px", background:B.olive }}/>
              Discography
            </div>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
              fontSize:"clamp(32px,4.5vw,56px)", fontWeight:900, color:"#fff0d6",
              letterSpacing:"-0.03em", lineHeight:1 }}>
              All Releases<span style={{ color:B.orange }}>.</span>
            </h2>
          </div>
          <a href={ARTIST.links.spotify} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
              letterSpacing:"0.14em", textTransform:"uppercase",
              color:B.orange, borderBottom:`1px solid ${B.orange}`, paddingBottom:"2px" }}>
            Full Catalog on Spotify ↗
          </a>
        </div>

        {/* Release cards */}
        <div className="grid gap-px" style={{ gridTemplateColumns:"repeat(3, 1fr)" }}>
          {RELEASES.map((r, i) => (
            <ReleaseCard key={r.id} release={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReleaseCard({ release: r, index }: { release: typeof RELEASES[0], index: number }) {
  const [hov, setHov] = useState(false);
  const gradients = [
    `linear-gradient(155deg, ${B.brown} 0%, #2a1a0e 50%, ${B.orange} 100%)`,
    `linear-gradient(155deg, #1a2a10 0%, ${B.olive} 50%, ${B.teal} 100%)`,
    `linear-gradient(155deg, #0a1a1a 0%, ${B.teal} 50%, ${B.olive} 100%)`,
  ];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background:hov ? "#1a1a27" : "#10101a",
        borderTop:`2px solid ${hov ? B.orange : "transparent"}`,
        transition:"all 0.25s ease", cursor:"pointer" }}
    >
      {/* Art */}
      <div style={{ position:"relative", width:"100%", aspectRatio:"1", overflow:"hidden" }}>
        {/*
          SWAP: Replace gradient with:
          <Image src={r.cover} alt={r.title} fill className="object-cover" />
          once real cover art is in place.
        */}
        <div style={{ position:"absolute", inset:0, background:gradients[index % 3],
          transform: hov ? "scale(1.04)" : "scale(1)", transition:"transform 0.5s ease" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom, transparent 50%, rgba(7,7,10,0.85) 100%)" }}/>

        {/* Vinyl rings */}
        {[50,34,18].map(p => (
          <div key={p} style={{ position:"absolute", top:`${50 - p/2}%`, left:`${50 - p/2}%`,
            width:`${p}%`, height:`${p}%`, borderRadius:"50%",
            border:"1px solid rgba(255,255,255,0.07)" }}/>
        ))}

        {/* Type badge */}
        <div style={{ position:"absolute", bottom:"12px", left:"12px",
          background:"rgba(7,7,10,0.85)", padding:"3px 8px",
          fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700,
          letterSpacing:"0.2em", textTransform:"uppercase", color:B.olive }}>
          {r.type}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"22px 24px 28px" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
          letterSpacing:"0.15em", textTransform:"uppercase",
          color:"rgba(255,240,214,0.28)", marginBottom:"8px" }}>
          {formatDate(r.date)}
        </div>
        <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
          fontSize:"22px", fontWeight:800, color:"#fff0d6",
          lineHeight:1.2, marginBottom:"4px" }}>
          {r.title}
        </div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
          color:"rgba(255,240,214,0.4)", marginBottom:"18px" }}>
          {r.artist}
        </div>

        <AudioPreview src={r.previewUrl} />

        {/* DSP badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {r.dspLinks.spotify && (
            <a href={r.dspLinks.spotify} target="_blank" rel="noopener noreferrer"
              className="transition-colors"
              style={{ border:`1px solid ${B.orange}30`, color:B.orange, padding:"4px 10px",
                fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700,
                letterSpacing:"0.12em", textTransform:"uppercase" }}
              onMouseEnter={e => (e.currentTarget.style.background = `${B.orange}14`)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Spotify ↗
            </a>
          )}
          {r.dspLinks.audiomack && (
            <a href={r.dspLinks.audiomack} target="_blank" rel="noopener noreferrer"
              className="transition-colors"
              style={{ border:`1px solid ${B.olive}30`, color:B.olive, padding:"4px 10px",
                fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700,
                letterSpacing:"0.12em", textTransform:"uppercase" }}
              onMouseEnter={e => (e.currentTarget.style.background = `${B.olive}14`)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              AudioMack ↗
            </a>
          )}
          {r.dspLinks.boomplay && (
            <a href={r.dspLinks.boomplay} target="_blank" rel="noopener noreferrer"
              className="transition-colors"
              style={{ border:`1px solid ${B.teal}30`, color:B.teal, padding:"4px 10px",
                fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700,
                letterSpacing:"0.12em", textTransform:"uppercase" }}
              onMouseEnter={e => (e.currentTarget.style.background = `${B.teal}14`)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Boomplay ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── COMPS + THEMES ───────────────────────────────────
function SoundSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="reveal py-24 px-6 md:px-10" style={{ background:`${B.cream}` }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16">

          {/* Comps */}
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
              letterSpacing:"0.3em", textTransform:"uppercase", color:B.brown, marginBottom:"16px",
              display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ display:"inline-block", width:"24px", height:"1px", background:B.brown }}/>
              Sounds Like
            </div>
            <h3 style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
              fontSize:"clamp(28px,3.5vw,42px)", fontWeight:900, color:B.brown,
              letterSpacing:"-0.025em", lineHeight:1.1, marginBottom:"24px" }}>
              The Comps<span style={{ color:B.orange }}>.</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {ARTIST.comps.map(c => (
                <div key={c} style={{ padding:"14px 16px", background:"#07070a",
                  borderLeft:`2px solid ${B.orange}` }}>
                  <span style={{ fontFamily:"'Fraunces',serif", fontSize:"15px",
                    fontWeight:700, color:"#fff0d6" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Themes */}
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
              letterSpacing:"0.3em", textTransform:"uppercase", color:B.teal, marginBottom:"16px",
              display:"flex", alignItems:"center", gap:"12px" }}>
              <span style={{ display:"inline-block", width:"24px", height:"1px", background:B.teal }}/>
              What He Writes About
            </div>
            <h3 style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
              fontSize:"clamp(28px,3.5vw,42px)", fontWeight:900, color:B.brown,
              letterSpacing:"-0.025em", lineHeight:1.1, marginBottom:"24px" }}>
              The Themes<span style={{ color:B.teal }}>.</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {ARTIST.themes.map(t => (
                <div key={t} style={{ padding:"10px 18px",
                  border:`1px solid ${B.teal}40`, color:B.teal,
                  fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
                  letterSpacing:"0.12em", textTransform:"uppercase" }}>
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-10 p-6" style={{ background:"#07070a" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                letterSpacing:"0.25em", textTransform:"uppercase",
                color:"rgba(255,240,214,0.25)", marginBottom:"8px" }}>
                Target Audience
              </div>
              <div className="flex gap-3">
                {ARTIST.targetAudience.map(a => (
                  <span key={a} style={{ fontFamily:"'Fraunces',serif",
                    fontSize:"18px", fontWeight:700, color:B.orange }}>{a}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAN CTA ──────────────────────────────────────────
function FanCTA() {
  const ref = useReveal();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section ref={ref} className="reveal py-24 px-6 md:px-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background:`radial-gradient(ellipse 70% 60% at 50% 50%, ${B.brown}18, transparent)` }}/>

      <div className="mx-auto max-w-2xl text-center">
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.3em", textTransform:"uppercase", color:B.orange, marginBottom:"20px" }}>
          Join the Fan List
        </div>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
          fontSize:"clamp(32px,4.5vw,52px)", fontWeight:900, color:"#fff0d6",
          letterSpacing:"-0.03em", lineHeight:1.05, marginBottom:"16px" }}>
          Get closer to the music.
        </h2>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px",
          color:"rgba(255,240,214,0.45)", marginBottom:"40px", lineHeight:"1.7" }}>
          Early releases, behind-the-scenes content, and exclusive drops — straight to your inbox.
        </p>

        {done ? (
          <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic",
            fontSize:"24px", color:B.olive }}>
            You're in. Welcome to the circle.
          </div>
        ) : (
          <>
            <div className="flex gap-0 max-w-md mx-auto">
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex:1, padding:"14px 18px", background:"#10101a",
                  border:`1px solid rgba(255,240,214,0.1)`, borderRight:"none",
                  color:"#fff0d6", fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
                  outline:"none" }}
              />
              <button
                onClick={() => email && setDone(true)}
                style={{ padding:"14px 28px", background:B.orange, border:"none",
                  color:"white", fontFamily:"'Syne',sans-serif", fontSize:"10px",
                  fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
                  cursor:"pointer", flexShrink:0 }}
                onMouseEnter={e => (e.currentTarget.style.background = B.brown)}
                onMouseLeave={e => (e.currentTarget.style.background = B.orange)}
              >
                Join Free
              </button>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
              color:"rgba(255,240,214,0.2)", marginTop:"12px" }}>
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

// ── BACK NAV ─────────────────────────────────────────
function BackBar() {
  return (
    <div className="px-6 md:px-10 py-5 flex items-center justify-between"
      style={{ borderBottom:"1px solid rgba(255,240,214,0.06)" }}>
      <Link href="/artists"
        style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.14em", textTransform:"uppercase",
          color:"rgba(255,240,214,0.4)", textDecoration:"none" }}
        className="hover:text-white transition-colors">
        ← All Artists
      </Link>
      <Link href="/"
        style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.14em", textTransform:"uppercase",
          color:"rgba(255,240,214,0.25)", textDecoration:"none" }}>
        TáradomeMusik
      </Link>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────
export default function IRhayPage() {
  return (
    <>
      <style>{`
        .reveal { opacity:0; transform:translateY(36px); transition:opacity 0.85s ease, transform 0.85s ease; }
        .reveal.in-view { opacity:1; transform:none; }
      `}</style>
      <BackBar />
      <HeroSection />
      <ReleasesSection />
      <SoundSection />
      <FanCTA />
    </>
  );
}
