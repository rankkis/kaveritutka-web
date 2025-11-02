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
  FriendRequestService,
  FriendRequest
} from '../../../shared';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { FriendRequestCardComponent } from '../friend-request-card/friend-request-card.component';
import { FriendRequestCreateDialogComponent } from '../friend-request-create-dialog/friend-request-create-dialog.component';
import { SendMessageDialogComponent } from '../send-message-dialog/send-message-dialog.component';
import { ProposePlaytimeDialogComponent } from '../propose-playtime-dialog/propose-playtime-dialog.component';

@Component({
  selector: 'app-friend-request-table-page',
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
    FriendRequestCardComponent
  ],
  templateUrl: './friend-request-table-page.component.html',
  styleUrls: ['./friend-request-table-page.component.scss']
})
export class FriendRequestTablePageComponent implements OnInit, OnDestroy {
  requests: FriendRequest[] = [];
  filteredRequests: FriendRequest[] = [];
  isLoading = true;
  currentUserId: string | null = null;

  // Filters
  searchText = '';
  selectedStatus: 'all' | 'active' | 'closed' = 'active';
  selectedAge: number | null = null;

  private requestsSubscription?: Subscription;

  ageOptions = [0, 1, 2, 3, 4, 5, 6, 7];

  constructor(
    private friendRequestService: FriendRequestService,
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user from session
    const session = this.supabaseService.getSession();
    this.currentUserId = session?.user?.id || null;

    // Subscribe to requests
    this.requestsSubscription = this.friendRequestService.getAllRequests().subscribe(requests => {
      this.requests = requests;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.requestsSubscription?.unsubscribe();
  }

  applyFilters(): void {
    let filtered = [...this.requests];

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

    this.filteredRequests = filtered;
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

  onCreateRequest(): void {
    // Get current location (default to Lahti center)
    const dialogRef = this.dialog.open(FriendRequestCreateDialogComponent, {
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
        // Request created successfully
      }
    });
  }

  onSendMessage(request: FriendRequest): void {
    this.dialog.open(SendMessageDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: { request }
    });
  }

  onProposePlaytime(request: FriendRequest): void {
    this.dialog.open(ProposePlaytimeDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { request }
    });
  }

  onEditRequest(_request: FriendRequest): void {
    // TODO: Implement edit functionality
    alert('Muokkaus-toiminto tulossa pian!');
  }

  onDeleteRequest(request: FriendRequest): void {
    this.friendRequestService.deleteFriendRequest(request.id).pipe(
      take(1)
    ).subscribe({
      next: () => {
        // Request deleted successfully
      },
      error: (error) => {
        console.error('Error deleting request:', error);
        alert('Ilmoituksen poisto epäonnistui. Yritä uudelleen.');
      }
    });
  }

  onCloseRequest(request: FriendRequest): void {
    this.friendRequestService.closeFriendRequest(request.id).pipe(
      take(1)
    ).subscribe({
      next: () => {
        // Request closed successfully
      },
      error: (error) => {
        console.error('Error closing request:', error);
        alert('Ilmoituksen sulkeminen epäonnistui. Yritä uudelleen.');
      }
    });
  }

  isOwner(request: FriendRequest): boolean {
    return this.currentUserId !== null && request.user_id === this.currentUserId;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
