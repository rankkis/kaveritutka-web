import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MapStateService } from '../../../core/services/map-state.service';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { UserService } from '../../services/user.service';
import { AuthProviderDialogComponent } from '../../auth/auth-provider-dialog/auth-provider-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatDialogModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // 1. PROPERTIES (alphabetical)
  private readonly dialog = inject(MatDialog);
  private readonly mapStateService = inject(MapStateService);
  private readonly router = inject(Router);
  private readonly supabaseService = inject(SupabaseService);
  private readonly userService = inject(UserService);

  // 2. VIEWMODEL BUILDER
  vm$ = combineLatest({
    isAuthenticated: this.supabaseService.session$.pipe(
      map(session => session !== null)
    ),
    mapState: this.mapStateService.mapState$,
    session: this.supabaseService.session$,
    user: this.userService.getCurrentUser()
  }).pipe(
    map(({ isAuthenticated, mapState, session, user }) => ({
      headerTitle: mapState.locations.length > 0
        ? `Kaveritutka - ${mapState.locations.join('/')}`
        : 'Kaveritutka',
      isAuthenticated,
      session,
      userName: user?.displayName || 'Tuntematon'
    }))
  );

  // 3. PUBLIC METHODS (alphabetical)
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
}
