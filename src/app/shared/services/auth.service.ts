import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { User, LoginCredentials, RegisterCredentials, AuthResponse, TokenRefreshResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'kaveritutka_token';
  private readonly REFRESH_TOKEN_KEY = 'kaveritutka_refresh_token';
  private readonly USER_KEY = 'kaveritutka_user';
  private readonly TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (assuming 15min token expiry)

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenRefreshTimer: any;

  constructor(private http: HttpClient) {
    // Initialize with stored user if available
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Start token refresh timer if user is logged in
    if (storedUser && this.getToken()) {
      this.startTokenRefreshTimer();
    }
  }

  /**
   * Get current user value (synchronous)
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.currentUserSubject.next(response.user);
          this.startTokenRefreshTimer();
        }),
        map(response => response.user),
        catchError(this.handleError)
      );
  }

  /**
   * Register new user with email, password, and name
   */
  register(credentials: RegisterCredentials): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.currentUserSubject.next(response.user);
          this.startTokenRefreshTimer();
        }),
        map(response => response.user),
        catchError(this.handleError)
      );
  }

  /**
   * Logout and clear all authentication data
   */
  logout(): void {
    // Clear storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    // Clear state
    this.currentUserSubject.next(null);

    // Stop token refresh timer
    this.stopTokenRefreshTimer();

    // Optionally notify backend
    const token = this.getToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        error: (error) => console.error('Logout API call failed:', error)
      });
    }
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUserValue;
    return !!token && !!user;
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<TokenRefreshResponse>(
      `${environment.apiUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      }),
      map(response => response.token),
      catchError(error => {
        // If refresh fails, logout user
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
  }

  /**
   * Retrieve stored user from localStorage
   */
  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }

    try {
      const user = JSON.parse(userJson);
      // Convert createdAt string to Date object
      if (user.createdAt) {
        user.createdAt = new Date(user.createdAt);
      }
      return user;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      return null;
    }
  }

  /**
   * Start automatic token refresh timer
   */
  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer(); // Clear any existing timer

    this.tokenRefreshTimer = timer(this.TOKEN_REFRESH_INTERVAL, this.TOKEN_REFRESH_INTERVAL)
      .pipe(
        switchMap(() => this.refreshToken())
      )
      .subscribe({
        next: () => console.log('Token refreshed successfully'),
        error: (error) => console.error('Token refresh failed:', error)
      });
  }

  /**
   * Stop token refresh timer
   */
  private stopTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Tunnistautuminen epäonnistui';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Virhe: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Virheelliset kirjautumistiedot';
          break;
        case 403:
          errorMessage = 'Pääsy evätty';
          break;
        case 404:
          errorMessage = 'Palvelua ei löytynyt';
          break;
        case 500:
          errorMessage = 'Palvelinvirhe. Yritä myöhemmin uudelleen.';
          break;
        default:
          errorMessage = `Virhe: ${error.status} - ${error.message}`;
      }
    }

    console.error('Authentication error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
