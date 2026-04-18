"use client";

import { useState } from "react";
import Image from "next/image";

interface ReleasePlayerProps {
  title: string;
  artistName: string;
  date: string;
  type: string;
  coverImage: string;
  brandColor: string;
  spotifyId: string;
  spotifyType: "track" | "album";
  presave?: string;
  dsps: Record<string, string>;
}

export default function ReleasePlayer({
  title,
  artistName,
  date,
  type,
  coverImage,
  brandColor,
  spotifyId,
  spotifyType,
  presave,
  dsps,
}: ReleasePlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="release-cover-card"
      style={{ "--glow": `${brandColor}30` } as React.CSSProperties}
    >
      {/* Cover art / Spotify embed toggle */}
      <div className={playing ? "relative overflow-hidden" : "aspect-square relative overflow-hidden"}>
        {playing ? (
          /* Spotify embed — counts as a real play */
          <div className="bg-black rounded-t-2xl overflow-hidden" style={{ height: spotifyType === "album" ? "380px" : "352px" }}>
            <iframe
              src={`https://open.spotify.com/embed/${spotifyType}/${spotifyId}?utm_source=generator&theme=0&autoplay=1`}
              width="100%"
              height="100%"
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="eager"
              style={{ borderRadius: "12px" }}
              title={`${title} by ${artistName}`}
            />
            <button
              onClick={() => setPlaying(false)}
              className="absolute top-3 right-3 z-30 bg-black/70 backdrop-blur-sm text-white/60 hover:text-white text-xs font-body px-2.5 py-1 rounded-full border border-white/10 transition-colors cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
        ) : (
          /* Cover art with play button */
          <>
            <Image
              src={coverImage}
              alt={`${title} — ${artistName}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,7,10,0.7) 0%, transparent 50%)",
              }}
            />
            <span className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-sm text-white/70 text-[10px] font-semibold font-body px-3 py-1 rounded-full tracking-wide uppercase border border-white/[0.08]">
              {type}
            </span>

            {/* Play button overlay */}
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 z-20 flex items-center justify-center group/play cursor-pointer bg-transparent border-none"
              aria-label={`Play ${title}`}
            >
              <div className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-all duration-300 transform scale-90 group-hover/play:scale-100 shadow-lg shadow-black/40">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="ml-1"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Track info */}
      <div className="p-5">
        <h4 className="font-body text-base font-semibold text-white mb-1">
          {title}
        </h4>
        <p className="font-body text-[13px] text-white/40 mb-0.5">
          {artistName}
        </p>
        <p className="font-body text-[11px] text-white/25">{date}</p>

        <div className="flex gap-2 mt-3.5 flex-wrap">
          {Object.keys(dsps).map((dsp) => (
            <a
              key={dsp}
              href={dsps[dsp]}
              target="_blank"
              rel="noreferrer"
              className="dsp-badge no-underline hover:text-white/60 hover:border-white/20 transition-colors"
            >
              {dsp.charAt(0).toUpperCase() + dsp.slice(1)}
            </a>
          ))}
          {presave && (
            <a
              href={presave}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-body text-ember-400 border border-ember-400/30 px-2.5 py-0.5 rounded-full font-semibold tracking-wide no-underline hover:border-ember-400/60 transition-colors"
            >
              Pre-Save
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
