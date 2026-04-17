"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/data/site";
import { AudioPreview } from "@/components/AudioPreview";

export default function SpotlightPage() {
  const artist = site.roster.find(a => a.slug === site.artistOfTheMonth.artistSlug)!;
  const release = site.releases.find(r => r.artistSlug === artist?.slug);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const O = "#D4844C"; // IRhay burnt orange accent

  return (
    <>
      <style>{`
        @keyframes spPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.15)}}
      `}</style>

      {/* Hero */}
      <section style={{
        minHeight: "85vh", position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center",
        padding: "120px clamp(24px,5vw,80px) 80px",
        background: "#07070a",
      }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%", width: "55%", height: "80%",
          background: `radial-gradient(ellipse, ${O}18 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "0", left: "0", width: "40%", height: "50%",
          background: "radial-gradient(ellipse, rgba(44,94,90,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%", background: O,
              animation: "spPulse 2s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.3em", textTransform: "uppercase", color: O,
            }}>Artist of the Month · {site.artistOfTheMonth.month}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(280px,38%)", gap: "clamp(40px,7vw,80px)", alignItems: "center" }}>
            {/* Left */}
            <div>
              <h1 style={{
                fontFamily: "'Fraunces',serif", fontStyle: "italic",
                fontSize: "clamp(52px,7.5vw,96px)", fontWeight: 900, color: "#fff0d6",
                letterSpacing: "-0.035em", lineHeight: 1, marginBottom: "24px",
              }}>
                {site.artistOfTheMonth.headline}
              </h1>
              <blockquote style={{
                fontFamily: "'Fraunces',serif", fontStyle: "italic",
                fontSize: "clamp(18px,2.5vw,28px)", fontWeight: 700,
                color: "rgba(255,240,214,0.6)", lineHeight: 1.4,
                borderLeft: `2px solid ${O}`, paddingLeft: "24px",
                marginBottom: "32px",
              }}>
                "{site.artistOfTheMonth.quote}"
              </blockquote>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(14px,1.5vw,17px)",
                lineHeight: "1.75", color: "rgba(255,240,214,0.5)",
                maxWidth: "520px", marginBottom: "40px",
              }}>
                {site.artistOfTheMonth.spotlightCopy}
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/join" style={{
                  background: "#ff4d2d", color: "white", padding: "14px 32px",
                  fontFamily: "'Syne',sans-serif", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none",
                  display: "inline-block",
                }}>{site.artistOfTheMonth.ctaText}</Link>
                <Link href={`/artists/${artist.slug}`} style={{
                  border: "1px solid rgba(255,240,214,0.2)", color: "#fff0d6",
                  padding: "14px 32px",
                  fontFamily: "'Syne',sans-serif", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none",
                  display: "inline-block",
                }}>View Full Profile →</Link>
              </div>
            </div>

            {/* Right: Artist card */}
            <div style={{
              background: `linear-gradient(160deg,#2a1a0e 0%,#5c3d2e 45%,${O} 100%)`,
              position: "relative", overflow: "hidden", aspectRatio: "3/4",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(7,7,10,0.95) 0%, transparent 55%)",
              }} />
              <div style={{ position: "absolute", bottom: "28px", left: "28px", right: "20px" }}>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700,
                  letterSpacing: "0.25em", textTransform: "uppercase", color: O, marginBottom: "10px",
                }}>✦ Spotlight Artist</div>
                <div style={{
                  fontFamily: "'Fraunces',serif", fontStyle: "italic",
                  fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#fff0d6", lineHeight: 1.1,
                }}>{artist.name}</div>
                <div style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                  color: "rgba(255,240,214,0.45)", marginTop: "6px",
                }}>{artist.genre} · {artist.origin}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track preview */}
      {release && (
        <section style={{
          background: "rgba(16,16,26,0.8)",
          borderTop: "1px solid rgba(255,240,214,0.05)",
          padding: "64px clamp(24px,5vw,80px)",
        }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,80px)", alignItems: "center" }}>
              <div>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.3em", textTransform: "uppercase",
                  color: "#8d9a6a", marginBottom: "16px",
                  display: "flex", alignItems: "center", gap: "12px",
                }}>
                  <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#8d9a6a" }} />
                  Featured Track
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces',serif", fontStyle: "italic",
                  fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 900, color: "#fff0d6",
                  letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "8px",
                }}>{release.title}</h2>
                <div style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                  color: "rgba(255,240,214,0.4)", marginBottom: "28px",
                }}>{release.artist} · {release.type}</div>
                <AudioPreview src={release.previewUrl} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
                  {Object.entries(release.dspLinks).map(([k, href]) =>
                    href ? (
                      <a key={k} href={href} target="_blank" rel="noopener noreferrer"
                        style={{
                          border: `1px solid ${O}30`, color: O, padding: "6px 14px",
                          fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700,
                          letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = `${O}14`)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >{k === "presave" ? "Pre-Save" : k.charAt(0).toUpperCase() + k.slice(1)} ↗</a>
                    ) : null
                  )}
                </div>
              </div>

              {/* Fan unlocks */}
              <div style={{ background: "#10101a", padding: "36px", borderTop: `2px solid ${O}` }}>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.25em", textTransform: "uppercase",
                  color: "rgba(255,240,214,0.25)", marginBottom: "20px",
                }}>Fan-Only Unlocks</div>
                {[
                  "Early 60s snippets + behind-the-scenes",
                  "Ticket pre-sale access + merch drops",
                  "Segmented updates by city & behavior",
                  "Direct messages from the artist",
                  "Exclusive VIP access at events",
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "12px", alignItems: "flex-start",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255,240,214,0.05)",
                  }}>
                    <span style={{ color: O, fontSize: "10px", flexShrink: 0, marginTop: "2px" }}>✦</span>
                    <span style={{
                      fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                      color: "rgba(255,240,214,0.55)",
                    }}>{item}</span>
                  </div>
                ))}
                <Link href="/join" style={{
                  display: "inline-block", marginTop: "24px",
                  background: "#ff4d2d", color: "white", padding: "12px 28px",
                  fontFamily: "'Syne',sans-serif", fontSize: "10.5px", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none",
                }}>Join the Fan List</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Email CTA */}
      <section style={{
        background: "#07070a",
        borderTop: "1px solid rgba(255,240,214,0.05)",
        padding: "80px clamp(24px,5vw,80px)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Fraunces',serif", fontStyle: "italic",
            fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff0d6",
            letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "16px",
          }}>Get the full spotlight.</h2>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "15px",
            color: "rgba(255,240,214,0.4)", marginBottom: "36px",
          }}>New month, new artist, new drops. Join the list.</p>
          {done ? (
            <div style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: "22px", color: "#2fe6b8" }}>
              You're in. Watch your inbox.
            </div>
          ) : (
            <div style={{ display: "flex", maxWidth: "440px", margin: "0 auto" }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: "14px 18px", background: "#10101a",
                  border: "1px solid rgba(255,240,214,0.1)", borderRight: "none",
                  color: "#fff0d6", fontFamily: "'DM Sans',sans-serif",
                  fontSize: "14px", outline: "none",
                }}
              />
              <button onClick={() => email && setDone(true)} style={{
                padding: "14px 24px", background: "#ff4d2d", border: "none",
                color: "white", fontFamily: "'Syne',sans-serif", fontSize: "10px",
                fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
              }}>Join</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
