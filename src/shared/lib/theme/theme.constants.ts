export const THEME_COOKIE = "wp_theme";
export const THEMES = ["dark", "light"] as const;
export const DEFAULT_THEME: Theme = "dark";

export type Theme = (typeof THEMES)[number];

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}
