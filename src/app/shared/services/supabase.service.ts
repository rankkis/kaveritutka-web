import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionSubject: BehaviorSubject<Session | null>;
  public session$: Observable<Session | null>;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          storage: window.localStorage,
          storageKey: 'sb-auth-token',
          autoRefreshToken: true,
          persistSession: true,
          // Disable auto-detection to prevent lock conflicts
          // We'll handle OAuth callback manually in AuthCallbackComponent
          detectSessionInUrl: false,
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
    });

    // Listen to auth changes
    this.supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      this.sessionSubject.next(session);
    });
  }

  /**
   * Sign in with Google OAuth
   * Redirects to Google OAuth page
   */
  async signInWithGoogle() {
    // Use current origin for redirect (localhost in dev, production domain in prod)
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log('OAuth redirect URL:', redirectUrl);
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
      console.log('Redirecting to:', data.url);
      window.location.href = data.url;
    } else {
      console.error('No redirect URL received from Supabase');
      throw new Error('No redirect URL received');
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
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

        // Let Supabase handle the PKCE code exchange
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
}
