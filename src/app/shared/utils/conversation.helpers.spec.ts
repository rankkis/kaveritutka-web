import {
  sortConversations,
  getConversationDisplayInfo,
  formatConversationTimestamp,
} from './conversation.helpers';
import { Conversation } from '../models/message.model';

describe('Conversation Helpers', () => {
  describe('sortConversations', () => {
    const createConversation = (
      id: string,
      unreadCount: number,
      lastMessageTime: Date | null,
      createdAt: Date
    ): Conversation => ({
      id,
      participants: [],
      unreadCount,
      lastMessage: lastMessageTime
        ? { content: 'test', senderId: '1', createdAt: lastMessageTime }
        : undefined,
      createdAt,
      updatedAt: createdAt,
    });

    it('should place unread conversations before read conversations', () => {
      const now = new Date();
      const conversations: Conversation[] = [
        createConversation('read1', 0, now, now),
        createConversation('unread1', 2, now, now),
        createConversation('read2', 0, now, now),
      ];

      const sorted = sortConversations(conversations);

      expect(sorted[0].id).toBe('unread1');
      expect(sorted[1].id).toBe('read1');
      expect(sorted[2].id).toBe('read2');
    });

    it('should sort unread conversations by most recent message first', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const twoHoursAgo = new Date(now.getTime() - 7200000);

      const conversations: Conversation[] = [
        createConversation('unread-old', 1, twoHoursAgo, twoHoursAgo),
        createConversation('unread-new', 1, now, now),
        createConversation('unread-mid', 1, oneHourAgo, oneHourAgo),
      ];

      const sorted = sortConversations(conversations);

      expect(sorted[0].id).toBe('unread-new');
      expect(sorted[1].id).toBe('unread-mid');
      expect(sorted[2].id).toBe('unread-old');
    });

    it('should sort read conversations by most recent message first', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const twoHoursAgo = new Date(now.getTime() - 7200000);

      const conversations: Conversation[] = [
        createConversation('read-old', 0, twoHoursAgo, twoHoursAgo),
        createConversation('read-new', 0, now, now),
        createConversation('read-mid', 0, oneHourAgo, oneHourAgo),
      ];

      const sorted = sortConversations(conversations);

      expect(sorted[0].id).toBe('read-new');
      expect(sorted[1].id).toBe('read-mid');
      expect(sorted[2].id).toBe('read-old');
    });

    it('should use createdAt when lastMessage is not available', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);

      const conversations: Conversation[] = [
        createConversation('old', 0, null, oneHourAgo),
        createConversation('new', 0, null, now),
      ];

      const sorted = sortConversations(conversations);

      expect(sorted[0].id).toBe('new');
      expect(sorted[1].id).toBe('old');
    });

    it('should return empty array for empty input', () => {
      expect(sortConversations([])).toEqual([]);
    });

    it('should handle mixed unread and read with proper ordering', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const twoHoursAgo = new Date(now.getTime() - 7200000);
      const threeHoursAgo = new Date(now.getTime() - 10800000);

      const conversations: Conversation[] = [
        createConversation('read-recent', 0, oneHourAgo, oneHourAgo),
        createConversation('unread-old', 3, threeHoursAgo, threeHoursAgo),
        createConversation('read-old', 0, twoHoursAgo, twoHoursAgo),
        createConversation('unread-recent', 1, now, now),
      ];

      const sorted = sortConversations(conversations);

      // Unread first (sorted by time)
      expect(sorted[0].id).toBe('unread-recent');
      expect(sorted[1].id).toBe('unread-old');
      // Then read (sorted by time)
      expect(sorted[2].id).toBe('read-recent');
      expect(sorted[3].id).toBe('read-old');
    });
  });

  describe('getConversationDisplayInfo', () => {
    const createBaseConversation = (): Conversation => ({
      id: '1',
      participants: [
        { id: 'user1', displayName: 'Maija M.' },
        { id: 'user2', displayName: 'Pekka P.' },
      ],
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should return playtime display info for playtime context', () => {
      const conversation: Conversation = {
        ...createBaseConversation(),
        context: {
          type: 'playtime',
          playtime: {
            id: 'pt1',
            playgroundName: 'Kariniemen leikkipuisto',
            scheduledTime: new Date(),
            duration: 60,
          },
        },
      };

      const result = getConversationDisplayInfo(conversation, 'user1');

      expect(result.icon).toBe('place');
      expect(result.title).toContain('Kariniemen leikkipuisto');
      expect(result.subtitle).toBe('Pekka P.');
    });

    it('should return friend request display info for friend_request context', () => {
      const conversation: Conversation = {
        ...createBaseConversation(),
        context: {
          type: 'friend_request',
          friendRequest: {
            id: 'fr1',
            childName: 'Matti',
            childAge: 5,
          },
        },
      };

      const result = getConversationDisplayInfo(conversation, 'user1');

      expect(result.icon).toBe('person_search');
      expect(result.title).toBe('Kaverihausta: Matti, 5v');
      expect(result.subtitle).toBe('Pekka P.');
    });

    it('should return general display info for general context', () => {
      const conversation: Conversation = {
        ...createBaseConversation(),
        context: {
          type: 'general',
          topic: 'Leikkipuistot',
        },
      };

      const result = getConversationDisplayInfo(conversation, 'user1');

      expect(result.icon).toBe('person');
      expect(result.title).toBe('Pekka P.');
      expect(result.subtitle).toBe('Leikkipuistot');
    });

    it('should return other participant name for conversations without context', () => {
      const conversation = createBaseConversation();

      const result = getConversationDisplayInfo(conversation, 'user1');

      expect(result.icon).toBe('person');
      expect(result.title).toBe('Pekka P.');
      expect(result.subtitle).toBeUndefined();
    });

    it('should return "Tuntematon" when other participant is not found', () => {
      const conversation: Conversation = {
        ...createBaseConversation(),
        participants: [{ id: 'user1', displayName: 'Maija M.' }],
      };

      const result = getConversationDisplayInfo(conversation, 'user1');

      expect(result.title).toBe('Tuntematon');
    });

    it('should handle undefined currentUserId', () => {
      const conversation = createBaseConversation();

      const result = getConversationDisplayInfo(conversation, undefined);

      // Should return first participant since none match undefined
      expect(result.title).toBe('Maija M.');
    });
  });

  describe('formatConversationTimestamp', () => {
    it('should return "Nyt" for dates less than 1 minute ago', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30000);

      expect(formatConversationTimestamp(thirtySecondsAgo)).toBe('Nyt');
    });

    it('should return minutes for dates less than 60 minutes ago', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

      expect(formatConversationTimestamp(fiveMinutesAgo)).toBe('5 min');
    });

    it('should return "Eilen" for yesterday', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);

      expect(formatConversationTimestamp(yesterday)).toBe('Eilen');
    });

    it('should return time for today but more than 60 minutes ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 3600000);

      // Only test if it's still the same day
      if (twoHoursAgo.toDateString() === now.toDateString()) {
        const result = formatConversationTimestamp(twoHoursAgo);
        // Should be in HH:MM format
        expect(result).toMatch(/^\d{1,2}[.:]\d{2}$/);
      }
    });

    it('should return weekday for dates within the last 7 days', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(12, 0, 0, 0);

      const result = formatConversationTimestamp(threeDaysAgo);
      // Should be a short weekday name in Finnish (e.g., "ma", "ti", "ke", etc.)
      expect(result.length).toBeLessThanOrEqual(4);
    });

    it('should return date for dates older than 7 days', () => {
      const now = new Date();
      const tenDaysAgo = new Date(now);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const result = formatConversationTimestamp(tenDaysAgo);
      // Should be in D.M. format
      expect(result).toMatch(/^\d{1,2}\.\d{1,2}\.$/);
    });

    it('should handle string dates', () => {
      const now = new Date();
      const dateString = now.toISOString();

      // Should not throw and should return "Nyt"
      expect(() => formatConversationTimestamp(dateString as unknown as Date)).not.toThrow();
    });
  });
});
