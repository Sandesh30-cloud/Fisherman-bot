import React, { useState } from "react";
import { Fish, Scale, Utensils, Calculator, Info } from "lucide-react";
import { useLang } from "../../lib/LanguageContext";
import { s } from "../../lib/i18n";

const SPECIES = [
  "generic",
  "rohu",
  "catla",
  "mrigal",
  "tilapia",
  "pangasius",
  "common_carp",
  "grass_carp",
];

export function FeedForm({ onSubmit, loading }) {
  const { lang } = useLang();
  const [weight, setWeight] = useState("100");
  const [count, setCount] = useState("500");
  const [species, setSpecies] = useState("rohu");
  const [meals, setMeals] = useState("2");

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      fish_weight_g: Number(weight),
      num_fish: Number(count),
      species,
      meals_per_day: Number(meals),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl border border-[color:var(--hairline)] p-5 shadow-sm"
      data-testid="feed-form"
    >
      <div className="flex items-center gap-2 mb-4">
        <Fish size={16} className="text-[color:var(--pond)]" />
        <h4 className="font-display font-bold text-[color:var(--ink)]">
          {s("feed_title", lang)}
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block col-span-1">
          <span className="text-[11px] uppercase tracking-wide text-[color:var(--muted)] font-semibold">
            {s("feed_weight", lang)}
          </span>
          <input
            type="number"
            min="1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full border border-[color:var(--hairline)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[color:var(--pond)] font-mono"
            data-testid="feed-input-weight"
          />
        </label>
        <label className="block col-span-1">
          <span className="text-[11px] uppercase tracking-wide text-[color:var(--muted)] font-semibold">
            {s("feed_count", lang)}
          </span>
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="mt-1 w-full border border-[color:var(--hairline)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[color:var(--pond)] font-mono"
            data-testid="feed-input-count"
          />
        </label>
        <label className="block col-span-1">
          <span className="text-[11px] uppercase tracking-wide text-[color:var(--muted)] font-semibold">
            {s("feed_species", lang)}
          </span>
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="mt-1 w-full border border-[color:var(--hairline)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[color:var(--pond)] bg-white"
            data-testid="feed-input-species"
          >
            {SPECIES.map((sp) => (
              <option key={sp} value={sp}>
                {sp.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block col-span-1">
          <span className="text-[11px] uppercase tracking-wide text-[color:var(--muted)] font-semibold">
            {s("feed_meals", lang)}
          </span>
          <input
            type="number"
            min="1"
            max="5"
            value={meals}
            onChange={(e) => setMeals(e.target.value)}
            className="mt-1 w-full border border-[color:var(--hairline)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[color:var(--pond)] font-mono"
            data-testid="feed-input-meals"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-clay mt-4 w-full py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2"
        data-testid="feed-calc-submit"
      >
        <Calculator size={15} /> {s("feed_submit", lang)}
      </button>
    </form>
  );
}

export default function FeedResultCard({ data }) {
  if (!data || !data.ok) return null;
  return (
    <div
      className="bg-white rounded-2xl border border-[color:var(--hairline)] p-5 shadow-sm"
      data-testid="feed-result-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Utensils size={16} className="text-[color:var(--clay)]" />
        <h4 className="font-display font-bold text-[color:var(--ink)]">
          Daily feed plan
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Daily feed" value={`${data.daily_feed_kg} kg`} accent />
        <Stat label="Per meal" value={`${data.per_meal_kg} kg`} />
        <Stat label="Biomass" value={`${data.biomass_kg} kg`} />
        <Stat label="Monthly" value={`${data.monthly_feed_kg} kg`} />
      </div>
      <div className="mt-4 flex items-center gap-1.5 flex-wrap">
        <span className="clay-chip px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
          {data.stage}
        </span>
        <span className="bg-[color:var(--pond-mist)] text-[color:var(--pond-ink)] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-[color:var(--pond-ink)]/20">
          rate {data.feeding_rate_percent}%
        </span>
        <span className="bg-white border border-[color:var(--hairline)] text-[color:var(--ink-soft)] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
          {data.inputs.species}
        </span>
      </div>
      <div className="mt-4 text-sm text-[color:var(--ink-soft)] flex items-start gap-2 bg-[color:var(--bg-chat)] rounded-xl p-3">
        <Info size={14} className="shrink-0 mt-0.5 text-[color:var(--pond)]" />
        {data.tip}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      className={`rounded-xl p-3 border ${
        accent
          ? "bg-[color:var(--pond)] border-[color:var(--pond)] text-white"
          : "bg-[color:var(--bg-chat)] border-[color:var(--hairline)]"
      }`}
    >
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${accent ? "text-white/70" : "text-[color:var(--muted)]"}`}>
        <Scale size={10} className="inline mr-1 -mt-0.5" /> {label}
      </div>
      <div className="font-display font-black text-xl mt-0.5 font-mono">{value}</div>
    </div>
  );
}
