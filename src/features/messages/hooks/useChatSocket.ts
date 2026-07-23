"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "@/features/messages/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000";

interface ReadReceipt {
  by: string;
  peerId: string;
}

interface UseChatSocketOptions {
  onMessage: (message: ChatMessage) => void;
  onRead?: (receipt: ReadReceipt) => void;
}

/**
 * Conecta el socket del chat. Obtiene un token corto de `/api/rt-token`
 * (leído de la cookie httpOnly en el server) y lo usa en el handshake.
 */
export function useChatSocket({ onMessage, onRead }: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  const onReadRef = useRef(onRead);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  useEffect(() => {
    let active = true;
    let socket: Socket | null = null;

    const connect = async () => {
      try {
        const response = await fetch("/api/rt-token", { cache: "no-store" });
        if (!response.ok || !active) return;
        const { token } = (await response.json()) as { token: string };
        socket = io(WS_URL, {
          auth: { token },
          transports: ["websocket"],
          reconnection: true,
        });
        socketRef.current = socket;
        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("message:new", (message: ChatMessage) => onMessageRef.current(message));
        socket.on("message:read", (receipt: ReadReceipt) => onReadRef.current?.(receipt));
      } catch {
        // sin conexión: el chat queda en modo solo-lectura hasta reconectar
      }
    };

    void connect();

    return () => {
      active = false;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((to: string, content: string) => {
    socketRef.current?.emit("message:send", { to, content });
  }, []);

  const markRead = useCallback((peerId: string) => {
    socketRef.current?.emit("message:read", { peerId });
  }, []);

  return { connected, sendMessage, markRead };
}
