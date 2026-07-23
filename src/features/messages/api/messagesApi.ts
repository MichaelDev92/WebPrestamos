import { httpClient } from "@/shared/lib/http/client";
import type { ChatMessage, Contact, Conversation, ConversationPage } from "@/features/messages/types";

const BASE = "/messages";

interface RawMessage {
  _id: string;
  from: string;
  to: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface RawContact {
  _id: string;
  fullName: string;
  email: string;
}

function toChatMessage(raw: RawMessage): ChatMessage {
  return {
    id: String(raw._id),
    from: String(raw.from),
    to: String(raw.to),
    content: raw.content,
    read: raw.read,
    createdAt: raw.createdAt,
  };
}

export const messagesApi = {
  conversations: async (): Promise<Conversation[]> => {
    const response = await httpClient.get<Conversation[]>(`${BASE}/conversations`);
    return response.data;
  },

  contacts: async (): Promise<Contact[]> => {
    const response = await httpClient.get<RawContact[]>(`${BASE}/contacts`);
    return response.data.map((contact) => ({
      id: String(contact._id),
      fullName: contact.fullName,
      email: contact.email,
    }));
  },

  conversation: async (peerId: string, page = 1, limit = 30): Promise<ConversationPage> => {
    const response = await httpClient.get<{
      data: RawMessage[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${BASE}/${peerId}`, { params: { page, limit } });
    return {
      ...response.data,
      data: response.data.data.map(toChatMessage),
    };
  },

  markRead: async (peerId: string): Promise<void> => {
    await httpClient.post(`${BASE}/${peerId}/read`);
  },
};
