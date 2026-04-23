import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Fish, Languages } from "lucide-react";
import { useLang } from "../lib/LanguageContext";
import { s } from "../lib/i18n";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हि" },
  { code: "mr", label: "मरा" },
];

export default function Header() {
  const { lang, setLang } = useLang();
  const { pathname } = useLocation();
  const onChat = pathname.startsWith("/chat");
  return (
    <header
      className="glass sticky top-0 z-50 border-b border-[color:var(--hairline)]"
      data-testid="app-header"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="brand-link">
          <div className="w-9 h-9 rounded-xl pond-wave grid place-items-center shadow-sm">
            <Fish size={18} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-black text-lg text-[color:var(--ink)]">
              {s("brand", lang)}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Fisherman Assistant
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-full border border-[color:var(--hairline)] bg-white"
            data-testid="language-toggle"
          >
            <Languages size={14} className="text-[color:var(--muted)] mx-1" />
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                  lang === l.code
                    ? "bg-[color:var(--pond)] text-white"
                    : "text-[color:var(--ink-soft)] hover:text-[color:var(--pond)]"
                }`}
                data-testid={`lang-btn-${l.code}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {!onChat && (
            <Link
              to="/chat"
              className="btn-pond px-4 py-2 rounded-full text-sm font-semibold hidden sm:inline-block"
              data-testid="header-cta-chat"
            >
              {s("cta_start", lang)}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
