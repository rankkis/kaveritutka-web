import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
  @Output() messageSent = new EventEmitter<string>();

  isSending = false;
  messageText = '';

  get canSend(): boolean {
    return this.messageText.trim().length > 0 && !this.isSending;
  }

  sendMessage(): void {
    if (!this.canSend) return;

    const content = this.messageText.trim();
    this.isSending = true;
    this.messageSent.emit(content);

    // Reset state (parent will handle actual sending)
    this.messageText = '';
    this.isSending = false;
  }
}
