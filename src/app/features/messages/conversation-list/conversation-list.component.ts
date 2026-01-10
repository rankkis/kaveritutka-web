import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConversationCardComponent } from '../conversation-card/conversation-card.component';
import { ConversationWithDisplay } from '../messages-page/messages-page.component';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, ConversationCardComponent],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss',
})
export class ConversationListComponent {
  @Input() conversations: ConversationWithDisplay[] = [];
  @Input() selectedConversationId: string | null | undefined = null;

  @Output() conversationSelected = new EventEmitter<ConversationWithDisplay>();

  onSelectConversation(conversation: ConversationWithDisplay): void {
    this.conversationSelected.emit(conversation);
  }
}
