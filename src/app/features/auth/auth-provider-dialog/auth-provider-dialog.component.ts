import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../../../shared/services/supabase.service';

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
    private supabaseService: SupabaseService,
    private dialogRef: MatDialogRef<AuthProviderDialogComponent>
  ) {}

  async onGoogleLogin(): Promise<void> {
    this.loading = true;
    this.showSpinner = true;
    this.buttonText = 'Kirjaudutaan...';
    this.errorMessage = '';

    try {
      console.log('Starting Google OAuth sign-in...');
      console.log('Redirect URL will be:', `${window.location.origin}/auth/callback`);

      // Initiate Supabase Google OAuth
      // Note: This will redirect the browser to Google OAuth page
      // If redirect succeeds, this code after await won't execute
      await this.supabaseService.signInWithGoogle();

      // If we reach here, redirect didn't happen - likely an error
      console.warn('OAuth redirect did not occur - checking for errors');

      // Keep loading state since redirect might still be processing
      // Set a timeout to show error if redirect doesn't happen
      setTimeout(() => {
        if (this.loading) {
          console.error('OAuth redirect failed - timeout reached');
          this.loading = false;
          this.showSpinner = false;
          this.buttonText = 'Jatka Google-tilillä';
          this.errorMessage = 'Uudelleenohjaus epäonnistui. Yritä uudelleen.';
        }
      }, 3000);
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      this.loading = false;
      this.showSpinner = false;
      this.buttonText = 'Jatka Google-tilillä';
      this.errorMessage = error?.message || 'Kirjautuminen epäonnistui. Tarkista että Google OAuth on konfiguroitu Supabasessa.';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
