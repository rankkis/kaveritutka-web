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
      // Supabase will handle the redirect and callback automatically
      await this.supabaseService.signInWithGoogle();

      console.log('OAuth redirect initiated successfully');
      this.dialogRef.close();
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
