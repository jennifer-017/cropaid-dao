"use client";

import * as React from "react";
import { dictionaries, type Language, SUPPORTED_LANGUAGES } from "./index";

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "cropaid_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>("en");

  React.useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (SUPPORTED_LANGUAGES as readonly string[]).includes(raw)) {
      setLangState(raw as Language);
    }
  }, []);

  const setLang = (next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const t = React.useCallback(
    (key: string) => {
      const dict = dictionaries[lang];
      return dict[key] ?? dictionaries.en[key] ?? key;
    },
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
