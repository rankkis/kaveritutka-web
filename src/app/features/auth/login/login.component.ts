import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loading = false;
  errorMessage = '';
  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from query params or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onGoogleLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.loginWithGoogle().subscribe({
      next: (user) => {
        // If user has no name, redirect to welcome page
        if (!user.name) {
          this.router.navigate(['/welcome'], {
            queryParams: { returnUrl: this.returnUrl }
          });
        } else {
          // Existing user, redirect to return URL
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Kirjautuminen epäonnistui';
      }
    });
  }
}
