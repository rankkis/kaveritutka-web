import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Message } from '../../../shared/models/message.model';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [CommonModule, MessageBubbleComponent],
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.scss',
})
export class MessageThreadComponent implements OnChanges, AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() currentUserId: string | undefined;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;

  private shouldScrollToBottom = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      this.shouldScrollToBottom = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  trackByMessageId(_index: number, message: Message): string {
    return message.id;
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
}
