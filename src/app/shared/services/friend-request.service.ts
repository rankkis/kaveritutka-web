import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import {
  FriendRequest,
  CreateFriendRequestDto,
  SendMessageDto,
  ProposePlaytimeDto,
  FriendRequestResponse
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendRequestService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/friend-requests`;

  private requestsSubject = new BehaviorSubject<FriendRequest[]>([]);

  constructor() {
    // Load initial requests for current location
    this.refreshRequests();
  }

  /**
   * Refresh all requests (used internally after mutations)
   */
  private refreshRequests(): void {
    this.http.get<FriendRequest[]>(this.apiUrl).pipe(
      map(requests => this.convertRequestDates(requests))
    ).subscribe({
      next: (requests) => this.requestsSubject.next(requests),
      error: (error) => console.error('Error loading friend requests:', error)
    });
  }

  /**
   * Convert date strings to Date objects
   */
  private convertRequestDates(requests: FriendRequest[]): FriendRequest[] {
    return requests.map(request => ({
      ...request,
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt)
    }));
  }

  /**
   * Get all friend requests as observable
   */
  getAllRequests(): Observable<FriendRequest[]> {
    return this.requestsSubject.asObservable();
  }

  /**
   * Get friend requests by location with optional radius (in kilometers)
   */
  getFriendRequestsByLocation(
    lat: number,
    lng: number,
    radius: number = 50
  ): Observable<FriendRequest[]> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radius.toString());

    return this.http.get<FriendRequest[]>(`${this.apiUrl}/location`, { params }).pipe(
      map(requests => this.convertRequestDates(requests))
    );
  }

  /**
   * Get friend requests created by the logged-in user
   */
  getUserFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/my`).pipe(
      map(requests => this.convertRequestDates(requests))
    );
  }

  /**
   * Create a new friend request
   */
  createFriendRequest(dto: CreateFriendRequestDto): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(this.apiUrl, dto).pipe(
      map(request => ({
        ...request,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt)
      })),
      tap(() => this.refreshRequests())
    );
  }

  /**
   * Update an existing friend request
   */
  updateFriendRequest(
    id: string,
    request: Partial<CreateFriendRequestDto>
  ): Observable<FriendRequest> {
    return this.http.patch<FriendRequest>(`${this.apiUrl}/${id}`, request).pipe(
      map(request => ({
        ...request,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt)
      })),
      tap(() => this.refreshRequests())
    );
  }

  /**
   * Delete a friend request
   */
  deleteFriendRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshRequests())
    );
  }

  /**
   * Close a friend request (mark as resolved)
   */
  closeFriendRequest(id: string): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(`${this.apiUrl}/${id}/close`, {}).pipe(
      map(request => ({
        ...request,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt)
      })),
      tap(() => this.refreshRequests())
    );
  }

  /**
   * Send a contact message to request creator
   */
  sendMessage(dto: SendMessageDto): Observable<FriendRequestResponse> {
    return this.http.post<FriendRequestResponse>(
      `${this.apiUrl}/${dto.requestId}/contact`,
      { message: dto.message }
    ).pipe(
      map(response => ({
        ...response,
        createdAt: response.createdAt ? new Date(response.createdAt) : undefined
      }))
    );
  }

  /**
   * Propose a playtime to request creator
   */
  proposePlaytime(dto: ProposePlaytimeDto): Observable<FriendRequestResponse> {
    // Backend expects responseType field
    const payload = {
      responseType: 'playtime_proposal',
      message: dto.message,
      playtimeDetails: dto.playtimeDetails
    };

    return this.http.post<FriendRequestResponse>(
      `${this.apiUrl}/${dto.requestId}/propose-playtime`,
      payload
    ).pipe(
      map(response => ({
        ...response,
        createdAt: response.createdAt ? new Date(response.createdAt) : undefined
      }))
    );
  }

  /**
   * Get a single friend request by ID
   */
  getFriendRequestById(id: string): Observable<FriendRequest> {
    return this.http.get<FriendRequest>(`${this.apiUrl}/${id}`).pipe(
      map(request => ({
        ...request,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt)
      }))
    );
  }
}
