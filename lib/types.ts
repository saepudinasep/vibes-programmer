export interface ChatUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface ConversationSummary {
  id: string;
  other: (ChatUser & { isOnline: boolean }) | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
}
