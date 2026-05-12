"use client";

import { createContext, useMemo, type ReactNode } from "react";
import type { SessionUser } from "@/types/auth";
import { hasRole, type Role } from "@/types/auth";

interface SessionContextValue {
  user: SessionUser;
  hasAnyRole: (roles: Role[]) => boolean;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  user: SessionUser;
}

export function SessionProvider({ children, user }: SessionProviderProps) {
  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      hasAnyRole: (roles) => hasRole(user, roles),
    }),
    [user],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
