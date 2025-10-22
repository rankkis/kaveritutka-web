import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-auth-provider-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './auth-provider-dialog.component.html',
  styleUrls: ['./auth-provider-dialog.component.scss']
})
export class AuthProviderDialogComponent {
  loading = false;
  errorMessage = '';
  buttonText = 'Jatka Google-tilillä';
  buttonIcon = 'account_circle';
  showSpinner = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialogRef: MatDialogRef<AuthProviderDialogComponent>
  ) {}

  onGoogleLogin(): void {
    this.loading = true;
    this.showSpinner = true;
    this.buttonText = 'Kirjaudutaan...';
    this.errorMessage = '';

    this.authService.loginWithGoogle().subscribe({
      next: (user) => {
        this.dialogRef.close();

        // If user has no name, redirect to welcome page
        if (!user.name) {
          this.router.navigate(['/welcome']);
        } else {
          // Existing user, stay on current page or redirect to home
          this.router.navigate(['/']);
        }
      },
      error: (error: Error) => {
        this.loading = false;
        this.showSpinner = false;
        this.buttonText = 'Jatka Google-tilillä';
        this.errorMessage = error.message || 'Kirjautuminen epäonnistui';
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
