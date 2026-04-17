"use client";

import Link from "next/link";
import { site } from "@/data/site";

const EMBER = "#D4844C";
const JADE = "#2fe6b8";

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        minHeight: "60vh", position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center",
        padding: "120px clamp(24px,5vw,80px) 80px",
        background: "#07070a",
      }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%", width: "50%", height: "70%",
          background: `radial-gradient(ellipse, ${EMBER}14 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px",
            fontFamily: "'Syne',sans-serif", fontSize: "10.5px", fontWeight: 700,
            letterSpacing: "0.3em", textTransform: "uppercase", color: EMBER,
          }}>
            <span style={{ display: "inline-block", width: "28px", height: "1px", background: EMBER }} />
            The Institution
          </div>
          <h1 style={{
            fontFamily: "'Fraunces',serif", fontStyle: "italic",
            fontSize: "clamp(52px,7.5vw,96px)", fontWeight: 900, color: "#fff0d6",
            letterSpacing: "-0.035em", lineHeight: 1, marginBottom: "32px",
          }}>
            About<br />
            <span style={{
              background: `linear-gradient(130deg,#ffd07a 0%,${EMBER} 65%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>TÃ¡radomeMusik.</span>
          </h1>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(16px,1.8vw,20px)",
            lineHeight: "1.75", color: "rgba(255,240,214,0.55)",
            maxWidth: "680px",
          }}>{site.missionLong}</p>
        </div>
      </section>

      {/* Mission + Principles */}
      <section style={{ background: "#fff9f0", padding: "80px clamp(24px,5vw,80px)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,7vw,80px)" }}>
            <div>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase", color: "#ff4d2d",
                display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              }}>
                <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#ff4d2d" }} />
                Our Mission
              </div>
              <h2 style={{
                fontFamily: "'Fraunces',serif", fontStyle: "italic",
                fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 900, color: "#0b0b12",
                letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "24px",
              }}>Not just a label.<br /><span style={{ color: "#ff4d2d" }}>A legacy.</span></h2>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "16px",
                lineHeight: "1.75", color: "#1a1a27", marginBottom: "16px",
              }}>{site.mission}</p>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                lineHeight: "1.75", color: "rgba(26,26,39,0.55)",
              }}>
                Founded in 2021 and headquartered at {site.contact.address}. Distributed globally via OneRPM across Spotify, Apple Music, Boomplay, AudioMack, and beyond.
              </p>
            </div>

            <div>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase", color: "#2c5e5a",
                display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              }}>
                <span style={{ display: "inline-block", width: "24px", height: "1px", background: "#2c5e5a" }} />
                Core Principles
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {site.principles.map((p, i) => (
                  <div key={p.title} style={{
                    background: "#0b0b12", padding: "20px 24px",
                    borderLeft: `2px solid ${i < 3 ? "#D4844C" : "#2fe6b8"}`,
                  }}>
                    <div style={{
                      fontFamily: "'Fraunces',serif", fontSize: "16px",
                      fontWeight: 700, color: "#fff0d6", marginBottom: "6px",
                    }}>{p.title}</div>
                    <div style={{
                      fontFamily: "'DM Sans',sans-serif", fontSize: "13px",
                      lineHeight: "1.6", color: "rgba(255,240,214,0.38)",
                    }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        borderTop: "1px solid rgba(255,240,214,0.06)",
        borderBottom: "1px solid rgba(255,240,214,0.06)",
        padding: "0 clamp(24px,5vw,80px)",
        background: "rgba(11,11,18,0.8)",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2px" }}>
          {site.stats.map(s => (
            <div key={s.label} style={{ padding: "48px 24px", textAlign: "center", background: "rgba(255,255,255,0.015)" }}>
              <div style={{
                fontFamily: "'Fraunces',serif", fontStyle: "italic",
                fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, color: "#ffd07a", lineHeight: 1,
              }}>{s.value}</div>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "9.5px", fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,240,214,0.28)", marginTop: "8px",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "80px clamp(24px,5vw,80px)", background: "#07070a" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,80px)" }}>
            <div>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase", color: JADE,
                display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px",
              }}>
                <span style={{ display: "inline-block", width: "24px", height: "1px", background: JADE }} />
                Get in Touch
              </div>
              <h2 style={{
                fontFamily: "'Fraunces',serif", fontStyle: "italic",
                fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 900, color: "#fff0d6",
                letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "32px",
              }}>Let's talk<span style={{ color: JADE }}>.</span></h2>

              {[
                { label: "General", value: site.contact.email, href: `mailto:${site.contact.email}` },
                { label: "Booking", value: site.contact.bookingEmail, href: `mailto:${site.contact.bookingEmail}` },
                { label: "Address", value: site.contact.address, href: "#" },
                { label: "Phone (NG)", value: site.contact.phones[0], href: `tel:${site.contact.phones[0]}` },
                { label: "Phone (US)", value: site.contact.phones[2], href: `tel:${site.contact.phones[2]}` },
              ].map(c => (
                <div key={c.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  padding: "14px 0", borderBottom: "1px solid rgba(255,240,214,0.06)",
                }}>
                  <span style={{
                    fontFamily: "'Syne',sans-serif", fontSize: "9.5px", fontWeight: 700,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "rgba(255,240,214,0.28)",
                  }}>{c.label}</span>
                  <a href={c.href} style={{
                    fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                    color: c.href !== "#" ? JADE : "rgba(255,240,214,0.55)",
                    textDecoration: "none",
                  }}>{c.value}</a>
                </div>
              ))}
            </div>

            {/* Socials + Ecosystem */}
            <div>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase", color: EMBER,
                display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px",
              }}>
                <span style={{ display: "inline-block", width: "24px", height: "1px", background: EMBER }} />
                Follow the Label
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "48px" }}>
                {[
                  { name: "Instagram", href: "https://www.instagram.com/taradomemusik_/" },
                  { name: "YouTube",   href: "https://www.youtube.com/@irhayofficial" },
                  { name: "X / Twitter", href: "https://x.com/irhayofficial" },
                  { name: "Spotify",   href: "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP" },
                  { name: "AudioMack", href: "https://audiomack.com/irhayofficial" },
                  { name: "Boomplay",  href: "https://www.boomplay.com/artists/56248576" },
                ].map(s => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{
                      border: `1px solid ${EMBER}30`, color: EMBER, padding: "8px 16px",
                      fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${EMBER}14`)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >{s.name} â†—</a>
                ))}
              </div>

              {/* Ecosystem */}
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "rgba(255,240,214,0.2)", marginBottom: "16px",
              }}>Part of TÃ¡raDome Entertainment Group</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {site.ecosystem.map(e => (
                  <a key={e.name} href={e.href}
                    target={e.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "16px 20px",
                      background: e.active ? "rgba(212,132,76,0.08)" : "#10101a",
                      borderLeft: `2px solid ${e.active ? EMBER : "transparent"}`,
                      textDecoration: "none", transition: "background 0.2s",
                    }}>
                    <span style={{
                      fontFamily: "'Syne',sans-serif", fontSize: "12px", fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: e.active ? EMBER : "rgba(255,240,214,0.4)",
                    }}>{e.name}{e.active ? " â—" : ""}</span>
                    {!e.active && <span style={{ color: "rgba(255,240,214,0.2)", fontSize: "12px" }}>â†—</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section style={{
        background: "rgba(16,16,26,0.7)",
        borderTop: "1px solid rgba(255,240,214,0.05)",
        padding: "80px clamp(24px,5vw,80px)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "580px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Fraunces',serif", fontStyle: "italic",
            fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff0d6",
            letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "16px",
          }}>Ready to work together?</h2>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "15px",
            color: "rgba(255,240,214,0.4)", marginBottom: "32px",
          }}>Submit your music for consideration or reach out directly.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/studio" style={{
              background: "#ff4d2d", color: "white", padding: "14px 32px",
              fontFamily: "'Syne',sans-serif", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none",
            }}>Submit Music</Link>
            <a href={`mailto:${site.contact.email}`} style={{
              border: "1px solid rgba(255,240,214,0.2)", color: "#fff0d6",
              padding: "14px 32px",
              fontFamily: "'Syne',sans-serif", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none",
            }}>Email Us</a>
          </div>
        </div>
      </section>
    </>
  );
}

