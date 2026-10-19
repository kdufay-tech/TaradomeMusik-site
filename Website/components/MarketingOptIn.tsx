"use client";

import { optInLabel, OPTIN_NOTE } from "../lib/optin";

/* The one news opt-in box every fan form uses (TEOS privacy phase 1). Unticked by default; the
 * parent owns the state and sends it as marketing_opt_in. `required` is only for forms whose sole
 * purpose is email news (the home "Join the Fan List" and an artist's "Notify me"). */
export default function MarketingOptIn({
  artist,
  checked,
  onChange,
  required = false,
  compact = false,
}: {
  artist: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "text-left" : "text-left mt-1"}>
      <label className="flex items-start gap-2 cursor-pointer font-body text-[12px] text-white/55">
        <input
          type="checkbox"
          name="marketing_opt_in"
          checked={checked}
          required={required}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-[3px] accent-current"
        />
        <span>{optInLabel(artist)}</span>
      </label>
      {!compact ? (
        <p className="font-body text-[11px] text-white/30 mt-1">
          {OPTIN_NOTE} See our <a href="/privacy" className="underline">privacy notice</a>.
        </p>
      ) : null}
    </div>
  );
}
