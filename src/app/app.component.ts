import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from './core/layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container">
      @if (showHeader$ | async) {
        <app-header></app-header>
      }
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    main {
      flex: 1;
      overflow: hidden;
      position: relative; // Enable absolute positioning within main
    }
  `]
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly showHeader$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.router.url !== '/')
  );
}
