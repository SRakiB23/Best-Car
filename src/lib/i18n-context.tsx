"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { defaultLocale, translator, type Locale, type Translate } from "./i18n";

const I18nContext = createContext<{ locale: Locale; t: Translate }>({
  locale: defaultLocale,
  t: (text) => text,
});

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: translator(locale) }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
