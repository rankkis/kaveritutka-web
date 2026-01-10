import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap, of, filter } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MessageService } from '../../../shared/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { Conversation, Message } from '../../../shared/models/message.model';
import { getConversationDisplayInfo, ConversationDisplayInfo } from '../../../shared/utils/conversation.helpers';

import { ConversationHeaderComponent } from '../conversation-header/conversation-header.component';
import { MessageThreadComponent } from '../message-thread/message-thread.component';
import { MessageInputComponent } from '../message-input/message-input.component';

export interface ConversationDetailWithDisplay extends Conversation {
  displayInfo: ConversationDisplayInfo;
}

@Component({
  selector: 'app-conversation-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ConversationHeaderComponent,
    MessageThreadComponent,
    MessageInputComponent,
  ],
  templateUrl: './conversation-detail-page.component.html',
  styleUrl: './conversation-detail-page.component.scss',
})
export class ConversationDetailPageComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private loading$ = new BehaviorSubject<boolean>(true);
  private messages$ = new BehaviorSubject<Message[]>([]);

  vm$ = combineLatest({
    params: this.route.params,
    currentUser: this.userService.currentUser$,
    loading: this.loading$,
    messages: this.messages$,
  }).pipe(
    switchMap(({ params, currentUser, loading, messages }) => {
      const conversationId = params['conversationId'];
      const currentUserId = currentUser?.id;

      if (!conversationId) {
        return of({
          conversation: null,
          messages: [],
          currentUserId,
          loading: false,
        });
      }

      return this.messageService.getConversation(conversationId).pipe(
        map((conversation) => ({
          conversation: {
            ...conversation,
            displayInfo: getConversationDisplayInfo(conversation, currentUserId),
          } as ConversationDetailWithDisplay,
          messages,
          currentUserId,
          loading,
        }))
      );
    })
  );

  ngOnInit(): void {
    this.route.params
      .pipe(
        filter((params) => !!params['conversationId']),
        switchMap((params) => {
          this.loading$.next(true);
          const conversationId = params['conversationId'];

          // Mark as read and load messages
          this.messageService.markAsRead(conversationId).subscribe();

          return this.messageService.getMessages(conversationId);
        })
      )
      .subscribe({
        next: (messages) => {
          this.messages$.next(messages);
          this.loading$.next(false);
        },
        error: () => this.loading$.next(false),
      });
  }

  onBackToList(): void {
    this.router.navigate(['/messages']);
  }

  onMessageSent(conversationId: string, content: string): void {
    this.messageService.sendMessage(conversationId, { content }).subscribe({
      next: (message) => {
        // Add new message to the list
        const currentMessages = this.messages$.value;
        this.messages$.next([...currentMessages, message]);
      },
    });
  }
}
