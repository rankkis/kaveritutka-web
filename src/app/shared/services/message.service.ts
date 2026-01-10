import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import {
  Conversation,
  Message,
  CreateMessageDto,
  CreateConversationDto,
  ConversationContextType,
} from '../models/message.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/conversations`;

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Initial load is triggered when user is authenticated
  }

  /**
   * Get all conversations for current user
   */
  getConversations(): Observable<Conversation[]> {
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
    return this.http.get<Conversation>(`${this.apiUrl}/${id}`).pipe(
      map((conversation) => this.convertSingleConversationDates(conversation))
    );
  }

  /**
   * Create a new conversation
   */
  createConversation(dto: CreateConversationDto): Observable<Conversation> {
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
  getMessages(conversationId: string, cursor?: string): Observable<Message[]> {
    const url = cursor
      ? `${this.apiUrl}/${conversationId}/messages?cursor=${cursor}`
      : `${this.apiUrl}/${conversationId}/messages`;

    return this.http.get<Message[]>(url).pipe(
      map((messages) => this.convertMessageDates(messages))
    );
  }

  /**
   * Send a message in a conversation
   */
  sendMessage(conversationId: string, dto: CreateMessageDto): Observable<Message> {
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
    return this.http
      .post<void>(`${this.apiUrl}/${conversationId}/read`, {})
      .pipe(tap(() => this.refreshConversations()));
  }

  /**
   * Get total unread message count
   */
  getUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/messages/unread-count`).pipe(
      map((response) => response.count),
      tap((count) => this.unreadCountSubject.next(count))
    );
  }

  /**
   * Refresh conversations after mutations
   */
  refreshConversations(): void {
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
