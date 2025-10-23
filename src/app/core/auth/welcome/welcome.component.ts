import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../../shared/services/supabase.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  userName = '';
  userEmail = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const session = this.supabaseService.getSession();

    if (!session) {
      // No session, redirect to home
      this.router.navigate(['/']);
      return;
    }

    // Get user info from Supabase session
    this.userName = session.user.user_metadata?.['full_name'] ||
                    session.user.user_metadata?.['name'] ||
                    'Käyttäjä';
    this.userEmail = session.user.email || '';
  }

  onGetStarted(): void {
    // Navigate to map
    this.router.navigate(['/map']);
  }
}
