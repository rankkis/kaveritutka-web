import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss']
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  errorMessage = '';
  private sessionSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('AuthCallback: Starting OAuth callback processing');

    // Check for error in URL params
    const params = await this.route.queryParams.toPromise();
    const error = params?.['error'];
    const errorDescription = params?.['error_description'];

    if (error) {
      this.errorMessage = errorDescription || 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      console.error('OAuth error:', error, errorDescription);
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }

    // Supabase will automatically detect the session from URL (detectSessionInUrl: true)
    // Subscribe to session observable and wait for a non-null session
    console.log('Waiting for Supabase to process OAuth callback...');

    // Set a timeout in case session never arrives
    const timeoutId = setTimeout(() => {
      console.error('Timeout waiting for session');
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      setTimeout(() => this.router.navigate(['/']), 2000);
    }, 10000); // 10 second timeout

    // Subscribe to session changes and wait for a valid session
    this.sessionSubscription = this.supabaseService.session$
      .pipe(
        filter(session => session !== null), // Wait for non-null session
        take(1) // Take only the first valid session
      )
      .subscribe(session => {
        clearTimeout(timeoutId);
        console.log('Authentication successful:', session.user.email);

        // Check if this is a first-time user
        const isNewUser = this.checkIfNewUser();

        if (isNewUser) {
          // First-time user - show welcome page
          this.router.navigate(['/welcome']);
        } else {
          // Returning user - go to home page
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
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
