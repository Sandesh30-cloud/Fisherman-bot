import React from "react";
import { CloudRain, Fish, Stethoscope, TrendingUp, HelpCircle } from "lucide-react";
import { useLang } from "../../lib/LanguageContext";
import { s } from "../../lib/i18n";

const ICONS = {
  weather: CloudRain,
  feed: Fish,
  market: TrendingUp,
  diagnosis: Stethoscope,
  faq: HelpCircle,
};

export default function QuickActions({ onPick, activeIntent }) {
  const { lang } = useLang();
  const items = [
    { key: "weather", label: s("quick_weather", lang) },
    { key: "diagnosis", label: s("quick_diagnosis", lang) },
    { key: "feed", label: s("quick_feed", lang) },
    { key: "market", label: s("quick_market", lang) },
    { key: "faq", label: s("quick_faq", lang) },
  ];
  return (
    <div
      className="flex gap-2 overflow-x-auto no-scrollbar py-1 stagger"
      data-testid="quick-actions"
    >
      {items.map((it) => {
        const Icon = ICONS[it.key];
        const active = activeIntent === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onPick(it.key)}
            className={`chip msg-enter whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm ${
              active ? "chip-active" : ""
            }`}
            data-testid={`quick-action-${it.key}`}
          >
            <Icon size={15} strokeWidth={2.3} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
