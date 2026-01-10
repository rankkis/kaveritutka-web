import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Conversation } from '../../../shared/models/message.model';
import { ConversationDisplayInfo } from '../../../shared/utils/conversation.helpers';

export interface ConversationWithDisplayInfo extends Conversation {
  displayInfo: ConversationDisplayInfo;
}

@Component({
  selector: 'app-conversation-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './conversation-header.component.html',
  styleUrl: './conversation-header.component.scss',
})
export class ConversationHeaderComponent {
  @Input() conversation!: ConversationWithDisplayInfo;
  @Input() showBackButton = false;

  @Output() backClicked = new EventEmitter<void>();

  get icon(): string {
    return this.conversation.displayInfo.icon;
  }

  get title(): string {
    return this.conversation.displayInfo.title;
  }

  get subtitle(): string | undefined {
    return this.conversation.displayInfo.subtitle;
  }

  onBack(): void {
    this.backClicked.emit();
  }
}
