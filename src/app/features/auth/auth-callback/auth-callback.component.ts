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
    console.log('AuthCallback: Processing OAuth callback from backend');

    // Check for error in URL params
    const params = await this.route.queryParams.toPromise();
    const error = params?.['error'];

    if (error) {
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      console.error('OAuth error:', error);
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }

    // Backend redirects with tokens in URL hash fragment
    // Format: #access_token=xxx&refresh_token=yyy&user_id=zzz&user_name=Name
    const hash = window.location.hash.substring(1); // Remove leading #
    console.log('URL hash:', hash);

    if (!hash) {
      console.error('No hash fragment found in URL');
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      setTimeout(() => this.router.navigate(['/']), 2000);
      return;
    }

    // Parse hash parameters
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const userId = hashParams.get('user_id');
    const userName = hashParams.get('user_name');

    console.log('Parsed tokens:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userId,
      userName,
    });

    if (!accessToken || !refreshToken) {
      console.error('Missing tokens in hash fragment');
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      setTimeout(() => this.router.navigate(['/']), 2000);
      return;
    }

    // Set session in Supabase client with tokens from backend
    const { data, error: sessionError } = await this.supabaseService
      .getClient()
      .auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (sessionError || !data.session) {
      console.error('Error setting session:', sessionError);
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      setTimeout(() => this.router.navigate(['/']), 2000);
      return;
    }

    console.log('Authentication successful:', data.session.user.email);

    // Clear hash from URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Check if this is a first-time user
    const isNewUser = this.checkIfNewUser();

    if (isNewUser) {
      // First-time user - show welcome page
      this.router.navigate(['/welcome']);
    } else {
      // Returning user - go to home page
      this.router.navigate(['/']);
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
