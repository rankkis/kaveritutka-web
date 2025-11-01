import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import {
  FriendListing,
  CreateFriendListingDto,
  SendMessageDto,
  ProposePlaytimeDto,
  FriendListingResponse
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendListingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/friend-listings`;

  private listingsSubject = new BehaviorSubject<FriendListing[]>([]);

  constructor() {
    // Load initial listings for current location
    this.refreshListings();
  }

  /**
   * Refresh all listings (used internally after mutations)
   */
  private refreshListings(): void {
    this.http.get<FriendListing[]>(this.apiUrl).pipe(
      map(listings => this.convertListingDates(listings))
    ).subscribe({
      next: (listings) => this.listingsSubject.next(listings),
      error: (error) => console.error('Error loading friend listings:', error)
    });
  }

  /**
   * Convert date strings to Date objects
   */
  private convertListingDates(listings: FriendListing[]): FriendListing[] {
    return listings.map(listing => ({
      ...listing,
      createdAt: new Date(listing.createdAt),
      updatedAt: new Date(listing.updatedAt)
    }));
  }

  /**
   * Get all friend listings as observable
   */
  getAllListings(): Observable<FriendListing[]> {
    return this.listingsSubject.asObservable();
  }

  /**
   * Get friend listings by location with optional radius (in kilometers)
   */
  getFriendListingsByLocation(
    lat: number,
    lng: number,
    radius: number = 50
  ): Observable<FriendListing[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return this.http.get<FriendListing[]>(`${this.apiUrl}/location`, { params }).pipe(
      map(listings => this.convertListingDates(listings))
    );
  }

  /**
   * Get friend listings created by the logged-in user
   */
  getUserFriendListings(): Observable<FriendListing[]> {
    return this.http.get<FriendListing[]>(`${this.apiUrl}/my-listings`).pipe(
      map(listings => this.convertListingDates(listings))
    );
  }

  /**
   * Create a new friend listing
   */
  createFriendListing(dto: CreateFriendListingDto): Observable<FriendListing> {
    return this.http.post<FriendListing>(this.apiUrl, dto).pipe(
      map(listing => ({
        ...listing,
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt)
      })),
      tap(() => this.refreshListings())
    );
  }

  /**
   * Update an existing friend listing
   */
  updateFriendListing(
    id: string,
    listing: Partial<CreateFriendListingDto>
  ): Observable<FriendListing> {
    return this.http.patch<FriendListing>(`${this.apiUrl}/${id}`, listing).pipe(
      map(listing => ({
        ...listing,
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt)
      })),
      tap(() => this.refreshListings())
    );
  }

  /**
   * Delete a friend listing
   */
  deleteFriendListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshListings())
    );
  }

  /**
   * Close a friend listing (mark as resolved)
   */
  closeFriendListing(id: string): Observable<FriendListing> {
    return this.http.patch<FriendListing>(`${this.apiUrl}/${id}/close`, {}).pipe(
      map(listing => ({
        ...listing,
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt)
      })),
      tap(() => this.refreshListings())
    );
  }

  /**
   * Send a contact message to listing creator
   */
  sendMessage(dto: SendMessageDto): Observable<FriendListingResponse> {
    return this.http.post<FriendListingResponse>(
      `${this.apiUrl}/${dto.listingId}/message`,
      { message: dto.message }
    ).pipe(
      map(response => ({
        ...response,
        createdAt: response.createdAt ? new Date(response.createdAt) : undefined
      }))
    );
  }

  /**
   * Propose a playtime to listing creator
   */
  proposePlaytime(dto: ProposePlaytimeDto): Observable<FriendListingResponse> {
    // Convert Date to ISO string if needed
    const payload = {
      message: dto.message,
      playtimeDetails: {
        ...dto.playtimeDetails,
        scheduledTime: dto.playtimeDetails.scheduledTime instanceof Date
          ? dto.playtimeDetails.scheduledTime.toISOString()
          : dto.playtimeDetails.scheduledTime
      }
    };

    return this.http.post<FriendListingResponse>(
      `${this.apiUrl}/${dto.listingId}/propose-playtime`,
      payload
    ).pipe(
      map(response => ({
        ...response,
        createdAt: response.createdAt ? new Date(response.createdAt) : undefined,
        playtimeDetails: response.playtimeDetails ? {
          ...response.playtimeDetails,
          scheduledTime: new Date(response.playtimeDetails.scheduledTime)
        } : undefined
      }))
    );
  }

  /**
   * Get a single friend listing by ID
   */
  getFriendListingById(id: string): Observable<FriendListing> {
    return this.http.get<FriendListing>(`${this.apiUrl}/${id}`).pipe(
      map(listing => ({
        ...listing,
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt)
      }))
    );
  }
}
