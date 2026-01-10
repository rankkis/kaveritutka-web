import { Conversation } from '../models/message.model';

export interface ConversationDisplayInfo {
  title: string;
  subtitle?: string;
  icon: 'place' | 'person_search' | 'person';
}

/**
 * Sort conversations WhatsApp-style:
 * 1. Unread conversations first (sorted by most recent message)
 * 2. Read conversations second (sorted by most recent message)
 */
export function sortConversations(conversations: Conversation[]): Conversation[] {
  const unread = conversations.filter((c) => c.unreadCount > 0);
  const read = conversations.filter((c) => c.unreadCount === 0);

  const sortByTime = (a: Conversation, b: Conversation) => {
    const timeA = a.lastMessage?.createdAt ?? a.createdAt;
    const timeB = b.lastMessage?.createdAt ?? b.createdAt;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  };

  return [...unread.sort(sortByTime), ...read.sort(sortByTime)];
}

export function getConversationDisplayInfo(
  conversation: Conversation,
  currentUserId: string | undefined
): ConversationDisplayInfo {
  const otherParticipant = conversation.participants.find((p) => p.id !== currentUserId);
  const otherName = otherParticipant?.displayName || 'Tuntematon';

  if (conversation.context?.type === 'playtime' && conversation.context.playtime) {
    const pt = conversation.context.playtime;
    return {
      title: `${pt.playgroundName} - ${formatPlaytimeDate(pt.scheduledTime)}`,
      subtitle: otherName,
      icon: 'place',
    };
  }

  if (conversation.context?.type === 'friend_request' && conversation.context.friendRequest) {
    const fr = conversation.context.friendRequest;
    return {
      title: `Kaverihausta: ${fr.childName}, ${fr.childAge}v`,
      subtitle: otherName,
      icon: 'person_search',
    };
  }

  return {
    title: otherName,
    subtitle: conversation.context?.topic,
    icon: 'person',
  };
}

function formatPlaytimeDate(date: Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();

  const time = dateObj.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Tänään ${time}`;
  if (isTomorrow) return `Huomenna ${time}`;
  return dateObj.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' }) + ` ${time}`;
}

/**
 * Format timestamp for conversation list display
 */
export function formatConversationTimestamp(date: Date): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Nyt';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24 && dateObj.toDateString() === now.toDateString()) {
    return dateObj.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Eilen';
  }

  if (diffDays < 7) {
    return dateObj.toLocaleDateString('fi-FI', { weekday: 'short' });
  }

  return dateObj.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' });
}
