"use client";

import * as React from "react";
import Link from "next/link";
import { site } from "@/data/site";

type State = "idle" | "loading" | "ok" | "err";

const TIERS = [
  {
    id: "bronze", name: "Bronze", price: "Free", period: "",
    accent: "#D4844C",
    tagline: "Start here.",
    perks: [
      "New release alerts",
      "Monthly newsletter",
      "Early presale access",
      "CRM fan tag: bronze",
    ],
  },
  {
    id: "silver", name: "Silver", price: "$4", period: "/mo",
    accent: "#2fe6b8",
    tagline: "Most popular.",
    featured: true,
    perks: [
      "Everything in Bronze",
      "Exclusive content drops",
      "Fan Discord access",
      "Monthly curated playlist",
      "Behind-the-scenes access",
      "CRM fan tag: silver",
    ],
  },
  {
    id: "gold", name: "Gold", price: "$12", period: "/mo",
    accent: "#ffd07a",
    tagline: "Inner circle.",
    perks: [
      "Everything in Silver",
      "Virtual artist sessions",
      "Merch discounts",
      "NFT / digital collectibles",
      "Loyalty reward points",
      "VIP event access",
      "CRM fan tag: gold",
    ],
  },
];

export default function JoinPage() {
  const [tier, setTier] = React.useState("bronze");
  const [state, setState] = React.useState<State>("idle");
  const [msg, setMsg] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const selected = TIERS.find(t => t.id === tier)!;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/crm/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, phone, source: "join-page",
          tags: ["fan", tier],
          tier,
        }),
      });
      if (!res.ok) throw new Error();
      setState("ok");
      setMsg("Welcome to the inner circle.");
    } catch {
      setState("err");
      setMsg("Something went wrong. Try again.");
    }
  };

  return (
    <>
      {/* Header */}
      <section style={{
        padding: "120px clamp(24px,5vw,80px) 72px",
        background: "#07070a", position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,77,45,0.1), transparent)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: "10.5px", fontWeight: 700,
            letterSpacing: "0.3em", textTransform: "uppercase", color: "#ff6a3d",
            marginBottom: "20px",
          }}>Join the Inner Circle</div>
          <h1 style={{
            fontFamily: "'Fraunces',serif", fontStyle: "italic",
            fontSize: "clamp(44px,6vw,80px)", fontWeight: 900, color: "#fff0d6",
            letterSpacing: "-0.035em", lineHeight: 1.05, marginBottom: "20px",
          }}>
            Become a TáraDome<br />
            <span style={{
              background: "linear-gradient(130deg,#ffd07a 0%,#ff6a3d 65%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Insider.</span>
          </h1>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(15px,1.7vw,18px)",
            lineHeight: "1.75", color: "rgba(255,240,214,0.45)",
          }}>
            Access exclusive content, early releases, and direct connection with the artists shaping Africa's global sound.
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section style={{ padding: "0 clamp(24px,5vw,80px) 64px", background: "#07070a" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", marginBottom: "64px" }}>
            {TIERS.map(t => (
              <div key={t.id}
                onClick={() => setTier(t.id)}
                style={{
                  background: tier === t.id ? "#10101a" : "#07070a",
                  padding: "clamp(28px,4vw,44px) clamp(22px,3vw,36px)",
                  cursor: "pointer", position: "relative",
                  borderTop: `2px solid ${tier === t.id ? t.accent : "rgba(255,240,214,0.06)"}`,
                  transition: "all 0.25s ease",
                }}
              >
                {t.featured && (
                  <div style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: `${t.accent}18`, border: `1px solid ${t.accent}40`,
                    padding: "3px 10px",
                    fontFamily: "'Syne',sans-serif", fontSize: "7.5px", fontWeight: 700,
                    letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent,
                  }}>Popular</div>
                )}
                {tier === t.id && (
                  <div style={{
                    position: "absolute", top: "20px", left: "20px",
                    border: `1px solid ${t.accent}`,
                    padding: "3px 10px",
                    fontFamily: "'Syne',sans-serif", fontSize: "7.5px", fontWeight: 700,
                    letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent,
                  }}>Selected</div>
                )}

                <div style={{
                  fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.25em", textTransform: "uppercase",
                  color: t.accent, marginBottom: "6px",
                  marginTop: "32px",
                }}>{t.name}</div>

                <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "6px" }}>
                  <span style={{
                    fontFamily: "'Fraunces',serif",
                    fontSize: "clamp(32px,4vw,44px)", fontWeight: 700,
                    color: "#fff0d6", lineHeight: 1,
                  }}>{t.price}</span>
                  <span style={{
                    fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                    color: "rgba(255,240,214,0.4)",
                  }}>{t.period}</span>
                </div>

                <div style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                  color: "rgba(255,240,214,0.3)", marginBottom: "24px",
                  fontStyle: "italic",
                }}>{t.tagline}</div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {t.perks.map((p, i) => (
                    <li key={i} style={{
                      fontFamily: "'DM Sans',sans-serif", fontSize: "13px",
                      color: "rgba(255,240,214,0.45)",
                      padding: "9px 0",
                      borderBottom: "1px solid rgba(255,240,214,0.05)",
                      display: "flex", gap: "10px", alignItems: "center",
                    }}>
                      <span style={{ color: t.accent, fontSize: "10px", flexShrink: 0 }}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{
              fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.25em", textTransform: "uppercase",
              color: "rgba(255,240,214,0.25)", marginBottom: "8px", textAlign: "center",
            }}>
              Joining as {selected.name}
              {selected.price !== "Free" && ` · ${selected.price}${selected.period}`}
            </div>

            {state === "ok" ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  fontFamily: "'Fraunces',serif", fontStyle: "italic",
                  fontSize: "28px", color: selected.accent, marginBottom: "12px",
                }}>{msg}</div>
                <p style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: "14px",
                  color: "rgba(255,240,214,0.45)",
                }}>Check your inbox for next steps.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <div style={{ display: "flex", marginBottom: "12px" }}>
                  <input type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      flex: 1, padding: "15px 18px", background: "#10101a",
                      border: "1px solid rgba(255,240,214,0.1)", borderRight: "none",
                      color: "#fff0d6", fontFamily: "'DM Sans',sans-serif",
                      fontSize: "14px", outline: "none",
                    }}
                    onFocus={e => (e.target.style.borderColor = `${selected.accent}50`)}
                    onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")}
                  />
                  <button type="submit" disabled={state === "loading"}
                    style={{
                      padding: "15px clamp(16px,2.5vw,28px)",
                      background: selected.price === "Free" ? "#ff4d2d" : selected.accent,
                      border: "none", color: "white", cursor: "pointer",
                      fontFamily: "'Syne',sans-serif", fontSize: "10.5px", fontWeight: 700,
                      letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0,
                      transition: "opacity 0.2s",
                    }}>
                    {state === "loading" ? "Joining..." : selected.price === "Free" ? "Join Free" : "Join Now"}
                  </button>
                </div>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Phone (optional — for SMS alerts)"
                  style={{
                    width: "100%", padding: "14px 18px", background: "#10101a",
                    border: "1px solid rgba(255,240,214,0.1)",
                    color: "#fff0d6", fontFamily: "'DM Sans',sans-serif",
                    fontSize: "14px", outline: "none", marginBottom: "12px",
                  }}
                  onFocus={e => (e.target.style.borderColor = `${selected.accent}50`)}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,240,214,0.1)")}
                />
                {state === "err" && (
                  <div style={{
                    fontFamily: "'DM Sans',sans-serif", fontSize: "13px",
                    color: "#ff6a3d", marginBottom: "10px",
                  }}>{msg}</div>
                )}
                <p style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
                  color: "rgba(255,240,214,0.2)", textAlign: "center",
                }}>
                  No spam. Unsubscribe anytime.{" "}
                  <Link href="/privacy" style={{ color: "rgba(255,240,214,0.35)" }}>Privacy Policy</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
