import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (cart.isOpen()) {
      <div class="drawer-backdrop" (click)="cart.close()" aria-hidden="true"></div>
    }

    <div
      class="drawer"
      [class.drawer--open]="cart.isOpen()"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      [attr.aria-hidden]="!cart.isOpen()"
    >
      <div class="drawer__header">
        <div>
          <h2 id="drawer-title" class="drawer__title">Coșul tău</h2>
          <p class="drawer__sub">SUMAR PRODUSE SELECTATE</p>
        </div>
        <button class="drawer__close" (click)="cart.close()" aria-label="Închide coșul">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="drawer__body">
        @if (!cart.cart() || cart.cart()!.items.length === 0) {
          <div class="drawer__empty" role="status">
            <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="none"
                 stroke="var(--rw-border)" stroke-width="1.4">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <p class="drawer__empty-msg">Coșul tău este gol.</p>
            <button class="btn-outline" (click)="goToCatalog()">Explorează Catalogul</button>
          </div>
        } @else {
          <ul class="cart-list" aria-label="Produse în coș">
            @for (item of cart.cart()!.items; track item.id) {
              <li class="cart-item">
                <div class="cart-item__img" aria-hidden="true">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.name" />
                  } @else {
                    <div class="cart-item__placeholder"></div>
                  }
                </div>

                <div class="cart-item__info">
                  <p class="cart-item__name">{{ item.name }}</p>
                  <p class="cart-item__price">{{ item.unitPrice | number:'1.2-2' }} RON / buc.</p>
                  <div class="qty-row" role="group" [attr.aria-label]="'Cantitate: ' + item.name">
                    <button
                      class="qty-btn"
                      (click)="changeQty(item.id, item.quantity - 1)"
                      [attr.aria-label]="'Scade cantitate pentru ' + item.name"
                    >−</button>
                    <span class="qty-value" aria-live="polite">{{ item.quantity }}</span>
                    <button
                      class="qty-btn"
                      (click)="changeQty(item.id, item.quantity + 1)"
                      [attr.aria-label]="'Crește cantitate pentru ' + item.name"
                    >+</button>
                    <span class="qty-sub">= {{ item.subtotal | number:'1.2-2' }} RON</span>
                  </div>
                </div>

                <button
                  class="cart-item__remove"
                  (click)="remove(item.id, item.name)"
                  [attr.aria-label]="'Elimină ' + item.name + ' din coș'"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6"  y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </li>
            }
          </ul>
        }
      </div>

      @if (cart.cart() && cart.cart()!.items.length > 0) {
        <div class="drawer__footer">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ cart.cart()!.total | number:'1.2-2' }} RON</span>
          </div>
          <div class="summary-row summary-row--muted">
            <span>Livrare</span>
            <span class="text-green">Gratuit</span>
          </div>
          <div class="summary-row summary-row--total">
            <span>TOTAL DE PLATĂ</span>
            <span>{{ cart.cart()!.total | number:'1.2-2' }} RON</span>
          </div>
          <button class="btn-cta" (click)="checkout()">
            Finalizează Comanda
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p class="drawer__secure">
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Plată securizată SSL
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── Backdrop ── */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.48);
      z-index: 200;
      animation: fade-in var(--t-base);
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Drawer panel ── */
    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      height: 100dvh;
      width: 400px;
      max-width: 95vw;
      background: #fff;
      z-index: 201;
      display: flex;
      flex-direction: column;
      box-shadow: -6px 0 32px rgba(0,0,0,0.18);
      transform: translateX(100%);
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .drawer--open { transform: translateX(0); }

    /* ── Header ── */
    .drawer__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--sp-5) var(--sp-6);
      border-bottom: 1px solid var(--rw-border);
      background: var(--rw-dark);
      flex-shrink: 0;
    }

    .drawer__title {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 4px;
      line-height: 1;
    }

    .drawer__sub {
      color: rgba(255,255,255,0.45);
      font-size: 11px;
      letter-spacing: 1px;
      margin: 0;
    }

    .drawer__close {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      border-radius: var(--r-sm);
      transition: color var(--t-fast), background var(--t-fast);
      flex-shrink: 0;
    }

    .drawer__close:hover { color: #fff; background: rgba(255,255,255,0.09); }

    /* ── Body ── */
    .drawer__body {
      flex: 1;
      overflow-y: auto;
      padding: var(--sp-4) var(--sp-6);
      overscroll-behavior: contain;
    }

    /* ── Empty state ── */
    .drawer__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-4);
      padding: var(--sp-12) 0;
      color: var(--rw-muted);
      text-align: center;
    }

    .drawer__empty-msg { font-size: 15px; margin: 0; }

    /* ── Cart list ── */
    .cart-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    /* ── Cart item ── */
    .cart-item {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-3);
      padding: var(--sp-4) 0;
      border-bottom: 1px solid var(--rw-border);
    }

    .cart-item__img {
      width: 60px;
      height: 60px;
      border-radius: var(--r-md);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--rw-dark-card);
    }

    .cart-item__img img { width: 100%; height: 100%; object-fit: cover; }

    .cart-item__placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0d1422 0%, #1a2140 100%);
    }

    .cart-item__info { flex: 1; min-width: 0; }

    .cart-item__name {
      font-size: 13px;
      font-weight: 600;
      color: var(--rw-text);
      margin: 0 0 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cart-item__price {
      font-size: 12px;
      color: var(--rw-muted);
      margin: 0 0 var(--sp-2);
    }

    /* ── Qty controls ── */
    .qty-row {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border: 1px solid var(--rw-border);
      border-radius: var(--r-sm);
      background: #fff;
      color: var(--rw-text);
      font-size: 16px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color var(--t-fast), color var(--t-fast), background var(--t-fast);
      font-family: inherit;
    }

    .qty-btn:hover {
      border-color: var(--rw-orange);
      color: var(--rw-orange);
      background: rgba(232,96,28,0.05);
    }

    .qty-value {
      min-width: 28px;
      text-align: center;
      font-size: 14px;
      font-weight: 700;
      color: var(--rw-text);
    }

    .qty-sub {
      font-size: 12px;
      color: var(--rw-muted);
      margin-left: var(--sp-1);
    }

    /* ── Remove button ── */
    .cart-item__remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: none;
      border: none;
      color: var(--rw-muted);
      cursor: pointer;
      border-radius: var(--r-sm);
      transition: color var(--t-fast), background var(--t-fast);
      flex-shrink: 0;
    }

    .cart-item__remove:hover {
      color: var(--rw-error);
      background: rgba(220, 38, 38, 0.06);
    }

    /* ── Footer ── */
    .drawer__footer {
      padding: var(--sp-4) var(--sp-6) var(--sp-6);
      border-top: 1px solid var(--rw-border);
      background: var(--rw-bg);
      flex-shrink: 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      margin-bottom: var(--sp-2);
      color: var(--rw-text);
    }

    .summary-row--muted { color: var(--rw-muted); }

    .summary-row--total {
      font-size: 16px;
      font-weight: 700;
      margin: var(--sp-3) 0;
      padding-top: var(--sp-3);
      border-top: 2px solid var(--rw-border);
    }

    .text-green { color: var(--rw-success); font-weight: 600; }

    /* ── CTA button ── */
    .btn-cta {
      width: 100%;
      padding: 14px var(--sp-4);
      background: var(--rw-orange);
      color: #fff;
      border: none;
      border-radius: var(--r-md);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      transition: background var(--t-fast), transform var(--t-fast);
      margin-bottom: var(--sp-3);
    }

    .btn-cta:hover { background: var(--rw-orange-h); transform: translateY(-1px); }
    .btn-cta:active { transform: translateY(0); }

    /* ── Outline button ── */
    .btn-outline {
      padding: 10px var(--sp-5);
      border: 1.5px solid var(--rw-orange);
      background: none;
      color: var(--rw-orange);
      border-radius: var(--r-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background var(--t-fast), color var(--t-fast);
    }

    .btn-outline:hover {
      background: var(--rw-orange);
      color: #fff;
    }

    /* ── Secure note ── */
    .drawer__secure {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-1);
      text-align: center;
      font-size: 12px;
      color: var(--rw-muted);
      margin: 0;
    }
  `],
})
export class CartDrawerComponent {
  readonly cart   = inject(CartService);
  private  router = inject(Router);
  private  toast  = inject(ToastService);

  changeQty(itemId: number, qty: number): void {
    this.cart.updateQuantity(itemId, qty).subscribe();
  }

  // UC-8 Flow §3–4: confirmation dialog; §7: success message
  remove(itemId: number, itemName: string): void {
    if (!confirm(`Eliminați "${itemName}" din coș?`)) return;
    this.cart.removeItem(itemId).subscribe({
      next: () => this.toast.show(`"${itemName}" a fost eliminat din coș.`),
    });
  }

  checkout(): void {
    this.cart.close();
    this.router.navigate(['/checkout']);
  }

  goToCatalog(): void {
    this.cart.close();
    this.router.navigate(['/products']);
  }
}
