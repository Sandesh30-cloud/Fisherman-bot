import React, { useState } from "react";
import { MapPin, Search, CloudRain, Thermometer, Wind, Droplets, AlertTriangle, Radio } from "lucide-react";
import { useLang } from "../../lib/LanguageContext";
import { s } from "../../lib/i18n";

export function WeatherPrompt({ onSubmit, loading }) {
  const { lang } = useLang();
  const [city, setCity] = useState("");
  return (
    <div
      className="bg-white rounded-2xl border border-[color:var(--hairline)] p-4 shadow-sm"
      data-testid="weather-prompt-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={16} className="text-[color:var(--pond)]" />
        <h4 className="font-display font-bold text-[color:var(--ink)]">
          {s("weather_title", lang)}
        </h4>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={s("location_ph", lang)}
          className="flex-1 border border-[color:var(--hairline)] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[color:var(--pond)]"
          data-testid="weather-city-input"
        />
        <button
          disabled={loading || !city.trim()}
          onClick={() => onSubmit(city.trim())}
          className="btn-pond px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
          data-testid="weather-fetch-btn"
        >
          <Search size={14} />
          {s("location_btn", lang)}
        </button>
      </div>
    </div>
  );
}

export default function WeatherCard({ data }) {
  const { lang } = useLang();
  if (!data || !data.ok) return null;
  const { location, current, today_rain_probability, heavy_rain_alert, advisory, forecast, source } = data;

  return (
    <div
      className="bg-white rounded-2xl border border-[color:var(--hairline)] overflow-hidden shadow-sm"
      data-testid="weather-card"
    >
      <div className="px-5 py-4 pond-wave text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-20">
          <CloudRain size={140} strokeWidth={1} />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold">
          <Radio size={11} className="animate-pulse" />
          {s("live_badge", lang)}
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <div className="text-xs opacity-80">{location?.region || location?.country}</div>
            <div className="font-display font-black text-2xl leading-tight">
              {location?.name}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-black text-4xl leading-none">
              {Math.round(current?.temperature_c ?? 0)}°
            </div>
            <div className="text-xs opacity-85 mt-1">{current?.condition}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[color:var(--hairline)] text-center">
        <div className="p-3">
          <Droplets size={14} className="mx-auto text-[color:var(--monsoon)]" />
          <div className="font-display font-bold text-lg mt-1">
            {today_rain_probability}%
          </div>
          <div className="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">
            Rain prob.
          </div>
        </div>
        <div className="p-3">
          <Wind size={14} className="mx-auto text-[color:var(--muted)]" />
          <div className="font-display font-bold text-lg mt-1">
            {Math.round(current?.wind_kmh ?? 0)}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">
            km/h wind
          </div>
        </div>
        <div className="p-3">
          <Thermometer size={14} className="mx-auto text-[color:var(--clay)]" />
          <div className="font-display font-bold text-lg mt-1">
            {Math.round(current?.humidity ?? 0)}%
          </div>
          <div className="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">
            Humidity
          </div>
        </div>
      </div>

      {heavy_rain_alert && (
        <div
          className="alert-warn px-4 py-3 flex items-start gap-2 text-sm"
          data-testid="weather-heavy-rain-alert"
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Heavy rain alert</div>
            <div>{advisory}</div>
          </div>
        </div>
      )}
      {!heavy_rain_alert && (
        <div className="alert-rain px-4 py-3 text-sm flex items-center gap-2">
          <CloudRain size={14} />
          <span>{advisory}</span>
        </div>
      )}

      {forecast?.length > 0 && (
        <div className="px-4 py-3 border-t border-[color:var(--hairline)]">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)] mb-2">
            3-day forecast
          </div>
          <div className="grid grid-cols-3 gap-2">
            {forecast.map((f) => (
              <div
                key={f.date}
                className="rounded-xl bg-[color:var(--bg-chat)] p-2.5 text-center"
              >
                <div className="text-[11px] text-[color:var(--muted)] font-mono">
                  {f.date?.slice(5)}
                </div>
                <div className="font-display font-bold mt-0.5">
                  {Math.round(f.t_max)}° / {Math.round(f.t_min)}°
                </div>
                <div className="text-[10px] text-[color:var(--ink-soft)] truncate">
                  {f.condition}
                </div>
                <div className="text-[10px] text-[color:var(--monsoon)] mt-0.5 font-semibold">
                  {f.rain_prob ?? 0}% rain
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-2 text-[10px] text-[color:var(--muted)] font-mono border-t border-[color:var(--hairline)]">
        Source · {source}
      </div>
    </div>
  );
}
