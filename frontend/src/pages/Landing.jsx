import React from "react";
import { Link } from "react-router-dom";
import { CloudRain, Stethoscope, Fish, TrendingUp, Radio, ArrowRight, Globe2 } from "lucide-react";
import Header from "../components/Header";
import { useLang } from "../lib/LanguageContext";
import { s } from "../lib/i18n";

const HERO = "https://images.pexels.com/photos/5786581/pexels-photo-5786581.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function Landing() {
  const { lang } = useLang();
  const features = [
    {
      icon: CloudRain,
      color: "text-[color:var(--monsoon)]",
      bg: "bg-[color:var(--monsoon-soft)]",
      title: s("feature_1_title", lang),
      body: s("feature_1_body", lang),
    },
    {
      icon: Stethoscope,
      color: "text-[color:var(--warn)]",
      bg: "bg-[color:var(--warn-soft)]",
      title: s("feature_2_title", lang),
      body: s("feature_2_body", lang),
    },
    {
      icon: TrendingUp,
      color: "text-[color:var(--clay-dark)]",
      bg: "bg-[color:var(--clay-soft)]",
      title: s("feature_3_title", lang),
      body: s("feature_3_body", lang),
    },
    {
      icon: Globe2,
      color: "text-[color:var(--pond-ink)]",
      bg: "bg-[color:var(--pond-mist)]",
      title: s("feature_4_title", lang),
      body: s("feature_4_body", lang),
    },
  ];

  const heroLines = s("hero_h1", lang).split("\n");

  return (
    <div className="min-h-screen bg-paper" data-testid="landing-page">
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 clay-chip px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <Radio size={12} className="animate-pulse" /> {s("live_badge", lang)}
          </div>
          <h1 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[color:var(--ink)] leading-[1.02]">
            {heroLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 text-base text-[color:var(--ink-soft)] max-w-[44ch] leading-relaxed">
            {s("hero_sub", lang)}
          </p>
          <div className="mt-7 flex gap-3 flex-wrap">
            <Link
              to="/chat"
              className="btn-pond inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold"
              data-testid="hero-cta-chat"
            >
              {s("cta_start", lang)} <ArrowRight size={15} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border border-[color:var(--hairline)] bg-white hover:border-[color:var(--pond)] transition"
              data-testid="hero-cta-learn"
            >
              {s("cta_learn", lang)}
            </a>
          </div>

          {/* Quick stats */}
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md">
            <Stat num="9" unit="diseases mapped" />
            <Stat num="3" unit="languages" />
            <Stat num="Live" unit="Open-Meteo data" />
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--hairline)] shadow-[0_24px_60px_-24px_rgba(8,28,21,0.35)]">
            <img
              src={HERO}
              alt="Aquaculture ponds drone view"
              className="w-full h-[420px] sm:h-[520px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--pond-dark)]/70" />
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl pond-wave grid place-items-center">
                <Fish size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-[color:var(--muted)] font-semibold">
                  Matsya says
                </div>
                <div className="text-[13.5px] text-[color:var(--ink)] font-medium truncate">
                  Heavy rain in Nashik today — reduce feeding 40%.
                </div>
              </div>
              <span className="alert-rain text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>

          <div className="hidden lg:block absolute -left-8 top-8 w-32 h-32 rounded-full bg-[color:var(--clay)]/15 blur-2xl" />
          <div className="hidden lg:block absolute -right-10 bottom-14 w-40 h-40 rounded-full bg-[color:var(--pond)]/15 blur-2xl" />
        </div>
      </section>

      {/* Ticker */}
      <div className="border-y border-[color:var(--hairline)] bg-[color:var(--pond-mist)]/50 overflow-hidden py-2.5">
        <div className="ticker font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--pond-ink)] whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="inline-flex gap-10">
              <span>● Rohu ₹210/kg</span>
              <span>● Catla ₹195/kg</span>
              <span>● Tilapia ₹145/kg</span>
              <span>● Pangasius ₹125/kg</span>
              <span>● Prawn ₹480/kg</span>
              <span>● Heavy rain alert — Kolhapur</span>
              <span>● White spot watch — North Bengal</span>
              <span>● Rohu ₹210/kg</span>
              <span>● Catla ₹195/kg</span>
              <span>● Tilapia ₹145/kg</span>
              <span>● Pangasius ₹125/kg</span>
              <span>● Prawn ₹480/kg</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16"
        data-testid="features-section"
      >
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[color:var(--ink)] tracking-tight max-w-[26ch]">
            Five specialists. One chat window.
          </h2>
          <p className="text-sm text-[color:var(--ink-soft)] max-w-md">
            The intent router reads your message and switches between a weather
            forecaster, a fish pathologist, a feed calculator and a market analyst.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-2xl bg-white border border-[color:var(--hairline)] p-5 hover:-translate-y-0.5 hover:shadow-md transition"
                data-testid={`feature-card-${i}`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} grid place-items-center`}>
                  <Icon size={18} className={f.color} />
                </div>
                <div className="mt-4 font-display font-bold text-[color:var(--ink)]">
                  {f.title}
                </div>
                <p className="mt-1.5 text-[13.5px] text-[color:var(--ink-soft)] leading-relaxed">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] pond-wave p-8 sm:p-12 text-white">
          <div className="absolute -right-12 -top-12 opacity-15">
            <Fish size={220} strokeWidth={1.2} />
          </div>
          <div className="relative max-w-xl">
            <h3 className="font-display font-black text-2xl sm:text-4xl tracking-tight leading-tight">
              Built for monsoon ponds. Answers in your language.
            </h3>
            <p className="mt-3 text-white/80 text-sm">
              Start a conversation — no sign-up, no cost.
            </p>
            <Link
              to="/chat"
              className="mt-6 inline-flex items-center gap-2 btn-clay px-5 py-3 rounded-full text-sm font-semibold"
              data-testid="bottom-cta-chat"
            >
              {s("cta_start", lang)} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:var(--hairline)] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-[12px] text-[color:var(--muted)]">
          <div className="font-mono">{s("footer", lang)}</div>
          <div className="font-mono">Open-Meteo · data.gov.in fallback</div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ num, unit }) {
  return (
    <div className="rounded-xl border border-[color:var(--hairline)] bg-white px-3 py-2.5">
      <div className="font-display font-black text-2xl text-[color:var(--pond)] leading-none">
        {num}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--muted)] font-semibold mt-1">
        {unit}
      </div>
    </div>
  );
}
