"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/shared/hooks/useSession";
import { useToast } from "@/shared/hooks/useToast";
import { useT } from "@/shared/hooks/useT";
import { DASHBOARD_ALLOWED_ROLES } from "@/types/auth";
import { REQUESTS_KEY, usePendingCountQuery } from "@/features/requests/hooks/useRequestsData";
import { useRequestsSocket } from "@/features/requests/hooks/useRequestsSocket";
import type { AppRequest } from "@/features/requests/types";

interface RequestsContextValue {
  isResolver: boolean;
  pendingCount: number;
  incomingSignal: number;
  lastRequest: AppRequest | null;
}

const RequestsContext = createContext<RequestsContextValue | null>(null);

/**
 * Provider de solicitudes a nivel de dashboard: mantiene el conteo de pendientes
 * para el badge del navbar y escucha por socket las nuevas solicitudes/resoluciones.
 */
export function RequestsProvider({ children }: { children: ReactNode }) {
  const { user, hasAnyRole } = useSession();
  const me = user.id;
  const { t } = useT();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Solo admin/superadmin resuelven solicitudes (y ven la bandeja).
  const isResolver = hasAnyRole(DASHBOARD_ALLOWED_ROLES);

  const [incomingSignal, setIncomingSignal] = useState(0);
  const [lastRequest, setLastRequest] = useState<AppRequest | null>(null);

  const pendingQuery = usePendingCountQuery(isResolver);
  const pendingCount = pendingQuery.data ?? 0;

  const invalidateRequests = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
  }, [queryClient]);

  const handleNew = useCallback(
    (request: AppRequest) => {
      setLastRequest(request);
      setIncomingSignal((n) => n + 1);
      invalidateRequests();
    },
    [invalidateRequests],
  );

  const handleResolved = useCallback(
    (request: AppRequest) => {
      invalidateRequests();
      // Si la solicitud resuelta es mía, aviso el resultado.
      if (request.requestedBy?.id === me) {
        const key =
          request.status === "approved" ? "requests.toast.approved" : "requests.toast.rejected";
        toast.info(t(key), { title: request.title });
      }
    },
    [invalidateRequests, me, t, toast],
  );

  useRequestsSocket({ enabled: true, onNew: handleNew, onResolved: handleResolved });

  const value = useMemo<RequestsContextValue>(
    () => ({ isResolver, pendingCount, incomingSignal, lastRequest }),
    [isResolver, pendingCount, incomingSignal, lastRequest],
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) {
    throw new Error("useRequests debe usarse dentro de <RequestsProvider>");
  }
  return ctx;
}
