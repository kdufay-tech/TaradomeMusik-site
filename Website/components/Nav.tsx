"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { site } from "@/data/site";

const NAV_ITEMS = [
  { href: "/artists",  label: "Artists"  },
  { href: "/releases", label: "Releases" },
  { href: "/spotlight",label: "Spotlight"},
  { href: "/studio",   label: "Studio"   },
  { href: "/about",    label: "About"    },
  { href: "/contact",  label: "Contact"  },
];

function Wordmark() {
  return (
    <Link href="/" className="flex flex-col leading-none gap-0.5 no-underline">
      <span
        className="text-sand-100 tracking-tight"
        style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:"20px", fontWeight:800 }}
      >
        Táradome
      </span>
      <span
        className="text-ember-400 tracking-widest uppercase"
        style={{ fontFamily:"'Syne',sans-serif", fontSize:"8px", fontWeight:800, letterSpacing:"0.38em" }}
      >
        MUSIK
      </span>
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          height: "72px",
          background: scrolled ? "rgba(11,11,18,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,240,214,0.06)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-10">

          <Wordmark />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="px-3 py-2 text-white/55 hover:text-white transition-colors duration-200"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"11.5px", fontWeight:700, letterSpacing:"0.13em", textTransform:"uppercase" }}
              >
                {it.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Ecosystem badge */}
            <a
              href="https://taratechent.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-jade-400/30 px-3 py-1.5 text-jade-400 hover:bg-jade-400/10 transition-colors"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}
            >
              TáraDome ↗
            </a>

            <Link
              href="/join"
              className="bg-ember-500 hover:bg-ember-400 px-5 py-2 text-white transition-colors"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}
            >
              Join
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="flex md:hidden items-center justify-center w-10 h-10 border border-white/10 text-white/70"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={{ fontSize:"18px" }}>{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-20 px-6 pb-8 bg-ink-950/98"
          style={{ backdropFilter:"blur(20px)" }}
        >
          <nav className="flex flex-col gap-1 mt-4">
            {NAV_ITEMS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setMenuOpen(false)}
                className="py-4 text-white/60 hover:text-white border-b border-white/06 transition-colors"
                style={{ fontFamily:"'Syne',sans-serif", fontSize:"14px", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase" }}
              >
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="https://taratechent.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center border border-jade-400/30 py-3 text-jade-400"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}
            >
              TáraDome Ecosystem ↗
            </a>
            <Link
              href="/join"
              onClick={() => setMenuOpen(false)}
              className="text-center bg-ember-500 py-3 text-white"
              style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}
            >
              Join the Inner Circle
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
