import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar" role="banner">
      <div class="navbar__inner">

        <a class="navbar__logo" routerLink="/" aria-label="RO-Wheels Industrial — pagina principală">
          <span class="navbar__logo-text">RO-WHEELS INDUSTRIAL</span>
          <span class="navbar__logo-accent" aria-hidden="true"></span>
        </a>

        <nav class="navbar__links" aria-label="Navigare principală">
          <a routerLink="/products" routerLinkActive="navbar__link--active" class="navbar__link">Catalog</a>
          <span class="navbar__link navbar__link--dim" aria-disabled="true">Soluții Tehnice</span>
          <a routerLink="/contact" routerLinkActive="navbar__link--active" class="navbar__link">Suport</a>
        </nav>

        <div class="navbar__actions" role="group" aria-label="Acțiuni utilizator">
          @if (auth.isLoggedIn()) {
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="navbar__icon-btn" aria-label="Panou de administrare">
                <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </a>
            }
            <a routerLink="/orders" class="navbar__icon-btn" aria-label="Comenzile mele">
              <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </a>
            <a routerLink="/profile" class="navbar__icon-btn" aria-label="Profilul meu">
              <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="4"/>
                <path d="M5.5 21a8.38 8.38 0 0113 0"/>
              </svg>
            </a>
          }

          <button
            class="navbar__cart-btn"
            (click)="cart.toggle()"
            [attr.aria-label]="cart.itemCount() > 0
              ? 'Coșul tău, ' + cart.itemCount() + ' produse'
              : 'Coșul tău, gol'"
            [attr.aria-expanded]="cart.isOpen()"
          >
            <svg aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            @if (cart.itemCount() > 0) {
              <span class="navbar__cart-badge" aria-hidden="true">{{ cart.itemCount() }}</span>
            }
          </button>

          @if (auth.isLoggedIn()) {
            <span class="navbar__user">{{ auth.username() }}</span>
            <button class="navbar__logout" (click)="auth.logout()">Deconectare</button>
          } @else {
            <a routerLink="/login" class="navbar__login">Autentificare</a>
          }
        </div>

        <!-- Mobile hamburger -->
        <button
          class="navbar__hamburger"
          (click)="mobileOpen.set(!mobileOpen())"
          [attr.aria-expanded]="mobileOpen()"
          aria-controls="mobile-menu"
          aria-label="Deschide meniu"
        >
          <span class="navbar__hamburger-line" [class.is-open]="mobileOpen()"></span>
        </button>

      </div>
    </header>

    <!-- Mobile overlay -->
    @if (mobileOpen()) {
      <div class="mobile-backdrop" (click)="mobileOpen.set(false)" aria-hidden="true"></div>
    }

    <nav
      id="mobile-menu"
      class="mobile-menu"
      [class.mobile-menu--open]="mobileOpen()"
      aria-label="Meniu mobil"
    >
      <div class="mobile-menu__body">
        <a routerLink="/products" routerLinkActive="mobile-link--active" class="mobile-link" (click)="mobileOpen.set(false)">Catalog</a>
        <a routerLink="/contact"  routerLinkActive="mobile-link--active" class="mobile-link" (click)="mobileOpen.set(false)">Suport</a>
        @if (auth.isLoggedIn()) {
          @if (auth.isAdmin()) {
            <a routerLink="/admin" class="mobile-link" (click)="mobileOpen.set(false)">Admin Panel</a>
          }
          <a routerLink="/orders"  class="mobile-link" (click)="mobileOpen.set(false)">Comenzile mele</a>
          <a routerLink="/profile" class="mobile-link" (click)="mobileOpen.set(false)">Profilul meu</a>
          <hr class="mobile-divider" aria-hidden="true" />
          <button class="mobile-logout" (click)="auth.logout(); mobileOpen.set(false)">Deconectare</button>
        } @else {
          <hr class="mobile-divider" aria-hidden="true" />
          <a routerLink="/login" class="mobile-link mobile-link--cta" (click)="mobileOpen.set(false)">Autentificare</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    /* ── Navbar shell ── */
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
      padding: 0 var(--sp-8);
      height: 100%;
      display: flex;
      align-items: center;
      gap: var(--sp-6);
    }

    /* ── Logo ── */
    .navbar__logo {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      flex-shrink: 0;
      border-radius: var(--r-sm);
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

    /* ── Desktop nav links ── */
    .navbar__links {
      display: flex;
      align-items: center;
      gap: var(--sp-1);
      flex: 1;
    }

    .navbar__link {
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      font-size: 14px;
      padding: 6px 12px;
      border-radius: var(--r-sm);
      cursor: pointer;
      transition: color var(--t-fast), background var(--t-fast);
      user-select: none;
    }

    .navbar__link:hover {
      color: rgba(255,255,255,0.92);
      background: rgba(255,255,255,0.07);
    }

    .navbar__link--active {
      color: #fff;
      font-weight: 600;
      background: rgba(255,255,255,0.09);
    }

    .navbar__link--dim {
      opacity: 0.3;
      cursor: default;
      pointer-events: none;
    }

    /* ── Desktop actions ── */
    .navbar__actions {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      flex-shrink: 0;
    }

    .navbar__icon-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.65);
      border-radius: var(--r-sm);
      text-decoration: none;
      transition: color var(--t-fast), background var(--t-fast);
    }

    .navbar__icon-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.09);
    }

    .navbar__cart-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.65);
      background: none;
      border: none;
      border-radius: var(--r-sm);
      cursor: pointer;
      position: relative;
      transition: color var(--t-fast), background var(--t-fast);
    }

    .navbar__cart-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.09);
    }

    .navbar__cart-badge {
      position: absolute;
      top: 1px;
      right: 1px;
      background: var(--rw-orange);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: var(--r-full);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      line-height: 1;
      border: 1.5px solid var(--rw-dark);
    }

    .navbar__user {
      color: rgba(255,255,255,0.75);
      font-size: 13px;
      margin-left: var(--sp-1);
    }

    .navbar__logout {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.22);
      color: rgba(255,255,255,0.65);
      padding: 5px 14px;
      border-radius: var(--r-sm);
      font-size: 13px;
      cursor: pointer;
      transition: border-color var(--t-fast), color var(--t-fast);
      font-family: inherit;
    }

    .navbar__logout:hover {
      border-color: rgba(255,255,255,0.5);
      color: #fff;
    }

    .navbar__login {
      background: var(--rw-orange);
      color: #fff;
      padding: 7px 18px;
      border-radius: var(--r-sm);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: background var(--t-fast);
    }

    .navbar__login:hover { background: var(--rw-orange-h); }

    /* ── Hamburger button (mobile only) ── */
    .navbar__hamburger {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: var(--r-sm);
      color: rgba(255,255,255,0.7);
      padding: 0;
      margin-left: auto;
      flex-shrink: 0;
      transition: background var(--t-fast);
    }

    .navbar__hamburger:hover { background: rgba(255,255,255,0.09); }

    .navbar__hamburger-line,
    .navbar__hamburger-line::before,
    .navbar__hamburger-line::after {
      display: block;
      width: 20px;
      height: 2px;
      background: currentColor;
      border-radius: 2px;
      transition: transform var(--t-fast), opacity var(--t-fast);
    }

    .navbar__hamburger-line {
      position: relative;
    }

    .navbar__hamburger-line::before,
    .navbar__hamburger-line::after {
      content: '';
      position: absolute;
      left: 0;
    }

    .navbar__hamburger-line::before { top: -6px; }
    .navbar__hamburger-line::after  { top:  6px; }

    .navbar__hamburger-line.is-open              { background: transparent; }
    .navbar__hamburger-line.is-open::before { transform: rotate(45deg)  translateY(6px); }
    .navbar__hamburger-line.is-open::after  { transform: rotate(-45deg) translateY(-6px); }

    /* ── Mobile overlay ── */
    .mobile-backdrop {
      position: fixed;
      inset: 60px 0 0;
      background: rgba(0,0,0,0.52);
      z-index: 98;
      animation: fade-in var(--t-fast);
    }

    /* ── Mobile menu panel ── */
    .mobile-menu {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      background: var(--rw-dark);
      z-index: 99;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      transform: translateY(-110%);
      transition: transform var(--t-base);
      box-shadow: var(--shadow-lg);
    }

    .mobile-menu--open { transform: translateY(0); }

    .mobile-menu__body {
      padding: var(--sp-2) var(--sp-4) var(--sp-6);
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
    }

    .mobile-link {
      display: block;
      color: rgba(255,255,255,0.78);
      text-decoration: none;
      font-size: 16px;
      font-weight: 500;
      padding: 13px var(--sp-4);
      border-radius: var(--r-md);
      transition: background var(--t-fast), color var(--t-fast);
    }

    .mobile-link:hover { background: rgba(255,255,255,0.07); color: #fff; }
    .mobile-link--active { color: #fff; background: rgba(255,255,255,0.09); }

    .mobile-link--cta {
      background: var(--rw-orange);
      color: #fff;
      font-weight: 600;
      text-align: center;
    }

    .mobile-link--cta:hover { background: var(--rw-orange-h); }

    .mobile-divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin: var(--sp-2) 0;
    }

    .mobile-logout {
      display: block;
      width: 100%;
      padding: 13px var(--sp-4);
      text-align: left;
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.65);
      border-radius: var(--r-md);
      font-size: 16px;
      font-family: inherit;
      cursor: pointer;
      transition: border-color var(--t-fast), color var(--t-fast);
    }

    .mobile-logout:hover { border-color: rgba(255,255,255,0.4); color: #fff; }

    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .navbar__inner { padding: 0 var(--sp-4); gap: var(--sp-3); }
      .navbar__links   { display: none; }
      .navbar__actions { display: none; }
      .navbar__hamburger { display: flex; }
    }
  `],
})
export class NavbarComponent {
  readonly auth       = inject(AuthService);
  readonly cart       = inject(CartService);
  readonly mobileOpen = signal(false);
}
