import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap, of, Subject, timer } from 'rxjs';
import { takeUntil, switchMap as rxSwitchMap } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { MessageService } from '../../../shared/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { BreakpointService } from '../../../shared/services/breakpoint.service';
import { Conversation, Message } from '../../../shared/models/message.model';
import {
  sortConversations,
  getConversationDisplayInfo,
  ConversationDisplayInfo,
} from '../../../shared/utils/conversation.helpers';

import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { ConversationHeaderComponent } from '../conversation-header/conversation-header.component';
import { MessageThreadComponent } from '../message-thread/message-thread.component';
import { MessageInputComponent } from '../message-input/message-input.component';

export interface ConversationWithDisplay extends Conversation {
  displayInfo: ConversationDisplayInfo;
  hasUnread: boolean;
}

const MARK_AS_READ_DELAY_MS = 2000; // 2 seconds delay before marking as read

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ConversationListComponent,
    ConversationHeaderComponent,
    MessageThreadComponent,
    MessageInputComponent,
  ],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent implements OnInit, OnDestroy {
  private readonly breakpointService = inject(BreakpointService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private readonly destroy$ = new Subject<void>();
  private readonly markAsRead$ = new Subject<string>();

  private loading$ = new BehaviorSubject<boolean>(true);
  private selectedConversationId$ = new BehaviorSubject<string | null>(null);

  vm$ = combineLatest({
    conversations: this.messageService.conversations$,
    selectedConversationId: this.selectedConversationId$,
    currentUser: this.userService.currentUser$,
    breakpoint: this.breakpointService.breakpoint$,
    loading: this.loading$,
  }).pipe(
    switchMap(({ conversations, selectedConversationId, currentUser, breakpoint, loading }) => {
      const currentUserId = currentUser?.id;
      const isDesktop = breakpoint.gtS; // ≥960px

      // Sort and transform conversations
      const sortedConversations: ConversationWithDisplay[] = sortConversations(conversations).map(
        (conv) => ({
          ...conv,
          displayInfo: getConversationDisplayInfo(conv, currentUserId),
          hasUnread: conv.unreadCount > 0,
        })
      );

      const selectedConversation = sortedConversations.find(
        (c) => c.id === selectedConversationId
      );

      // Load messages for selected conversation
      if (selectedConversation) {
        return this.messageService.getMessages(selectedConversation.id).pipe(
          map((messages) => ({
            conversations: sortedConversations,
            selectedConversation,
            messages,
            isDesktop,
            currentUserId,
            loading,
          }))
        );
      }

      return of({
        conversations: sortedConversations,
        selectedConversation: null as ConversationWithDisplay | null,
        messages: [] as Message[],
        isDesktop,
        currentUserId,
        loading,
      });
    })
  );

  ngOnInit(): void {
    this.messageService.getConversations().subscribe({
      next: () => this.loading$.next(false),
      error: () => this.loading$.next(false),
    });

    // Set up delayed mark-as-read: waits 2 seconds after conversation selection
    // If user switches to another conversation before 2s, the previous one is cancelled
    this.markAsRead$
      .pipe(
        rxSwitchMap((conversationId) =>
          timer(MARK_AS_READ_DELAY_MS).pipe(
            rxSwitchMap(() => this.messageService.markAsRead(conversationId))
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onConversationSelected(conversation: ConversationWithDisplay, isDesktop: boolean): void {
    if (isDesktop) {
      // Desktop: update selection, show in split view
      this.selectedConversationId$.next(conversation.id);
      // Schedule mark as read after delay (if conversation has unread messages)
      if (conversation.hasUnread) {
        this.markAsRead$.next(conversation.id);
      }
    } else {
      // Mobile: navigate to detail page
      this.router.navigate(['/messages', conversation.id]);
    }
  }

  onMessageSent(conversationId: string, content: string): void {
    this.messageService.sendMessage(conversationId, { content }).subscribe();
  }
}
