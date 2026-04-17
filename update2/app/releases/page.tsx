"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { site } from "@/data/site";
import { AudioPreview } from "@/components/AudioPreview";
import { formatDate } from "@/lib/utils";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add("in-view");
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const DSP_LABELS: Record<string, string> = {
  spotify: "Spotify", apple: "Apple Music", audiomack: "AudioMack",
  boomplay: "Boomplay", presave: "Pre-Save", youtube: "YouTube",
};

const DSP_COLORS: Record<string, string> = {
  spotify: "#1DB954", apple: "#fc3c44", audiomack: "#f70",
  boomplay: "#00c853", presave: "#ff4d2d", youtube: "#ff0000",
};

function ReleaseCard({ r, index }: { r: typeof site.releases[0]; index: number }) {
  const [hov, setHov] = useState(false);
  const gradients = [
    "linear-gradient(155deg,#2a1a0e 0%,#5c3d2e 45%,#d4844c 100%)",
    "linear-gradient(155deg,#1a2a10 0%,#8d9a6a 55%,#2c5e5a 100%)",
    "linear-gradient(155deg,#0a1a1a 0%,#2c5e5a 55%,#3d6b5a 100%)",
  ];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#1a1a27" : "#10101a",
        borderTop: `2px solid ${hov ? "#D4844C" : "transparent"}`,
        transition: "all 0.25s ease",
      }}
    >
      {/* Art */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: gradients[index % 3],
          transform: hov ? "scale(1.04)" : "scale(1)",
          transition: "transform 0.5s ease",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 55%, rgba(7,7,10,0.9) 100%)",
        }} />
        {[50, 34, 18].map(p => (
          <div key={p} style={{
            position: "absolute", top: `${50 - p / 2}%`, left: `${50 - p / 2}%`,
            width: `${p}%`, height: `${p}%`, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
          }} />
        ))}
        <div style={{
          position: "absolute", bottom: "12px", left: "12px",
          background: "rgba(7,7,10,0.85)", padding: "3px 8px",
          fontFamily: "'Syne',sans-serif", fontSize: "8px", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#8d9a6a",
        }}>{r.type}</div>
        <Link href={`/artists/${r.artistSlug}`} style={{
          position: "absolute", bottom: "12px", right: "12px",
          background: "rgba(7,7,10,0.85)", padding: "3px 8px",
          fontFamily: "'Syne',sans-serif", fontSize: "8px", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4844C",
          textDecoration: "none",
        }}>{r.artist}</Link>
      </div>

      {/* Body */}
      <div style={{ padding: "22px 24px 28px" }}>
        <div style={{
          fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.15em", textTransform: "uppercase",
          color: "rgba(255,240,214,0.28)", marginBottom: "8px",
        }}>{formatDate(r.date)}</div>
        <div style={{
          fontFamily: "'Fraunces',serif", fontStyle: "italic",
          fontSize: "22px", fontWeight: 800, color: "#fff0d6",
          lineHeight: 1.2, marginBottom: "18px",
        }}>{r.title}</div>

        <AudioPreview src={r.previewUrl} />

        {/* DSP links */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "16px" }}>
          {Object.entries(r.dspLinks).map(([key, href]) =>
            DSP_LABELS[key] && href ? (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  border: `1px solid ${DSP_COLORS[key] || "#D4844C"}30`,
                  color: DSP_COLORS[key] || "#D4844C",
                  padding: "5px 12px",
                  fontFamily: "'Syne',sans-serif", fontSize: "8.5px", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${DSP_COLORS[key] || "#D4844C"}14`)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >{DSP_LABELS[key]} ↗</a>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReleasesPage() {
  const ref = useReveal();
  return (
    <>
      <style>{`
        .reveal{opacity:0;transform:translateY(36px);transition:opacity .85s ease,transform .85s ease}
        .reveal.in-view{opacity:1;transform:none}
      `}</style>

      {/* Header */}
      <section style={{ paddingTop: "120px", paddingBottom: "60px", padding: "120px clamp(24px,5vw,80px) 60px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px",
            fontFamily: "'Syne',sans-serif", fontSize: "10.5px", fontWeight: 700,
            letterSpacing: "0.3em", textTransform: "uppercase", color: "#2fe6b8",
          }}>
            <span style={{ display: "inline-block", width: "28px", height: "1px", background: "#2fe6b8" }} />
            Discography
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <h1 style={{
              fontFamily: "'Fraunces',serif", fontStyle: "italic",
              fontSize: "clamp(44px,6vw,80px)", fontWeight: 900, color: "#fff0d6",
              letterSpacing: "-0.035em", lineHeight: 1,
            }}>
              Releases<span style={{ color: "#2fe6b8" }}>.</span>
            </h1>
            <a href={site.roster.find(a => a.slug === "irhay")?.links.spotify || "#"}
              target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "#1DB954", borderBottom: "1px solid #1DB954",
                paddingBottom: "2px", textDecoration: "none",
              }}>
              Follow on Spotify ↗
            </a>
          </div>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "16px",
            lineHeight: "1.7", color: "rgba(255,240,214,0.45)",
            maxWidth: "560px", marginTop: "20px",
          }}>
            60-second previews on every track. Stream on your platform of choice.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section ref={ref} className="reveal" style={{ padding: "0 clamp(24px,5vw,80px) 80px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px" }}>
            {site.releases.map((r, i) => (
              <ReleaseCard key={r.id} r={r} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Presave CTA */}
      <section style={{
        background: "rgba(16,16,26,0.7)",
        borderTop: "1px solid rgba(255,240,214,0.05)",
        padding: "64px clamp(24px,5vw,80px)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: "#ff6a3d", marginBottom: "16px",
          }}>New Music Coming</div>
          <h2 style={{
            fontFamily: "'Fraunces',serif", fontStyle: "italic",
            fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff0d6",
            letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "16px",
          }}>Don't miss the next drop.</h2>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "15px",
            color: "rgba(255,240,214,0.4)", marginBottom: "32px",
          }}>Pre-save now to be notified the moment it lands.</p>
          <a href={site.presaveUrl} target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-block", background: "#ff4d2d", color: "white",
              padding: "14px 40px", textDecoration: "none",
              fontFamily: "'Syne',sans-serif", fontSize: "11.5px", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>
            Pre-Save Now ↗
          </a>
        </div>
      </section>
    </>
  );
}
