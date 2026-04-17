"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { site } from "@/data/site";

const ARTIST = site.roster.find(a => a.slug === "zvheer")!;

// ── Zvheer brand tokens ──────────────────────────────
const B = {
  black:  "#0A0A0A",
  steel:  "#3C4F68",
  cyan:   "#00FFFF",
  maroon: "#5B1A28",
  ash:    "#B1B1B1",
};

// ── Intersection reveal ──────────────────────────────
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

// ── Glitch text effect ───────────────────────────────
function GlitchName() {
  return (
    <div className="relative inline-block" style={{ lineHeight:1 }}>
      <style>{`
        @keyframes zvGlitch {
          0%, 94%, 100% { clip-path: none; transform: none; }
          95% { clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); transform: translate(-3px, 0); }
          96% { clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); transform: translate(3px, 0); }
          97% { clip-path: none; transform: translate(-1px, 0); }
        }
        .zv-name { animation: zvGlitch 6s ease-in-out infinite; }
      `}</style>
      <h1 className="zv-name"
        style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(64px,10vw,120px)", letterSpacing:"-0.04em",
          color: B.cyan, lineHeight:0.9 }}>
        Zvheer
      </h1>
      {/* Ghost duplicate for glitch */}
      <h1 aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(64px,10vw,120px)", letterSpacing:"-0.04em",
          color: B.maroon, lineHeight:0.9, opacity:0.35,
          animation:"zvGlitch 6s ease-in-out infinite", animationDelay:"0.05s" }}>
        Zvheer
      </h1>
    </div>
  );
}

// ── HERO ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight:"100vh", paddingTop:"72px", background:B.black }}>

      {/* Cyan glow — top right */}
      <div className="pointer-events-none absolute -z-10"
        style={{ top:"-10%", right:"-5%", width:"55%", height:"70%",
          background:`radial-gradient(ellipse, ${B.cyan}18 0%, transparent 65%)` }}/>

      {/* Maroon glow — bottom left */}
      <div className="pointer-events-none absolute -z-10"
        style={{ bottom:"5%", left:"-8%", width:"45%", height:"55%",
          background:`radial-gradient(ellipse, ${B.maroon}20 0%, transparent 65%)` }}/>

      {/* Scan-line texture */}
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,255,0.012) 3px, rgba(0,255,255,0.012) 4px)` }}/>

      <div className="mx-auto max-w-7xl px-6 md:px-10 pt-20 pb-16">
        <div className="grid md:grid-cols-12 gap-12 items-center">

          {/* Left: Name + tagline */}
          <div className="md:col-span-7">

            {/* Coming soon badge */}
            <div className="inline-flex items-center gap-3 mb-10"
              style={{ border:`1px solid ${B.cyan}30`, padding:"6px 16px" }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%",
                background:B.cyan, display:"inline-block",
                boxShadow:`0 0 8px ${B.cyan}` }}/>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                letterSpacing:"0.3em", textTransform:"uppercase", color:B.cyan }}>
                Coming Soon · TáradomeMusik
              </span>
            </div>

            <GlitchName />

            <div className="mt-6 mb-10">
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(14px,2vw,20px)",
                fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
                color:"rgba(176,176,176,0.6)" }}>
                {ARTIST.tagline}
              </p>
            </div>

            {/* Brand narrative pull quote */}
            <div className="mb-10 pl-5" style={{ borderLeft:`2px solid ${B.cyan}` }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(15px,1.8vw,20px)",
                fontWeight:700, lineHeight:1.5,
                color:"rgba(255,255,255,0.75)", letterSpacing:"0.01em" }}>
                "{ARTIST.brandNarrative}"
              </p>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-10">
              {ARTIST.subgenres.map(g => (
                <span key={g} style={{ border:`1px solid ${B.steel}`,
                  padding:"6px 14px", color:B.ash,
                  fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                  letterSpacing:"0.14em", textTransform:"uppercase" }}>
                  {g}
                </span>
              ))}
              <span style={{ border:`1px solid ${B.cyan}30`, padding:"6px 14px",
                color:B.cyan, fontFamily:"'Syne',sans-serif", fontSize:"9px",
                fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" }}>
                {ARTIST.origin}
              </span>
            </div>

          </div>

          {/* Right: Photo placeholder */}
          <div className="md:col-span-5">
            <div className="relative overflow-hidden" style={{ aspectRatio:"3/4" }}>
              {/*
                SWAP: Replace with real Zvheer photo:
                <Image src="/images/zvheer-hero.jpg" alt="Zvheer" fill className="object-cover object-top" />
              */}
              <div className="absolute inset-0"
                style={{ background:`linear-gradient(160deg, ${B.black} 0%, ${B.steel} 55%, ${B.cyan}40 100%)` }}/>

              {/* Grid overlay — brand identity */}
              <div className="absolute inset-0"
                style={{ backgroundImage:`linear-gradient(${B.cyan}08 1px, transparent 1px), linear-gradient(90deg, ${B.cyan}08 1px, transparent 1px)`,
                  backgroundSize:"40px 40px" }}/>

              {/* Bottom overlay */}
              <div className="absolute inset-0"
                style={{ background:`linear-gradient(to top, ${B.black} 0%, transparent 60%)` }}/>

              {/* Centered text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700,
                  letterSpacing:"0.3em", textTransform:"uppercase",
                  color:`${B.cyan}60`, textAlign:"center" }}>
                  Photo<br/>Coming Soon
                </div>
              </div>

              {/* Cyan corner accents */}
              <div style={{ position:"absolute", top:"16px", left:"16px", width:"20px", height:"20px",
                borderTop:`1px solid ${B.cyan}`, borderLeft:`1px solid ${B.cyan}` }}/>
              <div style={{ position:"absolute", top:"16px", right:"16px", width:"20px", height:"20px",
                borderTop:`1px solid ${B.cyan}`, borderRight:`1px solid ${B.cyan}` }}/>
              <div style={{ position:"absolute", bottom:"16px", left:"16px", width:"20px", height:"20px",
                borderBottom:`1px solid ${B.cyan}`, borderLeft:`1px solid ${B.cyan}` }}/>
              <div style={{ position:"absolute", bottom:"16px", right:"16px", width:"20px", height:"20px",
                borderBottom:`1px solid ${B.cyan}`, borderRight:`1px solid ${B.cyan}` }}/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── STORY ────────────────────────────────────────────
function StorySection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="reveal py-24 px-6 md:px-10"
      style={{ background:"#0d0d0d" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-12 gap-12 items-start">

          <div className="md:col-span-4">
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
              letterSpacing:"0.3em", textTransform:"uppercase", color:B.steel,
              display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
              <span style={{ display:"inline-block", width:"24px", height:"1px", background:B.steel }}/>
              The Story
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:"clamp(28px,4vw,48px)", letterSpacing:"-0.03em",
              lineHeight:1.05, color:"white", marginBottom:"12px" }}>
              Forged<br/>through<br/><span style={{ color:B.cyan }}>fire.</span>
            </h2>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700,
              letterSpacing:"0.15em", textTransform:"uppercase",
              color:`${B.ash}40`, marginTop:"24px" }}>
              Born 2003 · Ogun State<br/>
              CS Student · Redeemer's University
            </p>
          </div>

          <div className="md:col-span-8">
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"16px",
              lineHeight:"1.8", color:`${B.ash}80`, marginBottom:"20px" }}>
              {ARTIST.bioLong}
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
              lineHeight:"1.8", color:`${B.ash}50`, marginBottom:"32px" }}>
              {ARTIST.bio}
            </p>

            {/* Themes */}
            <div style={{ marginBottom:"32px" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                letterSpacing:"0.25em", textTransform:"uppercase",
                color:`${B.ash}35`, marginBottom:"12px" }}>
                Themes
              </div>
              <div className="flex flex-wrap gap-2">
                {ARTIST.themes.map(t => (
                  <span key={t} style={{ padding:"7px 14px",
                    border:`1px solid ${B.maroon}50`,
                    background:`${B.maroon}10`, color:`${B.ash}70`,
                    fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                    letterSpacing:"0.12em", textTransform:"uppercase" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Comps */}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                letterSpacing:"0.25em", textTransform:"uppercase",
                color:`${B.ash}35`, marginBottom:"12px" }}>
                In the Company Of
              </div>
              <div className="grid grid-cols-3 gap-px">
                {ARTIST.comps.map(c => (
                  <div key={c} style={{ padding:"12px 14px", background:"#0a0a0a",
                    borderLeft:`2px solid ${B.steel}` }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px",
                      fontWeight:700, color:`${B.ash}60` }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SOUNDCLOUD EMBED ─────────────────────────────────
function SoundCloudSection() {
  const ref = useReveal();
  return (
    <section ref={ref} className="reveal py-24 px-6 md:px-10"
      style={{ background:B.black }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-4"
          style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
            letterSpacing:"0.3em", textTransform:"uppercase", color:B.maroon }}>
          <span style={{ display:"inline-block", width:"24px", height:"1px", background:B.maroon }}/>
          For The Label
        </div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(28px,4vw,48px)", letterSpacing:"-0.03em",
          color:"white", marginBottom:"8px" }}>
          Private Preview<span style={{ color:B.maroon }}>.</span>
        </h2>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
          color:`${B.ash}45`, marginBottom:"28px" }}>
          Unreleased material — internal access only.
        </p>

        {/* SoundCloud playlist embed — Zvheer private playlist */}
        <div style={{ border:`1px solid ${B.steel}30`, background:"#0d0d0d", padding:"2px" }}>
          <iframe
            width="100%"
            height="450"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src="https://w.soundcloud.com/player/?url=https%3A//on.soundcloud.com/q7XuPjxpdo8jikZ5XV&color=%2300ffff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true"
            style={{ display:"block" }}
          />
        </div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
          color:`${B.ash}25`, marginTop:"10px" }}>
          Internal use only. Do not share publicly.
        </p>
      </div>
    </section>
  );
}

// ── EMAIL SIGNUP ─────────────────────────────────────
function NotifySection() {
  const ref = useReveal();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section ref={ref} className="reveal py-24 px-6 md:px-10 relative overflow-hidden"
      style={{ background:"#0d0d0d" }}>

      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{ background:`radial-gradient(ellipse 80% 60% at 50% 50%, ${B.cyan}08, transparent)` }}/>

      <div className="mx-auto max-w-2xl" style={{ textAlign:"center" }}>

        {/* Pulsing dot */}
        <div className="flex justify-center mb-8">
          <div style={{ position:"relative", width:"12px", height:"12px" }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%",
              background:B.cyan, animation:"zvPulse 2s ease-in-out infinite" }}/>
            <style>{`
              @keyframes zvPulse {
                0%, 100% { transform:scale(1); opacity:1; box-shadow:0 0 0 0 ${B.cyan}60; }
                50% { transform:scale(1.2); opacity:0.8; box-shadow:0 0 0 8px ${B.cyan}00; }
              }
            `}</style>
          </div>
        </div>

        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.3em", textTransform:"uppercase", color:B.cyan, marginBottom:"20px" }}>
          Be First
        </div>

        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(28px,5vw,56px)", letterSpacing:"-0.03em",
          color:"white", lineHeight:1.05, marginBottom:"16px" }}>
          When Zvheer drops,<br/>
          <span style={{ color:B.cyan }}>you'll know first.</span>
        </h2>

        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px",
          color:`${B.ash}50`, marginBottom:"40px", lineHeight:"1.7" }}>
          No noise. Just the notification that changes everything.
        </p>

        {done ? (
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:"22px", color:B.cyan, letterSpacing:"0.02em" }}>
              Locked in.
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
              color:`${B.ash}40`, marginTop:"8px" }}>
              We'll hit you when it's time.
            </p>
          </div>
        ) : (
          <>
            <div className="flex max-w-md mx-auto">
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex:1, padding:"14px 18px", background:"#0a0a0a",
                  border:`1px solid ${B.steel}40`, borderRight:"none",
                  color:"white", fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
                  outline:"none" }}
                onFocus={e => (e.target.style.borderColor = `${B.cyan}50`)}
                onBlur={e => (e.target.style.borderColor = `${B.steel}40`)}
              />
              <button
                onClick={() => email && setDone(true)}
                style={{ padding:"14px 28px", background:"transparent",
                  border:`1px solid ${B.cyan}`, color:B.cyan,
                  fontFamily:"'Syne',sans-serif", fontSize:"10px",
                  fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
                  cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = B.cyan; e.currentTarget.style.color = B.black; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = B.cyan; }}
              >
                Notify Me
              </button>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
              color:`${B.ash}22`, marginTop:"12px" }}>
              One email when he drops. Nothing else.
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
      style={{ borderBottom:`1px solid ${B.steel}20`, background:B.black }}>
      <Link href="/artists"
        style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.14em", textTransform:"uppercase",
          color:`${B.ash}40`, textDecoration:"none" }}
        className="hover:text-white transition-colors">
        ← All Artists
      </Link>
      <Link href="/"
        style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.14em", textTransform:"uppercase",
          color:`${B.ash}25`, textDecoration:"none" }}>
        TáradomeMusik
      </Link>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────
export default function ZvheerPage() {
  return (
    <>
      <style>{`
        .reveal { opacity:0; transform:translateY(36px); transition:opacity 0.85s ease, transform 0.85s ease; }
        .reveal.in-view { opacity:1; transform:none; }
      `}</style>
      <BackBar />
      <HeroSection />
      <StorySection />
      <SoundCloudSection />
      <NotifySection />
    </>
  );
}
