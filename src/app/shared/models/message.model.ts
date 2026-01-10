export type ConversationContextType = 'playtime' | 'friend_request' | 'general';

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  context?: ConversationContext;
  lastMessage?: LastMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  displayName: string;
}

export interface ConversationContext {
  type: ConversationContextType;

  // Populated based on type
  playtime?: {
    id: string;
    playgroundName: string;
    scheduledTime: Date;
    duration: number;
  };
  friendRequest?: {
    id: string;
    childName: string;
    childAge: number;
  };
  topic?: string; // For general type with custom topic
}

export interface LastMessage {
  content: string;
  senderId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface CreateMessageDto {
  content: string;
}

export interface CreateConversationDto {
  participantId: string;
  contextType?: ConversationContextType;
  contextId?: string; // Required for 'playtime' or 'friend_request'
  customTopic?: string; // Optional for 'general' type
}
