"use client";

import { useState } from "react";
import { site } from "@/data/site";

const EMBER = "#D4844C";
const STAGES = ["demo", "developing", "independent", "label-ready"];
const GENRES = ["Afrobeats", "Afro-fusion", "Hip-Hop", "R&B", "Pop", "Reggae", "Highlife", "Other"];

type State = "idle" | "loading" | "ok" | "err";

export default function StudioPage() {
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    artist: "", genre: "", stage: "",
    links: "", bio: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/artist-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "studio-page", tags: ["artist-submission", form.stage, form.genre] }),
      });
      if (!res.ok) throw new Error();
      setState("ok");
      setMsg("Submission received. We review every submission and will be in touch within 5–7 business days.");
    } catch {
      setState("err");
      setMsg("Something went wrong. Email us directly at " + site.contact.email);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 18px", background: "#10101a",
    border: "1px solid rgba(255,240,214,0.1)", color: "#fff0d6",
    fontFamily: "'DM Sans',sans-serif", fontSize: "14px", outline: "none",
    transition: "border-color 0.2s",
  };
  const labelStyle = {
    fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700 as const,
    letterSpacing: "0.2em", textTransform: "uppercase" as const,
    color: "rgba(255,240,214,0.35)", display: "block", marginBottom: "8px",
  };

  return (
    <>
      {/* Header */}
      <section style={{
        padding: "120px clamp(24px,5vw,80px) 64px",
        background: "#07070a", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%", width: "50%", height: "70%",
          background: `radial-gradient(ellipse, ${EMBER}12 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px",
            fontFamily: "'Syne',sans-serif", fontSize: "10.5px", fontWeight: 700,
            letterSpacing: "0.3em", textTransform: "uppercase", color: EMBER,
          }}>
            <span style={{ display: "inline-block", width: "28px", height: "1px", background: EMBER }} />
            Artist Submissions
          </div>
          <h1 style={{
            fontFamily: "'Fraunces',serif", fontStyle: "italic",
            fontSize: "clamp(44px,6vw,80px)", fontWeight: 900, color: "#fff0d6",
            letterSpacing: "-0.035em", lineHeight: 1, marginBottom: "24px",
          }}>
            Submit Your<br />
            <span style={{
              background: `linear-gradient(130deg,#ffd07a 0%,${EMBER} 65%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Music.</span>
          </h1>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(15px,1.7vw,18px)",
            lineHeight: "1.75", color: "rgba(255,240,214,0.5)",
            maxWidth: "580px",
          }}>
            We're selective. We're serious. We review every submission personally and only work with artists we can genuinely move forward. If that's you — let's talk.
          </p>
        </div>
      </section>

      {/* Form + Criteria */}
      <section style={{ padding: "0 clamp(24px,5vw,80px) 80px", background: "#07070a" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: "clamp(40px,6vw,80px)", alignItems: "start" }}>

          {/* Form */}
          {state === "ok" ? (
            <div style={{
              padding: "60px 48px",
              border: `1px solid ${EMBER}30`,
              background: `${EMBER}08`,
            }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: EMBER, marginBottom: "16px" }}>Submission Received</div>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: "32px", fontWeight: 900, color: "#fff0d6", marginBottom: "16px", lineHeight: 1.2 }}>
                We've got your music.
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "rgba(255,240,214,0.55)", lineHeight: "1.7" }}>{msg}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Name */}
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input required value={form.name} onChange={set("name")} placeholder="Full name"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")} />
                </div>
                {/* Artist name */}
                <div>
                  <label style={labelStyle}>Artist / Stage Name *</label>
                  <input required value={form.artist} onChange={set("artist")} placeholder="Artist name"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")} />
                </div>
                {/* Email */}
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="your@email.com"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")} />
                </div>
                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={set("phone")} placeholder="+234 or +1..."
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")} />
                </div>
                {/* Genre */}
                <div>
                  <label style={labelStyle}>Primary Genre *</label>
                  <select required value={form.genre} onChange={set("genre")}
                    style={{ ...inputStyle, appearance: "none" as const }}
                    onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")}>
                    <option value="">Select genre</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                {/* Stage */}
                <div>
                  <label style={labelStyle}>Career Stage *</label>
                  <select required value={form.stage} onChange={set("stage")}
                    style={{ ...inputStyle, appearance: "none" as const }}
                    onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")}>
                    <option value="">Select stage</option>
                    {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}</option>)}
                  </select>
                </div>
              </div>

              {/* Links */}
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Music Links * (Spotify, SoundCloud, YouTube, etc.)</label>
                <input required value={form.links} onChange={set("links")}
                  placeholder="https://open.spotify.com/artist/... or SoundCloud link"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")} />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: "32px" }}>
                <label style={labelStyle}>Brief Bio / Pitch *</label>
                <textarea required value={form.bio} onChange={set("bio")} rows={5}
                  placeholder="Tell us who you are, what your sound is, and why TáradomeMusik is the right home for you."
                  style={{ ...inputStyle, resize: "vertical" as const, lineHeight: "1.6" }}
                  onFocus={e => (e.target.style.borderColor = `${EMBER}60`)}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")} />
              </div>

              {state === "err" && (
                <div style={{
                  padding: "14px 18px", background: "rgba(255,77,45,0.1)",
                  border: "1px solid rgba(255,77,45,0.3)",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "13px",
                  color: "rgba(255,240,214,0.7)", marginBottom: "20px",
                }}>{msg}</div>
              )}

              <button type="submit" disabled={state === "loading"}
                style={{
                  background: state === "loading" ? "#5c3d2e" : "#ff4d2d",
                  color: "white", border: "none", padding: "16px 40px",
                  fontFamily: "'Syne',sans-serif", fontSize: "11.5px", fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
                  transition: "background 0.2s", width: "100%",
                }}>
                {state === "loading" ? "Submitting..." : "Submit for Consideration"}
              </button>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
                color: "rgba(255,240,214,0.2)", marginTop: "12px", textAlign: "center",
              }}>We review every submission. Response within 5–7 business days.</p>
            </form>
          )}

          {/* Sidebar criteria */}
          <div style={{ position: "sticky", top: "96px" }}>
            <div style={{ background: "#10101a", padding: "32px", borderTop: `2px solid ${EMBER}`, marginBottom: "16px" }}>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "9.5px", fontWeight: 700,
                letterSpacing: "0.25em", textTransform: "uppercase",
                color: "rgba(255,240,214,0.25)", marginBottom: "20px",
              }}>What We Look For</div>
              {[
                "Distinctive sound — not derivative",
                "African roots or diaspora connection",
                "Consistent creative output",
                "Work ethic that matches ambition",
                "Openness to label development",
                "Long-term career mindset",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: "12px",
                  padding: "10px 0", borderBottom: "1px solid rgba(255,240,214,0.05)",
                }}>
                  <span style={{ color: EMBER, fontSize: "10px", flexShrink: 0, marginTop: "2px" }}>✦</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "rgba(255,240,214,0.5)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ background: "#10101a", padding: "28px", borderTop: "2px solid #2fe6b8" }}>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "9.5px", fontWeight: 700,
                letterSpacing: "0.25em", textTransform: "uppercase",
                color: "rgba(255,240,214,0.25)", marginBottom: "14px",
              }}>Direct Contact</div>
              <a href={`mailto:${site.contact.bookingEmail}`} style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                color: "#2fe6b8", textDecoration: "none", display: "block", marginBottom: "8px",
              }}>{site.contact.bookingEmail}</a>
              <p style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                color: "rgba(255,240,214,0.3)", lineHeight: "1.6",
              }}>For urgent booking and partnership enquiries.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
