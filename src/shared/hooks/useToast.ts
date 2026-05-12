"use client";

import { useContext } from "react";
import { ToastContext } from "@/shared/components/toast/ToastProvider";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}
