import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, of } from 'rxjs';
import {
  Conversation,
  Message,
  CreateMessageDto,
  CreateConversationDto,
  ConversationContextType,
} from '../models/message.model';
import { environment } from '../../../environments/environment';

// Mock data for local development
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      { id: 'user-1', displayName: 'Maija M.' },
      { id: 'user-2', displayName: 'Pekka P.' },
    ],
    context: {
      type: 'friend_request',
      friendRequest: {
        id: 'fr-1',
        childName: 'Emma',
        childAge: 5,
      },
    },
    lastMessage: {
      content: 'Hei! Olisiko teillä aikaa leikkiä huomenna puistossa?',
      senderId: 'user-2',
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    },
    unreadCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'conv-2',
    participants: [
      { id: 'user-1', displayName: 'Maija M.' },
      { id: 'user-3', displayName: 'Anna K.' },
    ],
    context: {
      type: 'playtime',
      playtime: {
        id: 'pt-1',
        playgroundName: 'Kariniemen leikkipuisto',
        scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
        duration: 60,
      },
    },
    lastMessage: {
      content: 'Nähdään siellä! Meillä on mukana jalkapallo.',
      senderId: 'user-1',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'conv-3',
    participants: [
      { id: 'user-1', displayName: 'Maija M.' },
      { id: 'user-4', displayName: 'Mikko T.' },
    ],
    context: {
      type: 'general',
      topic: 'Leikkipuistot',
    },
    lastMessage: {
      content: 'Kiitos vinkistä! Käydään testaamassa ensi viikolla.',
      senderId: 'user-4',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    unreadCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'conv-4',
    participants: [
      { id: 'user-1', displayName: 'Maija M.' },
      { id: 'user-5', displayName: 'Liisa H.' },
    ],
    context: {
      type: 'friend_request',
      friendRequest: {
        id: 'fr-2',
        childName: 'Onni',
        childAge: 4,
      },
    },
    lastMessage: {
      content: 'Meillä olisi kiva tutustua! Lapset ovat saman ikäisiä.',
      senderId: 'user-5',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Pekka P.',
      content: 'Hei! Näin ilmoituksesi kaverihausta.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      senderId: 'user-1',
      senderName: 'Maija M.',
      content: 'Hei Pekka! Kiva kuulla. Minkä ikäinen teidän lapsi on?',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Pekka P.',
      content: 'Meidän Eemil on 5-vuotias, tykkää jalkapallosta!',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22),
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      senderId: 'user-2',
      senderName: 'Pekka P.',
      content: 'Hei! Olisiko teillä aikaa leikkiä huomenna puistossa?',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      senderId: 'user-3',
      senderName: 'Anna K.',
      content: 'Hei! Nähdäänkö Kariniemessä klo 14?',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      senderId: 'user-1',
      senderName: 'Maija M.',
      content: 'Sopii hyvin! Nähdään siellä.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      senderId: 'user-1',
      senderName: 'Maija M.',
      content: 'Nähdään siellä! Meillä on mukana jalkapallo.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      senderId: 'user-1',
      senderName: 'Maija M.',
      content: 'Oletko käynyt Launeen leikkipuistossa? Siellä on uudet kiipeilytelineet!',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      senderId: 'user-4',
      senderName: 'Mikko T.',
      content: 'Kiitos vinkistä! Käydään testaamassa ensi viikolla.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ],
  'conv-4': [
    {
      id: 'msg-4-1',
      conversationId: 'conv-4',
      senderId: 'user-5',
      senderName: 'Liisa H.',
      content: 'Meillä olisi kiva tutustua! Lapset ovat saman ikäisiä.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/conversations`;
  private readonly useMockData = !environment.production;

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  /**
   * Get all conversations for current user
   */
  getConversations(): Observable<Conversation[]> {
    if (this.useMockData) {
      return of(MOCK_CONVERSATIONS).pipe(
        tap((conversations) => {
          this.conversationsSubject.next(conversations);
          this.updateUnreadCount(conversations);
        })
      );
    }

    return this.http.get<Conversation[]>(this.apiUrl).pipe(
      map((conversations) => this.convertConversationDates(conversations)),
      tap((conversations) => {
        this.conversationsSubject.next(conversations);
        this.updateUnreadCount(conversations);
      })
    );
  }

  /**
   * Get single conversation by ID
   */
  getConversation(id: string): Observable<Conversation> {
    if (this.useMockData) {
      const conversation = MOCK_CONVERSATIONS.find((c) => c.id === id);
      return of(conversation!);
    }

    return this.http.get<Conversation>(`${this.apiUrl}/${id}`).pipe(
      map((conversation) => this.convertSingleConversationDates(conversation))
    );
  }

  /**
   * Create a new conversation
   */
  createConversation(dto: CreateConversationDto): Observable<Conversation> {
    if (this.useMockData) {
      return of(MOCK_CONVERSATIONS[0]);
    }

    const payload = {
      participant_id: dto.participantId,
      context_type: dto.contextType,
      context_id: dto.contextId,
      custom_topic: dto.customTopic,
    };
    return this.http.post<Conversation>(this.apiUrl, payload).pipe(
      map((conversation) => this.convertSingleConversationDates(conversation)),
      tap(() => this.refreshConversations())
    );
  }

  /**
   * Find or create conversation for a specific context
   */
  getOrCreateConversation(
    participantId: string,
    contextType?: ConversationContextType,
    contextId?: string
  ): Observable<Conversation> {
    if (this.useMockData) {
      return of(MOCK_CONVERSATIONS[0]);
    }

    // Try to find existing conversation first
    const payload = {
      participant_id: participantId,
      context_type: contextType,
      context_id: contextId,
    };
    return this.http.post<Conversation>(`${this.apiUrl}/find-or-create`, payload).pipe(
      map((conversation) => this.convertSingleConversationDates(conversation)),
      tap(() => this.refreshConversations())
    );
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string, _cursor?: string): Observable<Message[]> {
    if (this.useMockData) {
      const messages = MOCK_MESSAGES[conversationId] || [];
      return of(messages);
    }

    const url = _cursor
      ? `${this.apiUrl}/${conversationId}/messages?cursor=${_cursor}`
      : `${this.apiUrl}/${conversationId}/messages`;

    return this.http.get<Message[]>(url).pipe(
      map((messages) => this.convertMessageDates(messages))
    );
  }

  /**
   * Send a message in a conversation
   */
  sendMessage(conversationId: string, dto: CreateMessageDto): Observable<Message> {
    if (this.useMockData) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: 'user-1',
        senderName: 'Maija M.',
        content: dto.content,
        read: true,
        createdAt: new Date(),
      };
      return of(newMessage);
    }

    return this.http
      .post<Message>(`${this.apiUrl}/${conversationId}/messages`, dto)
      .pipe(
        map((message) => ({
          ...message,
          createdAt: new Date(message.createdAt),
        })),
        tap(() => this.refreshConversations())
      );
  }

  /**
   * Mark all messages in a conversation as read
   */
  markAsRead(conversationId: string): Observable<void> {
    if (this.useMockData) {
      // Update local mock data to clear unread count
      const conversations = this.conversationsSubject.getValue();
      const updatedConversations = conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      this.conversationsSubject.next(updatedConversations);
      return of(undefined);
    }

    return this.http
      .post<void>(`${this.apiUrl}/${conversationId}/read`, {})
      .pipe(tap(() => this.refreshConversations()));
  }

  /**
   * Get total unread message count
   */
  getUnreadCount(): Observable<number> {
    if (this.useMockData) {
      const total = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0);
      return of(total).pipe(tap((count) => this.unreadCountSubject.next(count)));
    }

    return this.http.get<{ count: number }>(`${environment.apiUrl}/messages/unread-count`).pipe(
      map((response) => response.count),
      tap((count) => this.unreadCountSubject.next(count))
    );
  }

  /**
   * Refresh conversations after mutations
   */
  refreshConversations(): void {
    if (this.useMockData) {
      this.conversationsSubject.next(MOCK_CONVERSATIONS);
      this.updateUnreadCount(MOCK_CONVERSATIONS);
      return;
    }

    this.http
      .get<Conversation[]>(this.apiUrl)
      .pipe(map((conversations) => this.convertConversationDates(conversations)))
      .subscribe({
        next: (conversations) => {
          this.conversationsSubject.next(conversations);
          this.updateUnreadCount(conversations);
        },
        error: (error) => console.error('Error loading conversations:', error),
      });
  }

  /**
   * Convert date strings to Date objects for conversations array
   */
  private convertConversationDates(conversations: Conversation[]): Conversation[] {
    return conversations.map((conv) => this.convertSingleConversationDates(conv));
  }

  /**
   * Convert date strings to Date objects for a single conversation
   */
  private convertSingleConversationDates(conversation: Conversation): Conversation {
    return {
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      lastMessage: conversation.lastMessage
        ? {
            ...conversation.lastMessage,
            createdAt: new Date(conversation.lastMessage.createdAt),
          }
        : undefined,
      context: conversation.context
        ? {
            ...conversation.context,
            playtime: conversation.context.playtime
              ? {
                  ...conversation.context.playtime,
                  scheduledTime: new Date(conversation.context.playtime.scheduledTime),
                }
              : undefined,
          }
        : undefined,
    };
  }

  /**
   * Convert date strings to Date objects for messages array
   */
  private convertMessageDates(messages: Message[]): Message[] {
    return messages.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
    }));
  }

  /**
   * Update unread count from conversations
   */
  private updateUnreadCount(conversations: Conversation[]): void {
    const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    this.unreadCountSubject.next(total);
  }
}
