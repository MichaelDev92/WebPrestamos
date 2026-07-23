export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  peerId: string;
  fullName: string;
  lastMessage: string;
  lastAt: string;
  lastFrom: string;
  lastRead: boolean;
  unread: number;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
}

export interface ConversationPage {
  data: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
