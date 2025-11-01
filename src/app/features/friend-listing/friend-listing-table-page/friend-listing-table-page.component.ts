import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  FriendListingService,
  FriendListing
} from '../../../shared';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { FriendListingCardComponent } from '../friend-listing-card/friend-listing-card.component';
import { FriendListingCreateDialogComponent } from '../friend-listing-create-dialog/friend-listing-create-dialog.component';
import { SendMessageDialogComponent } from '../send-message-dialog/send-message-dialog.component';
import { ProposePlaytimeDialogComponent } from '../propose-playtime-dialog/propose-playtime-dialog.component';

@Component({
  selector: 'app-friend-listing-table-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FriendListingCardComponent
  ],
  templateUrl: './friend-listing-table-page.component.html',
  styleUrls: ['./friend-listing-table-page.component.scss']
})
export class FriendListingTablePageComponent implements OnInit, OnDestroy {
  listings: FriendListing[] = [];
  filteredListings: FriendListing[] = [];
  isLoading = true;
  currentUserId: string | null = null;

  // Filters
  searchText = '';
  selectedStatus: 'all' | 'active' | 'closed' = 'active';
  selectedAge: number | null = null;

  private listingsSubscription?: Subscription;

  ageOptions = [0, 1, 2, 3, 4, 5, 6, 7];

  constructor(
    private friendListingService: FriendListingService,
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user from session
    const session = this.supabaseService.getSession();
    this.currentUserId = session?.user?.id || null;

    // Subscribe to listings
    this.listingsSubscription = this.friendListingService.getAllListings().subscribe(listings => {
      this.listings = listings;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.listingsSubscription?.unsubscribe();
  }

  applyFilters(): void {
    let filtered = [...this.listings];

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(l => l.status === this.selectedStatus);
    }

    // Age filter
    if (this.selectedAge !== null) {
      filtered = filtered.filter(l => l.childAge === this.selectedAge);
    }

    // Text search
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(l =>
        l.childName.toLowerCase().includes(search) ||
        l.parentName.toLowerCase().includes(search) ||
        l.description.toLowerCase().includes(search) ||
        l.city.toLowerCase().includes(search) ||
        l.interests.some(i => i.toLowerCase().includes(search))
      );
    }

    this.filteredListings = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onAgeChange(): void {
    this.applyFilters();
  }

  onCreateListing(): void {
    // Get current location (default to Lahti center)
    const dialogRef = this.dialog.open(FriendListingCreateDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {
        latitude: 60.9823,
        longitude: 25.6551,
        city: 'Lahti'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Listing created successfully
      }
    });
  }

  onSendMessage(listing: FriendListing): void {
    this.dialog.open(SendMessageDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: { listing }
    });
  }

  onProposePlaytime(listing: FriendListing): void {
    this.dialog.open(ProposePlaytimeDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { listing }
    });
  }

  onEditListing(_listing: FriendListing): void {
    // TODO: Implement edit functionality
    alert('Muokkaus-toiminto tulossa pian!');
  }

  onDeleteListing(listing: FriendListing): void {
    this.friendListingService.deleteFriendListing(listing.id).pipe(
      take(1)
    ).subscribe({
      next: () => {
        // Listing deleted successfully
      },
      error: (error) => {
        console.error('Error deleting listing:', error);
        alert('Ilmoituksen poisto epäonnistui. Yritä uudelleen.');
      }
    });
  }

  onCloseListing(listing: FriendListing): void {
    this.friendListingService.closeFriendListing(listing.id).pipe(
      take(1)
    ).subscribe({
      next: () => {
        // Listing closed successfully
      },
      error: (error) => {
        console.error('Error closing listing:', error);
        alert('Ilmoituksen sulkeminen epäonnistui. Yritä uudelleen.');
      }
    });
  }

  isOwner(listing: FriendListing): boolean {
    return this.currentUserId !== null && listing.user_id === this.currentUserId;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
