import React from "react";
import { TrendingDown, TrendingUp, Minus, IndianRupee, Store, CheckCircle2 } from "lucide-react";
import { useLang } from "../../lib/LanguageContext";

const NAME_KEY = { en: "species", hi: "species_hi", mr: "species_mr" };

export default function MarketCard({ data }) {
  const { lang } = useLang();
  if (!data || !data.ok) return null;
  const { heading, prices, advisory, source_note, fetched_at } = data;
  const nameKey = NAME_KEY[lang] || "species";

  return (
    <div
      className="bg-white rounded-2xl border border-[color:var(--hairline)] overflow-hidden shadow-sm"
      data-testid="market-price-card"
    >
      <div className="px-5 py-4 flex items-center gap-2 border-b border-[color:var(--hairline)] bg-[color:var(--pond-mist)]">
        <Store size={16} className="text-[color:var(--pond)]" />
        <h4 className="font-display font-bold text-[color:var(--ink)]">{heading}</h4>
      </div>
      <ul className="divide-y divide-[color:var(--hairline)]">
        {prices.map((p) => {
          const Trend =
            p.trend === "up" ? TrendingUp : p.trend === "down" ? TrendingDown : Minus;
          const trendColor =
            p.trend === "up"
              ? "text-[color:var(--pond-ink)]"
              : p.trend === "down"
                ? "text-[color:var(--warn)]"
                : "text-[color:var(--muted)]";
          return (
            <li
              key={p.species}
              className="px-4 py-3 flex items-center justify-between"
              data-testid={`market-row-${p.species.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[color:var(--ink)] truncate">
                  {p[nameKey] || p.species}
                </div>
                <div className="text-[11px] text-[color:var(--muted)] font-mono">
                  {p.mandi}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-xs font-bold ${trendColor} inline-flex items-center gap-0.5`}>
                  <Trend size={12} /> {p.change_percent > 0 ? "+" : ""}
                  {p.change_percent}%
                </div>
                <div className="font-display font-black text-[color:var(--ink)] inline-flex items-center">
                  <IndianRupee size={13} className="opacity-70" />
                  {p.price.toFixed(0)}
                  <span className="text-[10px] text-[color:var(--muted)] ml-0.5 font-medium">
                    /{p.unit}
                  </span>
                </div>
                {p.recommend_sell && (
                  <span className="clay-chip text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Sell
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="px-5 py-3 bg-[color:var(--clay-soft)] border-t border-[color:var(--hairline)] text-sm flex items-start gap-2">
        <CheckCircle2 size={14} className="text-[color:var(--clay-dark)] shrink-0 mt-0.5" />
        <div className="text-[color:var(--clay-dark)] font-medium">{advisory}</div>
      </div>
      {/* <div className="px-5 py-2 text-[10px] font-mono text-[color:var(--muted)]">
        {source_note} · {fetched_at?.slice(0, 10)}
      </div> */}
    </div>
  );
}
