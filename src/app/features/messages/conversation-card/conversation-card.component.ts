import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { ConversationWithDisplay } from '../messages-page/messages-page.component';
import {
  formatConversationTimestamp,
} from '../../../shared/utils/conversation.helpers';
import { truncateMessage } from '../../../shared/utils/message-format.helper';

@Component({
  selector: 'app-conversation-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './conversation-card.component.html',
  styleUrl: './conversation-card.component.scss',
})
export class ConversationCardComponent {
  @Input() conversation!: ConversationWithDisplay;
  @Input() isSelected = false;

  get icon(): string {
    return this.conversation.displayInfo.icon;
  }

  get title(): string {
    return this.conversation.displayInfo.title;
  }

  get subtitle(): string | undefined {
    return this.conversation.displayInfo.subtitle;
  }

  get lastMessagePreview(): string {
    if (!this.conversation.lastMessage) {
      return 'Aloita keskustelu';
    }
    return truncateMessage(this.conversation.lastMessage.content, 50);
  }

  get timestamp(): string {
    if (!this.conversation.lastMessage) {
      return formatConversationTimestamp(this.conversation.createdAt);
    }
    return formatConversationTimestamp(this.conversation.lastMessage.createdAt);
  }

  get hasUnread(): boolean {
    return this.conversation.hasUnread;
  }

  get unreadCount(): number {
    return this.conversation.unreadCount;
  }
}
