"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/shared/hooks/useSession";
import { messagesApi } from "@/features/messages/api/messagesApi";
import { MESSAGES_KEY, useConversationsQuery } from "@/features/messages/hooks/useMessagesData";
import { useChatSocket } from "@/features/messages/hooks/useChatSocket";
import type { ChatMessage, Conversation } from "@/features/messages/types";

interface ChatContextValue {
  connected: boolean;
  conversations: Conversation[];
  unreadTotal: number;
  liveMessages: Record<string, ChatMessage[]>;
  activePeerId: string | null;
  /** Contador que se incrementa con cada mensaje entrante fuera de la conversación activa. */
  incomingSignal: number;
  /** Peer del último mensaje entrante que disparó `incomingSignal`. */
  lastIncomingPeerId: string | null;
  setActivePeerId: (peerId: string | null) => void;
  sendMessage: (to: string, content: string) => void;
  openConversation: (peerId: string) => void;
  markConversationRead: (peerId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Provider de chat a nivel de dashboard: mantiene el socket vivo en toda la app
 * (no solo en /messages), calcula el total de no leídos para el navbar y emite una
 * señal al recibir un mensaje fuera de la conversación activa (el navbar la usa
 * para desplegar la viñeta bajo el ícono de mensajes).
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const me = user.id;
  const queryClient = useQueryClient();

  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<Record<string, ChatMessage[]>>({});
  const [incomingSignal, setIncomingSignal] = useState(0);
  const [lastIncomingPeerId, setLastIncomingPeerId] = useState<string | null>(null);

  // Refs para usar el socket dentro de callbacks estables sin dependencia circular
  // con useChatSocket (que a su vez recibe los handlers de este provider).
  const socketMarkReadRef = useRef<(peerId: string) => void>(() => undefined);
  const connectedRef = useRef(false);

  // Ref siempre-actual del peer activo: evita cualquier problema de closure obsoleto
  // en el handler del socket (que se crea una sola vez).
  const activePeerRef = useRef<string | null>(null);
  useEffect(() => {
    activePeerRef.current = activePeerId;
  }, [activePeerId]);

  const conversationsQuery = useConversationsQuery();
  const conversationsData = conversationsQuery.data;
  const conversations = useMemo(() => conversationsData ?? [], [conversationsData]);
  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);

  const invalidateConversations = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...MESSAGES_KEY, "conversations"] });
  }, [queryClient]);

  const markConversationRead = useCallback(
    (peerId: string) => {
      if (connectedRef.current) {
        // Vía socket: el gateway persiste y notifica al remitente (para el "visto")
        // y a nuestra propia bandeja (para bajar el contador de no leídos).
        socketMarkReadRef.current(peerId);
      } else {
        void messagesApi.markRead(peerId).finally(invalidateConversations);
      }
    },
    [invalidateConversations],
  );

  // Recibo de lectura entrante: refresca conversaciones (lastRead/no leídos) y
  // marca como leídos los mensajes en vivo de esa conversación.
  const handleRead = (receipt: { by: string; peerId: string }) => {
    const peer = receipt.peerId;
    setLiveMessages((prev) => {
      const current = prev[peer];
      if (!current) return prev;
      return { ...prev, [peer]: current.map((m) => (m.read ? m : { ...m, read: true })) };
    });
    invalidateConversations();
  };

  const handleMessage = (message: ChatMessage) => {
    const peer = message.from === me ? message.to : message.from;
    setLiveMessages((prev) => ({ ...prev, [peer]: [...(prev[peer] ?? []), message] }));

    const incoming = message.to === me;
    if (incoming && activePeerRef.current === peer) {
      // La conversación está abierta → marcar como leído para no acumular no leídos.
      markConversationRead(peer);
    } else if (incoming) {
      // Fuera de la conversación activa → señal para la viñeta del navbar.
      setLastIncomingPeerId(peer);
      setIncomingSignal((n) => n + 1);
      invalidateConversations();
    } else {
      invalidateConversations();
    }
  };

  const { connected, sendMessage, markRead: socketMarkRead } = useChatSocket({
    onMessage: handleMessage,
    onRead: handleRead,
  });

  useEffect(() => {
    socketMarkReadRef.current = socketMarkRead;
  }, [socketMarkRead]);
  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  const openConversation = useCallback(
    (peerId: string) => {
      setActivePeerId(peerId);
      markConversationRead(peerId);
    },
    [markConversationRead],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      connected,
      conversations,
      unreadTotal,
      liveMessages,
      activePeerId,
      incomingSignal,
      lastIncomingPeerId,
      setActivePeerId,
      sendMessage,
      openConversation,
      markConversationRead,
    }),
    [
      connected,
      conversations,
      unreadTotal,
      liveMessages,
      activePeerId,
      incomingSignal,
      lastIncomingPeerId,
      sendMessage,
      openConversation,
      markConversationRead,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat debe usarse dentro de <ChatProvider>");
  }
  return ctx;
}
