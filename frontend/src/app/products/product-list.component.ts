import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../core/services/product.service';
import { CartService } from '../core/services/cart.service';
import { ProductFilterComponent } from './product-filter.component';
import { Product, ProductFilter } from '../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DecimalPipe, MatProgressSpinnerModule, ProductFilterComponent],
  template: `
    <div class="catalog">

      <!-- Left sidebar -->
      <aside class="catalog__sidebar">
        <app-product-filter (filterChange)="onFilterChange($event)" />
      </aside>

      <!-- Main content -->
      <main class="catalog__main">
        <div class="catalog__header">
          <div>
            <h1 class="catalog__title">Rotițe Transpalet</h1>
            <p class="catalog__count">
              {{ products().length }} produse găsite în catalog
            </p>
          </div>
        </div>

        @if (loading()) {
          <div class="catalog__spinner">
            <mat-spinner diameter="48" />
          </div>
        } @else if (error()) {
          <div class="catalog__empty">
            <p>Nu s-au putut încărca produsele. Vă rugăm să reîncercați.</p>
          </div>
        } @else if (products().length === 0) {
          <div class="catalog__empty">
            <p>Nu au fost găsite produse pentru filtrele selectate.</p>
            <small>Modificați criteriile de filtrare și reîncercați.</small>
          </div>
        } @else {
          <div class="product-grid">
            @for (p of products(); track p.id) {
              <article class="product-card">
                <div class="product-card__img">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" />
                  } @else {
                    <div class="product-card__placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
                        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
                        <line x1="12" y1="3" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="21"/>
                        <line x1="3" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="21" y2="12"/>
                      </svg>
                    </div>
                  }

                  <span class="product-card__type" [class.product-card__type--bearing]="p.type === 'BEARING'">
                    {{ p.type === 'WHEEL' ? 'ROATĂ' : 'RULMENT' }}
                  </span>

                  @if (p.stockQty < 10 && p.stockQty > 0) {
                    <span class="product-card__stock-warn">STOC CRITIC</span>
                  } @else if (p.stockQty === 0) {
                    <span class="product-card__stock-out">EPUIZAT</span>
                  }
                </div>

                <div class="product-card__body">
                  <h3 class="product-card__name">{{ p.name }}</h3>

                  <div class="product-card__specs">
                    @if (p.material) {
                      <span class="spec-chip">{{ p.material }}</span>
                    }
                    @if (p.size) {
                      <span class="spec-chip">{{ p.size }}</span>
                    }
                    @if (p.maxLoad) {
                      <span class="spec-chip">{{ p.maxLoad }} kg</span>
                    }
                    @if (p.diameter) {
                      <span class="spec-chip">Ø {{ p.diameter }}</span>
                    }
                    @if (p.bearingMaterial) {
                      <span class="spec-chip">{{ p.bearingMaterial }}</span>
                    }
                  </div>

                  <div class="product-card__footer">
                    <span class="product-card__price">
                      {{ p.price | number:'1.2-2' }} RON
                    </span>
                    <button
                      class="product-card__cart"
                      [class.product-card__cart--disabled]="p.stockQty === 0"
                      [disabled]="p.stockQty === 0"
                      (click)="addToCart(p)"
                      title="Adaugă în coș"
                    >
                      R
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </main>

    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .catalog {
      display: flex;
      min-height: calc(100vh - 60px);
    }

    /* ── Sidebar ── */
    .catalog__sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--rw-white);
      border-right: 1px solid var(--rw-border);
      overflow-y: auto;
    }

    /* ── Main ── */
    .catalog__main {
      flex: 1;
      padding: 32px 28px;
      overflow-y: auto;
    }

    .catalog__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .catalog__title {
      font-size: 22px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 4px;
    }

    .catalog__count {
      font-size: 13px;
      color: var(--rw-muted);
      margin: 0;
    }

    .catalog__spinner {
      display: flex;
      justify-content: center;
      padding: 80px 0;
    }

    .catalog__empty {
      text-align: center;
      padding: 80px 0;
      color: var(--rw-muted);
    }

    .catalog__empty p { font-size: 16px; margin: 0 0 8px; }
    .catalog__empty small { font-size: 13px; }

    /* ── Product grid ── */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }

    /* ── Product card ── */
    .product-card {
      background: var(--rw-white);
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: box-shadow .2s, transform .2s;
      cursor: default;
    }

    .product-card:hover {
      box-shadow: 0 6px 24px rgba(0,0,0,0.10);
      transform: translateY(-2px);
    }

    /* Card image area */
    .product-card__img {
      background: var(--rw-dark-card, #111827);
      height: 160px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .product-card__img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-card__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0d1422 0%, #1a2140 100%);
    }

    /* Badges */
    .product-card__type {
      position: absolute;
      top: 10px;
      left: 10px;
      background: var(--rw-orange);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.8px;
      padding: 3px 8px;
      border-radius: 3px;
    }

    .product-card__type--bearing {
      background: #2563EB;
    }

    .product-card__stock-warn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #DC2626;
      color: #fff;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.6px;
      padding: 3px 7px;
      border-radius: 3px;
    }

    .product-card__stock-out {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #6B7280;
      color: #fff;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.6px;
      padding: 3px 7px;
      border-radius: 3px;
    }

    /* Card body */
    .product-card__body {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-card__name {
      font-size: 14px;
      font-weight: 600;
      color: var(--rw-text);
      margin: 0 0 10px;
      line-height: 1.35;
    }

    .product-card__specs {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 14px;
      flex: 1;
    }

    .spec-chip {
      background: var(--rw-bg);
      color: var(--rw-muted);
      font-size: 10px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid var(--rw-border);
    }

    /* Card footer */
    .product-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .product-card__price {
      font-size: 16px;
      font-weight: 700;
      color: var(--rw-text);
    }

    .product-card__cart {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--rw-orange);
      color: #fff;
      border: none;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s;
      font-family: serif;
    }

    .product-card__cart:hover:not(:disabled) {
      background: var(--rw-orange-h);
    }

    .product-card__cart--disabled {
      background: var(--rw-border);
      color: var(--rw-muted);
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .catalog__sidebar { display: none; }
      .catalog__main { padding: 20px 16px; }
      .product-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
    }
  `],
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService    = inject(CartService);

  readonly products = signal<Product[]>([]);
  readonly loading  = signal(true);
  readonly error    = signal(false);

  private currentFilter: ProductFilter = {};

  ngOnInit(): void { this.loadProducts(); }

  onFilterChange(filter: ProductFilter): void {
    this.currentFilter = filter;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({ productId: product.id, qty: 1 }).subscribe({
      next: () => this.cartService.open(),
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(false);
    this.productService.getProducts(this.currentFilter).subscribe({
      next:  (products) => { this.products.set(products); this.loading.set(false); },
      error: ()         => { this.error.set(true);         this.loading.set(false); },
    });
  }
}
