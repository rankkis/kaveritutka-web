import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Session } from '@supabase/supabase-js';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MapStateService } from '../../../core/services/map-state.service';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { AuthProviderDialogComponent } from '../../auth/auth-provider-dialog/auth-provider-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatDialogModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  headerTitle = 'Kaveritutka';
  currentSession: Session | null = null;
  private mapStateSubscription: Subscription | undefined;
  private sessionSubscription: Subscription | undefined;

  constructor(
    private mapStateService: MapStateService,
    private supabaseService: SupabaseService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Subscribe to map state changes to update header with locations
    this.mapStateSubscription = this.mapStateService.mapState$.subscribe(state => {
      if (state.locations.length > 0) {
        const locationsText = state.locations.join('/');
        this.headerTitle = `Kaveritutka - ${locationsText}`;
      } else {
        this.headerTitle = 'Kaveritutka';
      }
    });

    // Subscribe to authentication state changes
    this.sessionSubscription = this.supabaseService.session$.subscribe(session => {
      this.currentSession = session;
    });
  }

  ngOnDestroy(): void {
    if (this.mapStateSubscription) {
      this.mapStateSubscription.unsubscribe();
    }
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

  onLogin(): void {
    this.dialog.open(AuthProviderDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      panelClass: 'auth-dialog-panel'
    });
  }

  async onLogout(): Promise<void> {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }

  get isAuthenticated(): boolean {
    return this.supabaseService.isAuthenticated();
  }

  get userName(): string {
    if (!this.currentSession?.user) {
      return 'Tuntematon';
    }
    // Use user metadata for display name, or fall back to email
    return this.currentSession.user.user_metadata?.['full_name'] ||
           this.currentSession.user.user_metadata?.['name'] ||
           this.currentSession.user.email ||
           'Tuntematon';
  }
}
