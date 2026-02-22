"use client";

import { useI18n } from "../lib/i18n/provider";
import { SUPPORTED_LANGUAGES, type Language } from "../lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <select
      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
      aria-label="Language"
    >
      {SUPPORTED_LANGUAGES.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
