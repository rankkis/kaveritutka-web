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
    });

    // Listen to auth changes
    this.supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      this.sessionSubject.next(session);
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
