"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/shared/components/i18n/I18nProvider";
import { ThemeProvider } from "@/shared/components/theme/ThemeProvider";
import { QueryProvider } from "@/shared/components/query/QueryProvider";
import { ToastProvider } from "@/shared/components/toast/ToastProvider";
import type { Dictionary } from "@/shared/lib/i18n/getDictionary";
import type { Locale } from "@/shared/lib/i18n/i18n.constants";
import { DEFAULT_THEME, type Theme } from "@/shared/lib/theme/theme.constants";

interface AppProvidersProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
  initialTheme?: Theme;
}

/**
 * Providers globales (cliente) usados por (auth) y (dashboard).
 * El tema inicial viene de la cookie (SSR); el toggle light/dark ya está activo.
 */
export function AppProviders({
  children,
  locale,
  dictionary,
  initialTheme = DEFAULT_THEME,
}: AppProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <I18nProvider locale={locale} dictionary={dictionary}>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
