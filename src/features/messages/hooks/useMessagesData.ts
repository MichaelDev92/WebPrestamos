"use client";

import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "@/features/messages/api/messagesApi";
import type { Contact, Conversation, ConversationPage } from "@/features/messages/types";

export const MESSAGES_KEY = ["messages"] as const;

export function useConversationsQuery() {
  return useQuery<Conversation[]>({
    queryKey: [...MESSAGES_KEY, "conversations"],
    queryFn: () => messagesApi.conversations(),
    refetchOnWindowFocus: true,
  });
}

export function useContactsQuery(enabled: boolean) {
  return useQuery<Contact[]>({
    queryKey: [...MESSAGES_KEY, "contacts"],
    queryFn: () => messagesApi.contacts(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useConversationQuery(peerId: string | null) {
  return useQuery<ConversationPage>({
    queryKey: [...MESSAGES_KEY, "conversation", peerId],
    queryFn: () => messagesApi.conversation(peerId as string),
    enabled: Boolean(peerId),
  });
}
