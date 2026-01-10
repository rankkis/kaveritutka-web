import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ConversationWithDisplay } from '../messages-page/messages-page.component';
import { formatConversationTimestamp } from '../../../shared/utils/conversation.helpers';
import { truncateMessage } from '../../../shared/utils/message-format.helper';

@Component({
  selector: 'app-conversation-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './conversation-card.component.html',
  styleUrl: './conversation-card.component.scss',
})
export class ConversationCardComponent implements OnChanges {
  @Input() conversation!: ConversationWithDisplay;
  @Input() isSelected = false;

  // Computed values (set in ngOnChanges to avoid getter performance issues)
  lastMessagePreview = '';
  timestamp = '';

  ngOnChanges(): void {
    this.lastMessagePreview = this.conversation.lastMessage
      ? truncateMessage(this.conversation.lastMessage.content, 80)
      : '';

    this.timestamp = formatConversationTimestamp(
      this.conversation.lastMessage?.createdAt ?? this.conversation.createdAt
    );
  }
}
