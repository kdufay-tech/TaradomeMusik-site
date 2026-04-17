import Link from "next/link";
import { site } from "@/data/site";

const NAV_COLS = [
  {
    head: "Music",
    links: [
      { label: "New Releases",    href: "/releases"  },
      { label: "Artists",         href: "/artists"   },
      { label: "Spotlight",       href: "/spotlight" },
      { label: "Sync Licensing",  href: "/contact"   },
      { label: "Submit Music",    href: "/studio"    },
    ],
  },
  {
    head: "Company",
    links: [
      { label: "About Us",        href: "/about"   },
      { label: "Contact",         href: "/contact" },
      { label: "Studio",          href: "/studio"  },
      { label: "Privacy Policy",  href: "/privacy" },
    ],
  },
  {
    head: "Connect",
    links: [
      { label: "Fan Club",        href: "/join"    },
      { label: "Instagram",       href: "https://www.instagram.com/taradomemusik_/"                       },
      { label: "YouTube",         href: "https://www.youtube.com/@irhayofficial"                          },
      { label: "Spotify",         href: "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP"          },
      { label: "AudioMack",       href: "https://audiomack.com/irhayofficial"                             },
      { label: "Boomplay",        href: "https://www.boomplay.com/artists/56248576"                       },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#0b0b12", borderTop: "1px solid rgba(255,240,214,0.05)" }}>

      {/* Ecosystem ribbon */}
      <div style={{
        background: "#07070a",
        borderBottom: "1px solid rgba(255,240,214,0.04)",
        padding: "16px clamp(24px,5vw,80px)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{
          fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.25em", textTransform: "uppercase",
          color: "rgba(255,240,214,0.18)",
        }}>
          Part of the TáraDome Entertainment Group
        </span>
        <div style={{ display: "flex", gap: "clamp(16px,3vw,32px)", flexWrap: "wrap" }}>
          {site.ecosystem.map(e => (
            <a key={e.name}
              href={e.href}
              target={e.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Syne',sans-serif", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none",
                color: e.active ? "#ff6a3d" : "rgba(255,240,214,0.28)",
                transition: "color 0.2s",
              }}
              onMouseEnter={ev => !e.active && (ev.currentTarget.style.color = "#fff0d6")}
              onMouseLeave={ev => !e.active && (ev.currentTarget.style.color = "rgba(255,240,214,0.28)")}
            >
              {e.name}{e.active ? " ●" : ""}
            </a>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "clamp(48px,7vw,80px) clamp(24px,5vw,80px) 40px",
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: "clamp(32px,5vw,64px)",
      }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: "4px" }}>
            <span style={{
              fontFamily: "'Fraunces',serif", fontStyle: "italic",
              fontSize: "20px", fontWeight: 800, color: "#fff0d6",
              letterSpacing: "-0.03em",
            }}>Táradome</span>
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: "7px", fontWeight: 800,
            letterSpacing: "0.38em", textTransform: "uppercase", color: "#ff6a3d",
            marginBottom: "18px",
          }}>MUSIK</div>

          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "13px", lineHeight: "1.7",
            color: "rgba(255,240,214,0.28)", maxWidth: "240px", marginBottom: "24px",
          }}>
            An African-owned music institution — building legacy, one release at a time.
          </p>

          {/* Social icons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { l: "IG",  h: "https://www.instagram.com/taradomemusik_/" },
              { l: "YT",  h: "https://www.youtube.com/@irhayofficial"   },
              { l: "X",   h: "https://x.com/irhayofficial"              },
              { l: "SP",  h: "https://open.spotify.com/artist/6xS2lgAe7MInvSPrs97rGP" },
              { l: "AM",  h: "https://audiomack.com/irhayofficial"      },
            ].map(s => (
              <a key={s.l} href={s.h} target="_blank" rel="noopener noreferrer"
                style={{
                  width: "34px", height: "34px",
                  border: "1px solid rgba(255,240,214,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700,
                  color: "rgba(255,240,214,0.35)", textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#ff6a3d";
                  e.currentTarget.style.color = "#ff6a3d";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,240,214,0.1)";
                  e.currentTarget.style.color = "rgba(255,240,214,0.35)";
                }}
              >{s.l}</a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {NAV_COLS.map(col => (
          <div key={col.head}>
            <div style={{
              fontFamily: "'Syne',sans-serif", fontSize: "9px", fontWeight: 700,
              letterSpacing: "0.25em", textTransform: "uppercase",
              color: "rgba(255,240,214,0.2)", marginBottom: "18px",
            }}>{col.head}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {col.links.map(l => (
                <li key={l.label}>
                  <a href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'DM Sans',sans-serif", fontSize: "13px",
                      color: "rgba(255,240,214,0.38)", textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff0d6")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,240,214,0.38)")}
                  >{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact strip */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 clamp(24px,5vw,80px) 32px",
        display: "flex", gap: "32px", flexWrap: "wrap",
      }}>
        {[
          { l: "General",  v: site.contact.email,        h: `mailto:${site.contact.email}`        },
          { l: "Booking",  v: site.contact.bookingEmail, h: `mailto:${site.contact.bookingEmail}` },
          { l: "Lagos",    v: site.contact.phones[0],    h: `tel:${site.contact.phones[0]}`       },
          { l: "USA",      v: site.contact.phones[2],    h: `tel:${site.contact.phones[2]}`       },
        ].map(c => (
          <div key={c.l} style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
            <span style={{
              fontFamily: "'Syne',sans-serif", fontSize: "8px", fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,240,214,0.2)",
            }}>{c.l}</span>
            <a href={c.h} style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "13px",
              color: "rgba(255,240,214,0.35)", textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff0d6")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,240,214,0.35)")}
            >{c.v}</a>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "20px clamp(24px,5vw,80px)",
        borderTop: "1px solid rgba(255,240,214,0.05)",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "rgba(255,240,214,0.16)" }}>
          © {new Date().getFullYear()} TáraDome Entertainment Group. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { l: "Privacy Policy", h: "/privacy" },
            { l: "Terms of Use",   h: "/privacy" },
          ].map(l => (
            <Link key={l.l} href={l.h} style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
              color: "rgba(255,240,214,0.16)", textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff0d6")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,240,214,0.16)")}
            >{l.l}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
