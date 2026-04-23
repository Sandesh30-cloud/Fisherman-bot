import React, { createContext, useContext, useState } from "react";

const LangCtx = createContext({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("matsyavan_lang") || "en";
    } catch (_) {
      return "en";
    }
  });
  const update = (l) => {
    setLang(l);
    try {
      localStorage.setItem("matsyavan_lang", l);
    } catch (_) {}
  };
  return (
    <LangCtx.Provider value={{ lang, setLang: update }}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);
