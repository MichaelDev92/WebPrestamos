export const LOCALES = ["es"] as const;
export const DEFAULT_LOCALE: Locale = "es";

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
