import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <div class="construction-stamp">
        <div class="stamp-title">Rakenteilla</div>
        <div class="stamp-subtitle">Tapahtumat ovat esimerkkejä • Lomakkeita ei tallenneta</div>
      </div>
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
      position: relative;
    }

    .construction-stamp {
      position: fixed;
      background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
      color: white;
      font-weight: bold;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
      z-index: 1000;
      border: 3px solid rgba(255, 255, 255, 0.3);
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    @media (min-width: 768px) {
      .construction-stamp {
        top: 180px;
        left: -50px;
        padding: 15px 100px;
        transform: rotate(-45deg);
        min-width: 300px;
      }

      .construction-stamp::before {
        content: '🚧';
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 24px;
      }

      .construction-stamp::after {
        content: '🚧';
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 24px;
      }
    }

    @media (max-width: 767px) {
      .construction-stamp {
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px 20px;
        transform: none;
        border-left: none;
        border-right: none;
        border-bottom: none;
      }

      .construction-stamp::before {
        content: '🚧 ';
        position: static;
        font-size: 16px;
      }

      .construction-stamp::after {
        content: ' 🚧';
        position: static;
        font-size: 16px;
      }
    }

    .stamp-title {
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }

    @media (max-width: 767px) {
      .stamp-title {
        font-size: 16px;
        letter-spacing: 1px;
        margin-bottom: 2px;
      }
    }

    .stamp-subtitle {
      font-size: 11px;
      font-weight: normal;
      opacity: 0.95;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }

    @media (max-width: 767px) {
      .stamp-subtitle {
        font-size: 10px;
        letter-spacing: 0.3px;
      }
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
