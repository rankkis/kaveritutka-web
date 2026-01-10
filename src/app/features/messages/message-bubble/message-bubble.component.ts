import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Message } from '../../../shared/models/message.model';
import { formatMessageContent } from '../../../shared/utils/message-format.helper';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
})
export class MessageBubbleComponent {
  @Input() message!: Message;
  @Input() isOwn = false;

  get formattedContent(): string {
    return formatMessageContent(this.message.content);
  }

  get timestamp(): string {
    const date = this.message.createdAt instanceof Date
      ? this.message.createdAt
      : new Date(this.message.createdAt);
    return date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
  }
}
