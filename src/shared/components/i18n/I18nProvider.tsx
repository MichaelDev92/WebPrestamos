"use client";

import { createContext, useMemo, type ReactNode } from "react";
import { createTranslate, type TranslateFn } from "@/shared/lib/i18n/translate";
import type { Dictionary } from "@/shared/lib/i18n/getDictionary";
import type { Locale } from "@/shared/lib/i18n/i18n.constants";

interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
  t: TranslateFn;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}

export function I18nProvider({ children, locale, dictionary }: I18nProviderProps) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dictionary,
      t: createTranslate(dictionary),
    }),
    [locale, dictionary],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
