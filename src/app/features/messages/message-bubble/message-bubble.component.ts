import { Component, Input, OnChanges } from '@angular/core';
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
export class MessageBubbleComponent implements OnChanges {
  @Input() message!: Message;
  @Input() isOwn = false;

  // Computed values (set in ngOnChanges to avoid getter performance issues)
  formattedContent = '';
  timestamp = '';

  ngOnChanges(): void {
    this.formattedContent = formatMessageContent(this.message.content);

    const date =
      this.message.createdAt instanceof Date
        ? this.message.createdAt
        : new Date(this.message.createdAt);
    this.timestamp = date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
  }
}
