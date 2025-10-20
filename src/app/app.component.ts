import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header>
        <h1>Kaveritutka</h1>
        <p class="tagline">Löydä leikkikavereita lapsellesi</p>
      </header>
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

    header {
      background-color: #4CAF50;
      color: white;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    header h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    header .tagline {
      margin: 0.5rem 0 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    main {
      flex: 1;
      overflow: hidden;
    }
  `]
})
export class AppComponent {
  title = 'kaveritutka-web-app';
}
