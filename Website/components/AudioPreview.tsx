'use client';

import * as React from "react";
import { Play, Pause } from "lucide-react";

type Props = { src: string; maxSeconds?: number };

export function AudioPreview({ src, maxSeconds = 60 }: Props) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0);

  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onTime = () => {
      const sec = a.currentTime || 0;
      setT(sec);
      if (sec >= maxSeconds) {
        a.pause();
        a.currentTime = 0;
        setPlaying(false);
        setT(0);
      }
    };

    const onEnd = () => {
      setPlaying(false);
      setT(0);
    };

    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [maxSeconds]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;

    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }

    try {
      document.querySelectorAll("audio").forEach((el) => {
        if (el !== a) el.pause();
      });
      await a.play();
      setPlaying(true);
    } catch {
      // ignore autoplay restrictions
    }
  };

  const pct = Math.min(100, (t / maxSeconds) * 100);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
        aria-label={playing ? "Pause preview" : "Play preview"}
        type="button"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <div className="w-44">
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-ember-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-white/60">Preview: {Math.round(Math.max(0, maxSeconds - t))}s</div>
      </div>

      <audio ref={audioRef} src={src} preload="none" />
    </div>
  );
}
