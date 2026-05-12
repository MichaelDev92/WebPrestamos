import esDict from "@/locales/es.json";
import { DEFAULT_LOCALE, type Locale } from "./i18n.constants";

export type Dictionary = typeof esDict;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: async () => esDict,
};

export async function getDictionary(locale: Locale = DEFAULT_LOCALE): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  return loader();
}
