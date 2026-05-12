"use client";

import { useContext } from "react";
import { I18nContext } from "@/shared/components/i18n/I18nProvider";

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useT debe usarse dentro de <I18nProvider>");
  }
  return ctx;
}
