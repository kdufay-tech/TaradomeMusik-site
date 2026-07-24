"use client";

import { useState } from "react";

type Section = { id: string; label: string; content: React.ReactNode };

// Sticky tabbed navigation for the public artist page. All sections stay in the
// DOM (hidden, not unmounted) so SEO crawlers still see every section.
export default function ArtistTabs({
  sections,
  brandColor,
}: {
  sections: Section[];
  brandColor: string;
}) {
  const [active, setActive] = useState(sections[0]?.id || "");

  return (
    <div>
      <nav className="sticky top-0 z-30 bg-ink-950/90 backdrop-blur border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {sections.map((s) => {
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  aria-selected={on}
                  className="relative whitespace-nowrap font-body text-sm font-semibold px-4 py-4 transition-colors"
                  style={{ color: on ? "#fff" : "rgba(255,255,255,0.45)" }}
                >
                  {s.label}
                  <span
                    className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full transition-colors"
                    style={{ background: on ? brandColor : "transparent" }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {sections.map((s) => (
        <div key={s.id} hidden={active !== s.id}>
          {s.content}
        </div>
      ))}
    </div>
  );
}
