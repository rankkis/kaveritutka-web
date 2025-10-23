import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../../../shared/services/supabase.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit {
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('AuthCallback: Processing OAuth callback');
    console.log('Current URL:', window.location.href);

    // Check for error in URL params
    const params = await this.route.queryParams.toPromise();
    const error = params?.['error'];

    if (error) {
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      console.error('OAuth error:', error);
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }

    // Check if we have an authorization code (PKCE flow)
    const code = params?.['code'];
    console.log('Authorization code:', code ? 'present' : 'missing');

    if (code) {
      // Frontend exchanges code for session
      // Code verifier is in localStorage from the initial signInWithOAuth call
      console.log('Exchanging code for session...');

      try {
        const { data, error: exchangeError } = await this.supabaseService
          .getClient()
          .auth.exchangeCodeForSession(code);

        if (exchangeError || !data.session) {
          console.error('Error exchanging code:', exchangeError);
          this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
          setTimeout(() => this.router.navigate(['/']), 2000);
          return;
        }

        console.log('Session established:', data.session.user.email);

        // Wait a moment for the session to propagate
        await new Promise(resolve => setTimeout(resolve, 100));

        // Clear query params from URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Check if this is a first-time user
        const isNewUser = this.checkIfNewUser();

        console.log('Navigating to:', isNewUser ? '/welcome' : '/');

        if (isNewUser) {
          this.router.navigate(['/welcome']);
        } else {
          this.router.navigate(['/']);
        }
      } catch (err) {
        console.error('Exception during code exchange:', err);
        this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
        setTimeout(() => this.router.navigate(['/']), 2000);
      }
    } else {
      console.error('No authorization code in URL');
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      setTimeout(() => this.router.navigate(['/']), 2000);
    }
  }

  /**
   * Check if this is a first-time user
   * Uses localStorage to track if user has seen the welcome page
   */
  private checkIfNewUser(): boolean {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    if (!hasSeenWelcome) {
      // Mark as seen for future visits
      localStorage.setItem('hasSeenWelcome', 'true');
      return true;
    }

    return false;
  }
}
