import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    private dialogRef: MatDialogRef<AuthProviderDialogComponent>
  ) {}

  onGoogleLogin(): void {
    this.loading = true;
    this.showSpinner = true;
    this.buttonText = 'Kirjaudutaan...';
    this.errorMessage = '';

    // Initiate Google OAuth redirect
    // User will be redirected back to /auth/callback after authentication
    this.authService.loginWithGoogle();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
