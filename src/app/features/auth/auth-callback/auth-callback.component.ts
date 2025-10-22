import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../shared/services/auth.service';

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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the authorization code from URL query params
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];

      if (error) {
        this.errorMessage = 'Kirjautuminen epäonnistui. Yritä uudelleen.';
        console.error('OAuth error:', error);
        setTimeout(() => this.router.navigate(['/']), 3000);
        return;
      }

      if (!code) {
        this.errorMessage = 'Puuttuva valtuutuskoodi.';
        setTimeout(() => this.router.navigate(['/']), 3000);
        return;
      }

      // Exchange the code for tokens
      this.authService.handleOAuthCallback(code).subscribe({
        next: (user) => {
          // Check if user needs to complete profile (no displayName)
          if (!user.displayName) {
            this.router.navigate(['/welcome']);
          } else {
            // Get the return URL or default to home
            const returnUrl = localStorage.getItem('auth_return_url') || '/';
            localStorage.removeItem('auth_return_url');
            this.router.navigateByUrl(returnUrl);
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Kirjautuminen epäonnistui';
          console.error('OAuth callback error:', error);
          setTimeout(() => this.router.navigate(['/']), 3000);
        }
      });
    });
  }
}
