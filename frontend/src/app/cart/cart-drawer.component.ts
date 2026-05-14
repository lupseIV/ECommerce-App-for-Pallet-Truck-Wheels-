import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @if (cart.isOpen()) {
      <div class="drawer-backdrop" (click)="cart.close()"></div>
    }

    <div class="drawer" [class.drawer--open]="cart.isOpen()">
      <div class="drawer__header">
        <div>
          <h2 class="drawer__title">Coșul tău</h2>
          <p class="drawer__sub">SUMAR PRODUSE SELECTATE</p>
        </div>
        <button class="drawer__close" (click)="cart.close()">✕</button>
      </div>

      <div class="drawer__body">
        @if (!cart.cart() || cart.cart()!.items.length === 0) {
          <div class="drawer__empty">
            <p>Coșul tău este gol.</p>
            <button class="btn-outline" (click)="goToCatalog()">Explorează Catalog</button>
          </div>
        } @else {
          @for (item of cart.cart()!.items; track item.id) {
            <div class="cart-item">
              <div class="cart-item__img">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="item.name" />
                } @else {
                  <div class="cart-item__placeholder"></div>
                }
              </div>
              <div class="cart-item__info">
                <p class="cart-item__name">{{ item.name }}</p>
                <p class="cart-item__price">{{ item.unitPrice | number:'1.2-2' }} RON</p>
                <div class="cart-item__qty">
                  <span class="qty-badge">{{ item.quantity }}</span>
                  <span class="cart-item__sub">× {{ item.unitPrice | number:'1.2-2' }} = {{ item.subtotal | number:'1.2-2' }} RON</span>
                </div>
              </div>
              <button class="cart-item__remove" (click)="removeItem(item.id)" title="Elimină">✕</button>
            </div>
          }
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
            Finalizează Comanda →
          </button>
          <p class="drawer__secure">🔒 Plată securizată SSL</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 200;
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 380px;
      max-width: 95vw;
      background: #fff;
      z-index: 201;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.18);
      transform: translateX(100%);
      transition: transform 0.28s ease;
    }

    .drawer--open { transform: translateX(0); }

    /* Header */
    .drawer__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--rw-border);
      background: var(--rw-dark);
    }

    .drawer__title {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 3px;
    }

    .drawer__sub {
      color: rgba(255,255,255,0.45);
      font-size: 10px;
      letter-spacing: 1px;
      margin: 0;
    }

    .drawer__close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.6);
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }

    .drawer__close:hover { color: #fff; }

    /* Body */
    .drawer__body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    }

    .drawer__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px 0;
      color: var(--rw-muted);
      text-align: center;
    }

    /* Cart item */
    .cart-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid var(--rw-border);
    }

    .cart-item__img {
      width: 56px;
      height: 56px;
      border-radius: 6px;
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

    .cart-item__info { flex: 1; }

    .cart-item__name {
      font-size: 13px;
      font-weight: 600;
      color: var(--rw-text);
      margin: 0 0 4px;
    }

    .cart-item__price {
      font-size: 13px;
      color: var(--rw-orange);
      font-weight: 600;
      margin: 0 0 4px;
    }

    .cart-item__qty {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qty-badge {
      background: var(--rw-bg);
      border: 1px solid var(--rw-border);
      border-radius: 4px;
      padding: 2px 10px;
      font-size: 13px;
      font-weight: 600;
    }

    .cart-item__sub {
      font-size: 11px;
      color: var(--rw-muted);
    }

    .cart-item__remove {
      background: none;
      border: none;
      color: var(--rw-muted);
      font-size: 13px;
      cursor: pointer;
      padding: 4px;
      flex-shrink: 0;
    }

    .cart-item__remove:hover { color: #ef4444; }

    /* Footer */
    .drawer__footer {
      padding: 16px 24px 24px;
      border-top: 1px solid var(--rw-border);
      background: var(--rw-bg);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .summary-row--muted { color: var(--rw-muted); }

    .summary-row--total {
      font-size: 16px;
      font-weight: 700;
      margin: 12px 0;
      padding-top: 12px;
      border-top: 2px solid var(--rw-border);
    }

    .text-green { color: #16a34a; font-weight: 600; }

    .btn-cta {
      width: 100%;
      padding: 14px;
      background: var(--rw-orange);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background .15s;
    }

    .btn-cta:hover { background: var(--rw-orange-h); }

    .btn-outline {
      padding: 10px 20px;
      border: 1px solid var(--rw-orange);
      background: none;
      color: var(--rw-orange);
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }

    .drawer__secure {
      text-align: center;
      font-size: 11px;
      color: var(--rw-muted);
      margin: 10px 0 0;
    }
  `],
})
export class CartDrawerComponent {
  readonly cart   = inject(CartService);
  private  router = inject(Router);

  removeItem(itemId: number): void {
    this.cart.removeItem(itemId).subscribe();
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
