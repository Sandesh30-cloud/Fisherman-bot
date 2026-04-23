import React from "react";
import { Stethoscope, AlertCircle, ShieldCheck } from "lucide-react";

const SEVERITY = {
  high: { label: "HIGH", color: "bg-[color:var(--warn)] text-white" },
  medium: { label: "MEDIUM", color: "bg-[color:var(--clay)] text-white" },
  low: { label: "LOW", color: "bg-[color:var(--pond-ink)] text-white" },
};

export default function DiagnosisCard({ data }) {
  if (!data) return null;
  const { intro, matches } = data;
  return (
    <div
      className="bg-white rounded-2xl border border-[color:var(--hairline)] p-5 shadow-sm"
      data-testid="diagnosis-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope size={16} className="text-[color:var(--pond)]" />
        <h4 className="font-display font-bold text-[color:var(--ink)]">
          Diagnosis
        </h4>
      </div>
      {(!matches || matches.length === 0) && (
        <div className="alert-warn rounded-xl px-3 py-2 text-sm inline-flex items-center gap-2">
          <AlertCircle size={14} /> {intro}
        </div>
      )}
      {matches?.length > 0 && (
        <>
          <p className="text-sm text-[color:var(--ink-soft)]">{intro}</p>
          <ul className="mt-3 space-y-3">
            {matches.map((m) => {
              const sev = SEVERITY[m.severity] || SEVERITY.low;
              return (
                <li
                  key={m.id}
                  className="rounded-xl border border-[color:var(--hairline)] p-4"
                  data-testid={`diagnosis-match-${m.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display font-bold text-[color:var(--ink)]">
                      {m.title}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${sev.color}`}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-[13px] text-[color:var(--ink-soft)] mt-1">
                    {m.cause}
                  </p>
                  <div className="mt-3">
                    <div className="text-[10px] uppercase tracking-wider text-[color:var(--muted)] font-semibold inline-flex items-center gap-1">
                      <ShieldCheck size={10} /> Remedies
                    </div>
                    <ul className="mt-1.5 space-y-1 text-[13px] text-[color:var(--ink-soft)] list-disc pl-5">
                      {m.remedy.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
