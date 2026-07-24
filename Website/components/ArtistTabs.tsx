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
      <nav
        className="sticky top-0 z-30 -mt-px border-b border-white/10"
        style={{ background: "#101018", boxShadow: "0 6px 22px rgba(0,0,0,0.45)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            {sections.map((s) => {
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  aria-selected={on}
                  className="relative whitespace-nowrap font-body text-[15px] font-extrabold tracking-wide py-5 transition-colors"
                  style={{ color: on ? "#fff" : "rgba(255,255,255,0.6)" }}
                >
                  {s.label}
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[3px] rounded-full transition-colors"
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
