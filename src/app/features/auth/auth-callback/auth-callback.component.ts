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

      // Supabase automatically processes the OAuth callback hash fragment
      // We just need to wait a moment for the session to be established
      setTimeout(() => {
        const session = this.supabaseService.getSession();

        if (session) {
          console.log('Authentication successful:', session.user.email);

          // Check if this is a first-time user
          // In Supabase, we can check if the user was just created
          const isNewUser = this.checkIfNewUser();

          if (isNewUser) {
            // First-time user - show welcome page
            this.router.navigate(['/welcome']);
          } else {
            // Returning user - go to home page
            this.router.navigate(['/']);
          }
        } else {
          this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
          setTimeout(() => this.router.navigate(['/']), 3000);
        }
      }, 1000); // Give Supabase time to process the callback
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
