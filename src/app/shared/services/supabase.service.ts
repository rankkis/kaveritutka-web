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
          // Use localStorage instead of default (prevents lock manager issues)
          storage: window.localStorage,
          // Reduce lock conflicts
          storageKey: 'supabase-auth-token',
          // Automatically refresh session
          autoRefreshToken: true,
          // Persist session across tabs
          persistSession: true,
          // Detect session in URL hash
          detectSessionInUrl: true
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

    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        // Skip confirmation - go straight back to app
        skipBrowserRedirect: false
      }
    });

    if (error) {
      console.error('Google sign in error:', error);
      throw error;
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
}
