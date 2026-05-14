import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';

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

          <a routerLink="/orders" class="navbar__icon-btn" title="Comenzile mele">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
          </a>

          <a routerLink="/profile" class="navbar__icon-btn" title="Profilul meu">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4"/>
              <path d="M5.5 21a8.38 8.38 0 0113 0"/>
            </svg>
          </a>

          <button class="navbar__cart-btn" (click)="cart.toggle()" title="Coșul tău">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            @if (cart.itemCount() > 0) {
              <span class="navbar__cart-badge">{{ cart.itemCount() }}</span>
            }
          </button>

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
      gap: 28px;
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
      gap: 8px;
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
    }

    .navbar__icon-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.6);
      border-radius: 6px;
      text-decoration: none;
      transition: color .15s, background .15s;
    }

    .navbar__icon-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.08);
    }

    .navbar__cart-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.6);
      background: none;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      transition: color .15s, background .15s;
    }

    .navbar__cart-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.08);
    }

    .navbar__cart-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: var(--rw-orange);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
    }

    .navbar__user {
      color: rgba(255,255,255,0.75);
      font-size: 13px;
      margin-left: 4px;
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
  readonly cart = inject(CartService);
}
