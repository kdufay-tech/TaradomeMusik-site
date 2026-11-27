"use client";

import { AGE_OPTIONS, AGE_QUESTION, GUARDIAN_EMAIL_HINT, GUARDIAN_EMAIL_LABEL, type AgeBand } from "../lib/age";

/* The one age question every fan form asks (TEOS fan age check, 2026-11-27). Nothing preselected; a parent's email
 * field appears only for "13 to 17". The parent form owns the state and checks it with validateAge() before sending. */
export default function AgeQuestion({
  id,
  value,
  onChange,
  guardianEmail,
  onGuardianEmail,
  compact = false,
}: {
  id: string;
  value: AgeBand | "";
  onChange: (v: AgeBand) => void;
  guardianEmail: string;
  onGuardianEmail: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <fieldset className={"text-left border-0 p-0 m-0 " + (compact ? "mt-1" : "mt-2")}>
      <legend className="font-body text-[12.5px] font-semibold text-white/75 mb-1.5 p-0">{AGE_QUESTION} *</legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {AGE_OPTIONS.map((o) => (
          <label
            key={o.value}
            htmlFor={id + "-" + o.value}
            className={"inline-flex items-center gap-2 min-h-[44px] px-3 rounded-lg cursor-pointer font-body text-[13px] border " +
              (value === o.value ? "border-white/50 bg-white/[0.08] text-white" : "border-white/10 bg-white/[0.03] text-white/70")}
          >
            <input id={id + "-" + o.value} type="radio" name={id} value={o.value} checked={value === o.value}
              onChange={() => onChange(o.value)} className="accent-current w-4 h-4" />
            {o.label}
          </label>
        ))}
      </div>
      {value === "13_17" ? (
        <div className="mt-2">
          <label htmlFor={id + "-guardian"} className="block font-body text-[12px] font-semibold text-white/75 mb-1">{GUARDIAN_EMAIL_LABEL} *</label>
          <input id={id + "-guardian"} type="email" inputMode="email" autoComplete="off" value={guardianEmail}
            onChange={(e) => onGuardianEmail(e.target.value)} placeholder="parent@example.com"
            className="w-full bg-ink-950 border border-white/10 rounded-lg px-3 py-2.5 text-white font-body text-[14px] placeholder:text-white/30 focus:outline-none focus:border-white/25" />
          <p className="font-body text-[11px] text-white/45 mt-1">{GUARDIAN_EMAIL_HINT}</p>
        </div>
      ) : null}
    </fieldset>
  );
}
