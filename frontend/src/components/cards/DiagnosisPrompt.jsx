import React, { useState } from "react";
import { Stethoscope, Sparkles } from "lucide-react";
import { useLang } from "../../lib/LanguageContext";
import { s } from "../../lib/i18n";

const CHIPS = {
  en: [
    "fish gasping at surface",
    "white spots on body",
    "red spots and ulcers",
    "fin rot and frayed tail",
    "not eating, lethargic",
    "swollen belly",
    "cotton-like fungus",
    "swollen red gills",
  ],
  hi: [
    "मछली सतह पर आ रही है",
    "शरीर पर सफेद धब्बे",
    "लाल धब्बे और फोड़े",
    "पंख सड़ना",
    "नहीं खा रही, सुस्त",
    "पेट सूजा हुआ",
    "रूई जैसी फफूंद",
    "लाल सूजी गिल्ल",
  ],
  mr: [
    "मासे पृष्ठभागावर येत आहेत",
    "शरीरावर पांढरे ठिपके",
    "लाल ठिपके आणि फोड",
    "पंख कुजणे",
    "खात नाही, थकलेले",
    "पोट फुगले",
    "कापसासारखी बुरशी",
    "लाल सूजलेले कल्ले",
  ],
};

export default function DiagnosisPrompt({ onSubmit, loading }) {
  const { lang } = useLang();
  const [text, setText] = useState("");
  const suggestions = CHIPS[lang] || CHIPS.en;

  const submit = (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
  };

  const pick = (phrase) => {
    setText(phrase);
    onSubmit(phrase);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-[color:var(--hairline)] p-5 shadow-sm"
      data-testid="diagnosis-prompt-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope size={16} className="text-[color:var(--pond)]" />
        <h4 className="font-display font-bold text-[color:var(--ink)]">
          {s("diagnosis_title", lang)}
        </h4>
      </div>
      <form onSubmit={submit} className="space-y-2">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={s("diagnosis_ph", lang)}
          className="w-full border border-[color:var(--hairline)] rounded-xl px-3 py-2 text-sm outline-none focus:border-[color:var(--pond)] resize-none"
          data-testid="diagnosis-textarea"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="btn-pond px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
          data-testid="diagnosis-submit-btn"
        >
          <Sparkles size={14} /> {s("diagnosis_btn", lang)}
        </button>
      </form>
      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-[color:var(--muted)] font-semibold mb-1.5">
          Quick symptoms
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((p) => (
            <button
              key={p}
              onClick={() => pick(p)}
              className="chip text-[12px] py-1 px-2.5 rounded-full"
              data-testid="diagnosis-chip"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
