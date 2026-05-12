import type { Dictionary } from "./getDictionary";

type PathOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? PathOf<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

export type TranslationKey = PathOf<Dictionary>;

export type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

function resolvePath(dict: Dictionary, path: string): string | undefined {
  const segments = path.split(".");
  let cursor: unknown = dict;
  for (const segment of segments) {
    if (cursor && typeof cursor === "object" && segment in cursor) {
      cursor = (cursor as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return typeof cursor === "string" ? cursor : undefined;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

export function createTranslate(dict: Dictionary): TranslateFn {
  return (key, params) => {
    const raw = resolvePath(dict, key);
    if (raw === undefined) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] missing key: ${key}`);
      }
      return key;
    }
    return params ? interpolate(raw, params) : raw;
  };
}
