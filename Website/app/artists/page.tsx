"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { site } from "@/data/site";

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

// ── IRhay card — warm earthy brand ───────────────────
function IRhayCard() {
  const [hov, setHov] = useState(false);
  const B = { brown:"#5C3D2E", orange:"#D4844C", olive:"#8D9A6A", teal:"#2C5E5A" };
  const artist = site.roster.find(a => a.slug === "irhay")!;

  return (
    <Link href="/artists/irhay" style={{ textDecoration:"none", color:"inherit" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ position:"relative", overflow:"hidden", cursor:"pointer",
          borderTop:`2px solid ${hov ? B.orange : "transparent"}`,
          transition:"border-color 0.3s ease" }}
      >
        {/* Art — full bleed */}
        <div style={{ position:"relative", width:"100%", aspectRatio:"2/3", overflow:"hidden" }}>
          {/*
            SWAP: Replace with real photo once available:
            <Image src="/images/irhay-card.jpg" alt="IRhay" fill className="object-cover object-top" />
          */}
          <div style={{
            position:"absolute", inset:0,
            background:`linear-gradient(160deg, ${B.brown} 0%, #2a1a0e 35%, ${B.orange} 100%)`,
            transform: hov ? "scale(1.05)" : "scale(1)",
            transition:"transform 0.6s ease",
          }}/>

          {/* Warm light overlay on hover */}
          <div style={{
            position:"absolute", inset:0,
            background:`radial-gradient(ellipse at 50% 30%, ${B.orange}25, transparent 65%)`,
            opacity: hov ? 1 : 0, transition:"opacity 0.4s ease",
          }}/>

          {/* Bottom gradient */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to top, rgba(7,7,10,1) 0%, rgba(7,7,10,0.4) 45%, transparent 100%)",
          }}/>

          {/* Active badge */}
          <div style={{
            position:"absolute", top:"16px", left:"16px",
            background:"rgba(7,7,10,0.8)", padding:"4px 10px",
            fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700,
            letterSpacing:"0.2em", textTransform:"uppercase", color:B.orange,
          }}>✦ Active</div>

          {/* Subgenres */}
          <div style={{
            position:"absolute", top:"16px", right:"16px",
            display:"flex", flexDirection:"column", gap:"4px", alignItems:"flex-end",
          }}>
            {artist.subgenres.slice(0,2).map(g => (
              <span key={g} style={{
                background:"rgba(7,7,10,0.75)", padding:"3px 8px",
                fontFamily:"'Syne',sans-serif", fontSize:"7px", fontWeight:700,
                letterSpacing:"0.15em", textTransform:"uppercase", color:`${B.olive}`,
              }}>{g}</span>
            ))}
          </div>

          {/* Info block */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"28px 28px 24px" }}>
            <div style={{
              fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
              letterSpacing:"0.22em", textTransform:"uppercase",
              color:"rgba(255,240,214,0.45)", marginBottom:"8px",
              transform: hov ? "none" : "translateY(4px)",
              opacity: hov ? 1 : 0.6,
              transition:"all 0.3s ease",
            }}>
              {artist.origin}
            </div>
            <h2 style={{
              fontFamily:"'Fraunces',serif", fontStyle:"italic",
              fontSize:"clamp(36px,4vw,52px)", fontWeight:900,
              color:"#fff0d6", lineHeight:1, letterSpacing:"-0.03em",
              marginBottom:"8px",
            }}>
              {artist.name}
            </h2>
            <div style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
              color:"rgba(255,240,214,0.5)", marginBottom:"16px",
            }}>
              {artist.genre}
            </div>

            {/* Bio teaser — visible on hover */}
            <div style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
              color:"rgba(255,240,214,0.38)", lineHeight:"1.6",
              maxWidth:"420px", marginBottom:"20px",
              transform: hov ? "none" : "translateY(10px)",
              opacity: hov ? 1 : 0,
              transition:"all 0.35s ease 0.05s",
            }}>
              {artist.bio}
            </div>

            {/* CTA row */}
            <div style={{
              display:"flex", alignItems:"center", gap:"16px",
              transform: hov ? "none" : "translateY(8px)",
              opacity: hov ? 1 : 0,
              transition:"all 0.35s ease 0.1s",
            }}>
              <span style={{
                fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
                letterSpacing:"0.14em", textTransform:"uppercase", color:B.orange,
              }}>
                View Profile →
              </span>
              <div style={{ display:"flex", gap:"6px" }}>
                {[
                  { label:"Spotify",   href: artist.links.spotify   },
                  { label:"AudioMack", href: artist.links.audiomack },
                  { label:"Boomplay",  href: artist.links.boomplay  },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      border:`1px solid ${B.orange}30`, padding:"4px 8px",
                      fontFamily:"'Syne',sans-serif", fontSize:"7.5px", fontWeight:700,
                      letterSpacing:"0.12em", textTransform:"uppercase", color:B.orange,
                      textDecoration:"none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${B.orange}18`)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >{s.label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Zvheer card — dark / Electric Cyan brand ─────────
function ZvheerCard() {
  const [hov, setHov] = useState(false);
  const B = { black:"#0A0A0A", steel:"#3C4F68", cyan:"#00FFFF", maroon:"#5B1A28", ash:"#B1B1B1" };
  const artist = site.roster.find(a => a.slug === "zvheer")!;

  return (
    <Link href="/artists/zvheer" style={{ textDecoration:"none", color:"inherit" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ position:"relative", overflow:"hidden", cursor:"pointer",
          borderTop:`2px solid ${hov ? B.cyan : "transparent"}`,
          transition:"border-color 0.3s ease" }}
      >
        <div style={{ position:"relative", width:"100%", aspectRatio:"2/3", overflow:"hidden" }}>
          {/*
            SWAP: Replace with real photo:
            <Image src="/images/zvheer-card.jpg" alt="Zvheer" fill className="object-cover object-top" />
          */}
          <div style={{
            position:"absolute", inset:0,
            background:`linear-gradient(160deg, ${B.black} 0%, ${B.steel} 55%, ${B.cyan}35 100%)`,
            transform: hov ? "scale(1.05)" : "scale(1)",
            transition:"transform 0.6s ease",
          }}/>

          {/* Grid overlay */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`linear-gradient(${B.cyan}06 1px, transparent 1px), linear-gradient(90deg, ${B.cyan}06 1px, transparent 1px)`,
            backgroundSize:"36px 36px",
          }}/>

          {/* Cyan glow on hover */}
          <div style={{
            position:"absolute", inset:0,
            background:`radial-gradient(ellipse at 50% 20%, ${B.cyan}15, transparent 60%)`,
            opacity: hov ? 1 : 0, transition:"opacity 0.4s ease",
          }}/>

          {/* Bottom gradient */}
          <div style={{
            position:"absolute", inset:0,
            background:`linear-gradient(to top, ${B.black} 0%, ${B.black}80 35%, transparent 100%)`,
          }}/>

          {/* Corner accents */}
          {hov && <>
            <div style={{ position:"absolute", top:"14px", left:"14px", width:"18px", height:"18px", borderTop:`1px solid ${B.cyan}`, borderLeft:`1px solid ${B.cyan}` }}/>
            <div style={{ position:"absolute", top:"14px", right:"14px", width:"18px", height:"18px", borderTop:`1px solid ${B.cyan}`, borderRight:`1px solid ${B.cyan}` }}/>
            <div style={{ position:"absolute", bottom:"14px", left:"14px", width:"18px", height:"18px", borderBottom:`1px solid ${B.cyan}`, borderLeft:`1px solid ${B.cyan}` }}/>
            <div style={{ position:"absolute", bottom:"14px", right:"14px", width:"18px", height:"18px", borderBottom:`1px solid ${B.cyan}`, borderRight:`1px solid ${B.cyan}` }}/>
          </>}

          {/* Coming soon badge */}
          <div style={{
            position:"absolute", top:"16px", left:"16px",
            border:`1px solid ${B.cyan}35`, background:"rgba(0,0,0,0.7)", padding:"4px 10px",
            fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:700,
            letterSpacing:"0.2em", textTransform:"uppercase", color:B.cyan,
            display:"flex", alignItems:"center", gap:"6px",
          }}>
            <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:B.cyan, display:"inline-block" }}/>
            Coming Soon
          </div>

          {/* Info block */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"28px 28px 24px" }}>
            <div style={{
              fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
              letterSpacing:"0.22em", textTransform:"uppercase",
              color:`${B.cyan}55`, marginBottom:"8px",
              transform: hov ? "none" : "translateY(4px)",
              opacity: hov ? 1 : 0.6,
              transition:"all 0.3s ease",
            }}>
              {artist.origin}
            </div>
            <h2 style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:"clamp(36px,4vw,52px)",
              color: B.cyan, lineHeight:1, letterSpacing:"-0.04em",
              marginBottom:"8px",
            }}>
              {artist.name}
            </h2>
            <div style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
              color:`${B.ash}55`, marginBottom:"16px",
            }}>
              {artist.genre}
            </div>

            {/* Brand tagline — always visible */}
            <div style={{
              fontFamily:"'Syne',sans-serif", fontSize:"12px", fontWeight:700,
              letterSpacing:"0.04em", color:`${B.ash}60`,
              fontStyle:"italic", marginBottom:"16px",
            }}>
              "{artist.tagline}"
            </div>

            {/* CTA — on hover */}
            <div style={{
              display:"flex", alignItems:"center", gap:"12px",
              transform: hov ? "none" : "translateY(8px)",
              opacity: hov ? 1 : 0,
              transition:"all 0.35s ease 0.1s",
            }}>
              <span style={{
                fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
                letterSpacing:"0.14em", textTransform:"uppercase", color:B.cyan,
              }}>
                View Profile →
              </span>
              <span style={{
                fontFamily:"'Syne',sans-serif", fontSize:"9px", fontWeight:700,
                letterSpacing:"0.12em", textTransform:"uppercase",
                color:`${B.ash}40`, border:`1px solid ${B.steel}40`,
                padding:"4px 10px",
              }}>
                Notify Me
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Page header ──────────────────────────────────────
function PageHeader() {
  const ref = useReveal();
  return (
    <section ref={ref} className="reveal pt-28 pb-16 px-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div style={{
          display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px",
          fontFamily:"'Syne',sans-serif", fontSize:"10.5px", fontWeight:700,
          letterSpacing:"0.3em", textTransform:"uppercase", color:"#ff6a3d",
        }}>
          <span style={{ display:"inline-block", width:"28px", height:"1px", background:"#ff6a3d" }}/>
          The Roster
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-end">
          <h1 style={{
            fontFamily:"'Fraunces',serif", fontStyle:"italic",
            fontSize:"clamp(44px,6vw,80px)", fontWeight:900, color:"#fff0d6",
            letterSpacing:"-0.035em", lineHeight:1,
          }}>
            Our Artists<span style={{ color:"#ff6a3d" }}>.</span>
          </h1>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:"16px",
            lineHeight:"1.7", color:"rgba(255,240,214,0.45)",
            maxWidth:"440px",
          }}>
            Two artists. Two worlds. One label built on ownership, intention, and the conviction that African artistry belongs at the centre of global culture.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Submit CTA ───────────────────────────────────────
function SubmitCTA() {
  const ref = useReveal();
  return (
    <section ref={ref} className="reveal py-24 px-6 md:px-10"
      style={{ background:"rgba(16,16,26,0.6)", borderTop:"1px solid rgba(255,240,214,0.05)" }}>
      <div className="mx-auto max-w-3xl text-center">
        <div style={{
          fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700,
          letterSpacing:"0.3em", textTransform:"uppercase",
          color:"rgba(255,240,214,0.25)", marginBottom:"20px",
        }}>
          Taradome Entertainment Group
        </div>
        <h2 style={{
          fontFamily:"'Fraunces',serif", fontStyle:"italic",
          fontSize:"clamp(30px,4vw,52px)", fontWeight:900, color:"#fff0d6",
          letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:"16px",
        }}>
          Think you belong here?
        </h2>
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:"15px",
          color:"rgba(255,240,214,0.4)", marginBottom:"36px", lineHeight:"1.7",
        }}>
          We're selective. We're serious. And we're always listening.
        </p>
        <Link href="/studio"
          className="inline-block transition-colors"
          style={{
            background:"#ff4d2d", color:"white", padding:"15px 40px",
            fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700,
            letterSpacing:"0.14em", textTransform:"uppercase",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
            (e.currentTarget.style.background = "#ff6a3d")}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
            (e.currentTarget.style.background = "#ff4d2d")}
        >
          Submit Your Music
        </Link>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────
export default function ArtistsPage() {
  return (
    <>
      <style>{`
        .reveal { opacity:0; transform:translateY(36px); transition:opacity 0.85s ease, transform 0.85s ease; }
        .reveal.in-view { opacity:1; transform:none; }
      `}</style>

      <PageHeader />

      {/* Artist grid */}
      <div className="px-6 md:px-10 pb-4">
        <div className="mx-auto max-w-7xl">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:"2px" }}>
            <IRhayCard />
            <ZvheerCard />
          </div>
        </div>
      </div>

      <SubmitCTA />
    </>
  );
}
