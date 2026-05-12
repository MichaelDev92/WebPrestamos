"use client";

import { useContext } from "react";
import { SessionContext } from "@/shared/components/session/SessionProvider";

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
}
