import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, tap, map, catchError } from 'rxjs';
import { UpdateUserDto, User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';
import { SupabaseService } from '../../shared/services/supabase.service';

/**
 * User Profile DTO from backend API
 * Includes additional fields beyond the basic User model
 */
interface UserProfileDto {
  id: string;
  email?: string;
  displayName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Service for managing user profile data
 * Uses real API endpoints: GET/PUT /users/me
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly supabaseService = inject(SupabaseService);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user profile when authentication state changes
    this.supabaseService.session$.subscribe(session => {
      if (session?.user) {
        // User is authenticated, fetch their profile
        // Only fetch if we don't already have a user profile
        if (!this.currentUserSubject.value) {
          this.fetchCurrentUser().subscribe({
            error: (error) => {
              console.error('Failed to fetch user profile:', error);
              this.currentUserSubject.next(null);
            }
          });
        }
      } else {
        // User is not authenticated
        this.currentUserSubject.next(null);
      }
    });
  }

  /**
   * Fetch current user profile from API
   * GET /users/me
   */
  fetchCurrentUser(): Observable<User> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/me`).pipe(
      map(profile => this.convertProfileToUser(profile)),
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user (observable)
   */
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Get current user (synchronous)
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has completed their profile (has a display name)
   */
  hasCompletedProfile(): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && !!user.displayName && user.displayName.trim().length > 0;
  }

  /**
   * Update user profile
   * PUT /users/me
   *
   * Note: This will create the user in the backend if they don't exist yet
   */
  updateProfile(updateData: UpdateUserDto): Observable<User> {
    // Validate display name
    if (!updateData.displayName || updateData.displayName.trim().length === 0) {
      return throwError(() => new Error('Display name is required'));
    }

    return this.http.put<UserProfileDto>(`${this.apiUrl}/me`, updateData).pipe(
      map(profile => this.convertProfileToUser(profile)),
      tap(updatedUser => this.currentUserSubject.next(updatedUser)),
      catchError(error => {
        console.error('Error updating user profile:', error);

        // Extract error message from backend response
        let errorMessage = 'Profiilin päivitys epäonnistui';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Set current user directly (used during initialization)
   */
  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Clear current user (logout)
   */
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  /**
   * Convert UserProfileDto to User model
   */
  private convertProfileToUser(profile: UserProfileDto): User {
    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      createdAt: new Date(profile.createdAt)
    };
  }
}
