import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="navbar__inner">
        <a class="navbar__logo" routerLink="/products">
          <span class="navbar__logo-text">RO-WHEELS INDUSTRIAL</span>
          <span class="navbar__logo-accent"></span>
        </a>

        <nav class="navbar__links">
          <a routerLink="/products" routerLinkActive="navbar__link--active" class="navbar__link">Catalog</a>
          <span class="navbar__link navbar__link--dim">Soluții Tehnice</span>
          <span class="navbar__link navbar__link--dim">Oferte</span>
          <span class="navbar__link navbar__link--dim">Suport</span>
        </nav>

        <div class="navbar__actions">
          @if (auth.isAdmin()) {
            <span class="navbar__badge">Admin</span>
          }
          <span class="navbar__user">{{ auth.username() }}</span>
          <button class="navbar__logout" (click)="auth.logout()">Deconectare</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: var(--rw-dark);
      height: 60px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 0 rgba(255,255,255,0.06);
    }

    .navbar__inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 28px;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .navbar__logo {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      flex-shrink: 0;
    }

    .navbar__logo-text {
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.2px;
      line-height: 1.2;
    }

    .navbar__logo-accent {
      display: block;
      width: 28px;
      height: 2px;
      background: var(--rw-orange);
      margin-top: 4px;
    }

    .navbar__links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .navbar__link {
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 14px;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: color 0.15s;
      user-select: none;
    }

    .navbar__link:hover { color: rgba(255,255,255,0.9); }
    .navbar__link--active { color: #fff; font-weight: 500; }
    .navbar__link--dim { opacity: 0.3; cursor: default; pointer-events: none; }

    .navbar__actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .navbar__badge {
      background: var(--rw-orange);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.6px;
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .navbar__user {
      color: rgba(255,255,255,0.75);
      font-size: 13px;
    }

    .navbar__logout {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.6);
      padding: 5px 14px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }

    .navbar__logout:hover {
      border-color: rgba(255,255,255,0.45);
      color: #fff;
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
