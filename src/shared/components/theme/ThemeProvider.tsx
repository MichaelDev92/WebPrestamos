"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setThemeCookie } from "@/shared/lib/theme/theme.actions";
import { DEFAULT_THEME, type Theme } from "@/shared/lib/theme/theme.constants";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
  isLocked: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
  /**
   * Si está presente, bloquea el theme a este valor.
   * Útil mientras el toggle no esté activo (fase actual: forceTheme="dark").
   */
  forceTheme?: Theme;
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME,
  forceTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(forceTheme ?? initialTheme);

  useEffect(() => {
    if (forceTheme) {
      document.documentElement.dataset.theme = forceTheme;
      return;
    }
    document.documentElement.dataset.theme = theme;
  }, [theme, forceTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      if (forceTheme) return;
      setThemeState(next);
      void setThemeCookie(next);
    },
    [forceTheme],
  );

  const toggleTheme = useCallback(() => {
    if (forceTheme) return;
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      void setThemeCookie(next);
      return next;
    });
  }, [forceTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: forceTheme ?? theme,
      setTheme,
      toggleTheme,
      isLocked: Boolean(forceTheme),
    }),
    [theme, forceTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
