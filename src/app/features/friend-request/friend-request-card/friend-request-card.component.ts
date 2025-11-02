import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { FriendRequest } from '../../../shared';

@Component({
  selector: 'app-friend-request-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './friend-request-card.component.html',
  styleUrls: ['./friend-request-card.component.scss']
})
export class FriendRequestCardComponent {
  @Input() request!: FriendRequest;
  @Input() isOwner = false;
  @Output() sendMessage = new EventEmitter<FriendRequest>();
  @Output() proposePlaytime = new EventEmitter<FriendRequest>();
  @Output() edit = new EventEmitter<FriendRequest>();
  @Output() delete = new EventEmitter<FriendRequest>();
  @Output() close = new EventEmitter<FriendRequest>();

  showFullDescription = false;

  get isLongDescription(): boolean {
    return this.request.description.length > 150;
  }

  get displayDescription(): string {
    if (this.showFullDescription || !this.isLongDescription) {
      return this.request.description;
    }
    return this.request.description.substring(0, 150) + '...';
  }

  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }

  onSendMessage(): void {
    this.sendMessage.emit(this.request);
  }

  onProposePlaytime(): void {
    this.proposePlaytime.emit(this.request);
  }

  onEdit(): void {
    this.edit.emit(this.request);
  }

  onDelete(): void {
    if (confirm('Haluatko varmasti poistaa tämän ilmoituksen?')) {
      this.delete.emit(this.request);
    }
  }

  onClose(): void {
    if (confirm('Haluatko merkitä ilmoituksen ratkaistuksi?')) {
      this.close.emit(this.request);
    }
  }

  getRelativeTime(): string {
    const now = new Date();
    const created = new Date(this.request.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minuuttia sitten`;
    } else if (diffHours < 24) {
      return `${diffHours} tuntia sitten`;
    } else if (diffDays < 7) {
      return `${diffDays} päivää sitten`;
    } else {
      return created.toLocaleDateString('fi-FI');
    }
  }
}
