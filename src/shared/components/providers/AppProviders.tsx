"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@/shared/components/i18n/I18nProvider";
import { ThemeProvider } from "@/shared/components/theme/ThemeProvider";
import { QueryProvider } from "@/shared/components/query/QueryProvider";
import { ToastProvider } from "@/shared/components/toast/ToastProvider";
import type { Dictionary } from "@/shared/lib/i18n/getDictionary";
import type { Locale } from "@/shared/lib/i18n/i18n.constants";

interface AppProvidersProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Providers globales (cliente) usados por (auth) y (dashboard).
 * ThemeProvider está bloqueado a "dark" hasta que se active el toggle.
 */
export function AppProviders({ children, locale, dictionary }: AppProvidersProps) {
  return (
    <ThemeProvider forceTheme="dark">
      <I18nProvider locale={locale} dictionary={dictionary}>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
