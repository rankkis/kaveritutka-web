import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { MessageService } from '../../../shared/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { Conversation } from '../../../shared/models/message.model';
import {
  sortConversations,
  getConversationDisplayInfo,
  ConversationDisplayInfo,
} from '../../../shared/utils/conversation.helpers';

import { ConversationCardComponent } from '../conversation-card/conversation-card.component';

export interface ConversationWithDisplay extends Conversation {
  displayInfo: ConversationDisplayInfo;
  hasUnread: boolean;
}

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ConversationCardComponent,
  ],
  templateUrl: './messages-page.component.html',
  styleUrl: './messages-page.component.scss',
})
export class MessagesPageComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private loading$ = new BehaviorSubject<boolean>(true);

  vm$ = combineLatest({
    conversations: this.messageService.conversations$,
    currentUser: this.userService.currentUser$,
    loading: this.loading$,
  }).pipe(
    map(({ conversations, currentUser, loading }) => {
      const currentUserId = currentUser?.id;

      // Sort and transform conversations
      const sortedConversations: ConversationWithDisplay[] = sortConversations(conversations).map(
        (conv) => ({
          ...conv,
          displayInfo: getConversationDisplayInfo(conv, currentUserId),
          hasUnread: conv.unreadCount > 0,
        })
      );

      return {
        conversations: sortedConversations,
        loading,
      };
    })
  );

  ngOnInit(): void {
    this.messageService.getConversations().subscribe({
      next: () => this.loading$.next(false),
      error: () => this.loading$.next(false),
    });
  }

  onConversationSelected(conversation: ConversationWithDisplay): void {
    // Navigate to detail page
    this.router.navigate(['/messages', conversation.id]);
  }
}
