"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Artists", href: "/artists" },
  { label: "Releases", href: "/releases" },
  { label: "Spotlight", href: "/spotlight" },
  { label: "Studio", href: "/studio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 h-16 flex items-center justify-between transition-all duration-300 ${
        scrolled ? "glass-nav" : "border-b border-transparent"
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 no-underline">
        <span className="font-display text-xl font-bold text-white tracking-tight">
          Táradome
        </span>
        <span className="text-[10px] font-bold text-ember-400 tracking-[0.18em] uppercase mt-0.5">
          MUSIK
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-7">
        {NAV_LINKS.map((l) => (
          <Link key={l.label} href={l.href} className="nav-link no-underline">
            {l.label}
          </Link>
        ))}
        <a
          href="https://taratechent.com"
          target="_blank"
          rel="noreferrer"
          className="nav-link no-underline text-jade-400/70 hover:text-jade-400"
        >
          TáraDome ↗
        </a>
        <Link
          href="/join"
          className="bg-ember-400 text-white text-xs font-semibold px-4 py-1.5 rounded-md no-underline tracking-[0.06em] uppercase hover:bg-ember-500 transition-colors"
        >
          Join
        </Link>
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 right-0 bg-ink-900/98 border-b border-white/[0.06] p-6 flex flex-col gap-4 md:hidden backdrop-blur-xl">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-white/60 text-sm font-medium font-body no-underline hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/join"
            onClick={() => setMobileOpen(false)}
            className="bg-ember-400 text-white text-sm font-semibold px-4 py-2.5 rounded-lg no-underline text-center tracking-wide hover:bg-ember-500 transition-colors mt-2"
          >
            Join the Fan List
          </Link>
        </div>
      )}
    </nav>
  );
}
