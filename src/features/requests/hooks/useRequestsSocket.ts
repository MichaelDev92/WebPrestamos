"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { AppRequest } from "@/features/requests/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000";

interface UseRequestsSocketOptions {
  enabled: boolean;
  onNew?: (request: AppRequest) => void;
  onResolved?: (request: AppRequest) => void;
}

/**
 * Socket de solicitudes: escucha `request:new` (nuevas solicitudes para admins) y
 * `request:resolved` (resolución, para admins y para el solicitante). Reutiliza el
 * token corto de `/api/rt-token`.
 */
export function useRequestsSocket({ enabled, onNew, onResolved }: UseRequestsSocketOptions) {
  const [connected, setConnected] = useState(false);
  const onNewRef = useRef(onNew);
  const onResolvedRef = useRef(onResolved);

  useEffect(() => {
    onNewRef.current = onNew;
  }, [onNew]);
  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let socket: Socket | null = null;

    const connect = async () => {
      try {
        const response = await fetch("/api/rt-token", { cache: "no-store" });
        if (!response.ok || !active) return;
        const { token } = (await response.json()) as { token: string };
        socket = io(WS_URL, { auth: { token }, transports: ["websocket"], reconnection: true });
        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("request:new", (request: AppRequest) => onNewRef.current?.(request));
        socket.on("request:resolved", (request: AppRequest) => onResolvedRef.current?.(request));
      } catch {
        // sin conexión: las solicitudes se refrescan por react-query al navegar
      }
    };

    void connect();

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [enabled]);

  return { connected };
}
