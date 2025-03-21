export interface ChatUser {
  id: string;
  name: string;
  role: 'admin' | 'technician' | 'user';
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: ChatUser;
  timestamp: Date;
  attachments?: ChatAttachment[];
  replyTo?: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: Date;
}