import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionSubject: BehaviorSubject<Session | null>;
  public session$: Observable<Session | null>;
  private tokenExpirationCheckSubscription?: Subscription;
  private readonly TOKEN_EXPIRATION_CHECK_INTERVAL = 60 * 1000; // Check every minute

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          // Enable auto-detection for PKCE flow to work properly
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    );

    // Initialize session from storage
    this.sessionSubject = new BehaviorSubject<Session | null>(null);
    this.session$ = this.sessionSubject.asObservable();

    // Load initial session
    this.supabase.auth.getSession().then(({ data }) => {
      this.sessionSubject.next(data.session);

      // Start token expiration monitoring if session exists
      if (data.session) {
        this.startTokenExpirationMonitoring();
      }
    });

    // Listen to auth changes
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('[SupabaseService] Auth state changed:', event);
      this.sessionSubject.next(session);

      // Start/stop token expiration monitoring based on session state
      if (session && event === 'SIGNED_IN') {
        this.startTokenExpirationMonitoring();
      } else if (event === 'SIGNED_OUT') {
        this.stopTokenExpirationMonitoring();
      }

      // Handle token expired event
      if (event === 'TOKEN_REFRESHED') {
        console.log('[SupabaseService] Token refreshed successfully');
      }
    });
  }

  /**
   * Sign in with Google OAuth
   * Redirects to Google OAuth page
   * OAuth callback comes back to frontend which handles code exchange
   */
  async signInWithGoogle() {
    // OAuth callback goes to FRONTEND (not backend)
    // Frontend has the PKCE code verifier in localStorage
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('OAuth redirect URL (frontend):', redirectUrl);
    console.log('Starting signInWithOAuth...');

    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        // Query params to include in redirect
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    console.log('signInWithOAuth completed', { data, error });

    if (error) {
      console.error('Google sign in error:', error);
      throw error;
    }

    // Check if we got a URL to redirect to
    if (data?.url) {
      console.log('Redirecting to Google OAuth:', data.url);
      window.location.href = data.url;
    } else {
      console.error('No redirect URL received from Supabase');
      throw new Error('No redirect URL received');
    }
  }

  /**
   * Sign out current user
   * Clears all authentication data and stops token monitoring
   */
  async signOut() {
    console.log('[SupabaseService] Signing out user');

    // Stop token expiration monitoring
    this.stopTokenExpirationMonitoring();

    // Clear session subject
    this.sessionSubject.next(null);

    // Sign out from Supabase (this will clear storage)
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('[SupabaseService] Sign out error:', error);
      throw error;
    }

    console.log('[SupabaseService] Sign out successful, storage cleared');
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.sessionSubject.value;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.sessionSubject.value?.access_token || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionSubject.value !== null;
  }

  /**
   * Get Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Manually exchange auth code from URL
   * This is called in AuthCallbackComponent to avoid auto-detection lock conflicts
   */
  async exchangeCodeForSession(): Promise<{ session: Session | null; error: any }> {
    console.log('exchangeCodeForSession: Starting manual session exchange');
    console.log('Current URL:', window.location.href);
    console.log('Query string:', window.location.search);
    console.log('Hash fragment:', window.location.hash);

    try {
      // Check if we have an authorization code (PKCE flow)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        console.log('Found authorization code in query params, exchanging for session');
        console.log('Code:', code);

        // For PKCE flow, pass just the code (not the full URL)
        // The code verifier is automatically retrieved from localStorage by Supabase
        const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Error exchanging code for session:', error);
          return { session: null, error };
        }

        console.log('Session established successfully via code exchange:', data.session?.user?.email);

        // Clear the query params from URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Update session subject
        this.sessionSubject.next(data.session);

        return { session: data.session, error: null };
      }

      // Check if we have a hash fragment (implicit flow - fallback)
      if (window.location.hash) {
        console.log('Found hash fragment, parsing tokens');

        // Parse the hash fragment manually
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          console.log('Setting session with tokens from hash fragment');

          // Set the session using the tokens from the URL
          const { data, error } = await this.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('Session set error:', error);
            return { session: null, error };
          }

          console.log('Session established successfully via hash tokens:', data.session?.user?.email);

          // Clear the hash from URL
          window.history.replaceState({}, document.title, window.location.pathname);

          // Update session subject
          this.sessionSubject.next(data.session);

          return { session: data.session, error: null };
        }
      }

      console.log('No authorization code or tokens found in URL, checking existing session');

      // If no code or hash, just get existing session
      const { data, error } = await this.supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      console.error('Exchange code error:', error);
      return { session: null, error };
    }
  }

  /**
   * Validate and restore session on app initialization
   * Called by APP_INITIALIZER
   * Returns the session if valid, null otherwise
   */
  async validateAndRestoreSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error('[SupabaseService] Error getting session:', error);
        await this.clearInvalidSession();
        return null;
      }

      if (!data.session) {
        console.log('[SupabaseService] No session found in storage');
        return null;
      }

      // Check if token is expired
      const isExpired = this.isTokenExpired(data.session);
      if (isExpired) {
        console.warn('[SupabaseService] Token is expired, attempting refresh...');

        // Try to refresh the token
        const { data: refreshData, error: refreshError } = await this.supabase.auth.refreshSession();

        if (refreshError || !refreshData.session) {
          console.error('[SupabaseService] Token refresh failed:', refreshError);
          await this.clearInvalidSession();
          return null;
        }

        console.log('[SupabaseService] Token refreshed successfully');
        this.sessionSubject.next(refreshData.session);
        return refreshData.session;
      }

      // Session is valid
      this.sessionSubject.next(data.session);
      return data.session;
    } catch (error) {
      console.error('[SupabaseService] Unexpected error during session validation:', error);
      await this.clearInvalidSession();
      return null;
    }
  }

  /**
   * Clear invalid session data
   * Called when session validation fails or token is expired
   */
  async clearInvalidSession(): Promise<void> {
    console.log('[SupabaseService] Clearing invalid session data');

    try {
      // Sign out to clear Supabase storage
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('[SupabaseService] Error during signOut:', error);
    }

    // Ensure session subject is cleared
    this.sessionSubject.next(null);
    this.stopTokenExpirationMonitoring();
  }

  /**
   * Check if token is expired
   * Returns true if token expires within the next 5 minutes (safety buffer)
   */
  private isTokenExpired(session: Session): boolean {
    if (!session.expires_at) {
      return false;
    }

    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const BUFFER_TIME = 5 * 60 * 1000; // 5 minutes buffer

    const isExpired = expiresAt - now < BUFFER_TIME;

    if (isExpired) {
      console.warn('[SupabaseService] Token expires at:', new Date(expiresAt).toISOString());
    }

    return isExpired;
  }

  /**
   * Start monitoring token expiration
   * Checks every minute if token is about to expire
   */
  private startTokenExpirationMonitoring(): void {
    console.log('[SupabaseService] Starting token expiration monitoring');

    // Stop any existing monitoring
    this.stopTokenExpirationMonitoring();

    this.tokenExpirationCheckSubscription = interval(this.TOKEN_EXPIRATION_CHECK_INTERVAL)
      .subscribe(async () => {
        const session = this.sessionSubject.value;

        if (!session) {
          console.log('[SupabaseService] No session, stopping monitoring');
          this.stopTokenExpirationMonitoring();
          return;
        }

        // Check if token is expired or about to expire
        const isExpired = this.isTokenExpired(session);

        if (isExpired) {
          console.warn('[SupabaseService] Token expiring soon, Supabase will auto-refresh');
          // Supabase SDK will handle the refresh automatically
          // We just log it here for visibility
        }
      });
  }

  /**
   * Stop monitoring token expiration
   */
  private stopTokenExpirationMonitoring(): void {
    if (this.tokenExpirationCheckSubscription) {
      console.log('[SupabaseService] Stopping token expiration monitoring');
      this.tokenExpirationCheckSubscription.unsubscribe();
      this.tokenExpirationCheckSubscription = undefined;
    }
  }
}
