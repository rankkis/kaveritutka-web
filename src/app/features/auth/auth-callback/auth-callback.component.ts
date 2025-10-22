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

  ngOnInit(): void {
    // Check for error in URL params
    this.route.queryParams.subscribe(params => {
      const error = params['error'];
      const errorDescription = params['error_description'];

      if (error) {
        this.errorMessage = errorDescription || 'Kirjautuminen epäonnistui. Yritä uudelleen.';
        console.error('OAuth error:', error, errorDescription);
        setTimeout(() => this.router.navigate(['/']), 3000);
        return;
      }

      // Subscribe to auth state changes instead of polling
      // This avoids Navigator LockManager conflicts
      const subscription = this.supabaseService.session$.subscribe(session => {
        if (session) {
          console.log('Authentication successful:', session.user.email);

          // Unsubscribe to prevent multiple navigations
          subscription.unsubscribe();

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
      });

      // Fallback timeout in case session never arrives
      setTimeout(() => {
        if (!this.supabaseService.getSession()) {
          subscription.unsubscribe();
          this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
          setTimeout(() => this.router.navigate(['/']), 2000);
        }
      }, 5000);
    });
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
