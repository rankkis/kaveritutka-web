import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MapStateService } from '../../../core/services/map-state.service';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  headerTitle = 'Kaveritutka';
  currentUser: User | null = null;
  private mapStateSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor(
    private mapStateService: MapStateService,
    private authService: AuthService,
    private router: Router
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
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.mapStateSubscription) {
      this.mapStateSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }
}
