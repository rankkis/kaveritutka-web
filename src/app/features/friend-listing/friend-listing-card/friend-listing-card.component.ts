import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { FriendListing } from '../../../shared';

@Component({
  selector: 'app-friend-listing-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './friend-listing-card.component.html',
  styleUrls: ['./friend-listing-card.component.scss']
})
export class FriendListingCardComponent {
  @Input() listing!: FriendListing;
  @Input() isOwner = false;
  @Output() sendMessage = new EventEmitter<FriendListing>();
  @Output() proposePlaytime = new EventEmitter<FriendListing>();
  @Output() edit = new EventEmitter<FriendListing>();
  @Output() delete = new EventEmitter<FriendListing>();
  @Output() close = new EventEmitter<FriendListing>();

  showFullDescription = false;

  get isLongDescription(): boolean {
    return this.listing.description.length > 150;
  }

  get displayDescription(): string {
    if (this.showFullDescription || !this.isLongDescription) {
      return this.listing.description;
    }
    return this.listing.description.substring(0, 150) + '...';
  }

  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }

  onSendMessage(): void {
    this.sendMessage.emit(this.listing);
  }

  onProposePlaytime(): void {
    this.proposePlaytime.emit(this.listing);
  }

  onEdit(): void {
    this.edit.emit(this.listing);
  }

  onDelete(): void {
    if (confirm('Haluatko varmasti poistaa tämän ilmoituksen?')) {
      this.delete.emit(this.listing);
    }
  }

  onClose(): void {
    if (confirm('Haluatko merkitä ilmoituksen ratkaistuksi?')) {
      this.close.emit(this.listing);
    }
  }

  getRelativeTime(): string {
    const now = new Date();
    const created = new Date(this.listing.createdAt);
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
