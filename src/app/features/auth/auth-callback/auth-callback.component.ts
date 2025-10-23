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
    console.log('AuthCallback: Waiting for Supabase auto-detection');

    // Check for error in URL params
    const params = await this.route.queryParams.toPromise();
    const error = params?.['error'];

    if (error) {
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      console.error('OAuth error:', error);
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }

    // With detectSessionInUrl: true, Supabase will automatically
    // process the OAuth callback and emit the session via onAuthStateChange
    // We just need to wait for the session to be available

    console.log('Subscribing to session changes...');

    // Set a timeout in case session never arrives
    const timeoutId = setTimeout(() => {
      console.error('Timeout waiting for session after OAuth callback');
      this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
      setTimeout(() => this.router.navigate(['/']), 2000);
    }, 10000); // 10 second timeout

    // Wait for session to become available
    this.sessionSubscription = this.supabaseService.session$
      .pipe(
        filter(session => session !== null),
        take(1)
      )
      .subscribe(session => {
        clearTimeout(timeoutId);
        console.log('Session received:', session.user.email);

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
      });
  }

  ngOnDestroy(): void {
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
