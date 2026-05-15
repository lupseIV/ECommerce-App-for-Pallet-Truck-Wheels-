import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../core/services/product.service';
import { CartService } from '../core/services/cart.service';
import { ToastService } from '../shared/toast.service';
import { ProductFilterComponent } from './product-filter.component';
import { Product, ProductFilter } from '../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DecimalPipe, MatProgressSpinnerModule, ProductFilterComponent],
  template: `
    <div class="catalog">

      <!-- Mobile filter toggle -->
      <button
        class="catalog__filter-toggle"
        (click)="filterOpen.set(!filterOpen())"
        [attr.aria-expanded]="filterOpen()"
        aria-controls="filter-sidebar"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="4" y1="6"  x2="20" y2="6"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
          <line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
        {{ filterOpen() ? 'Ascunde filtrele' : 'Filtrează produse' }}
      </button>

      <!-- Sidebar -->
      <aside
        id="filter-sidebar"
        class="catalog__sidebar"
        [class.catalog__sidebar--open]="filterOpen()"
        aria-label="Filtre produse"
      >
        <app-product-filter (filterChange)="onFilterChange($event)" />
      </aside>

      <!-- Mobile overlay -->
      @if (filterOpen()) {
        <div class="catalog__sidebar-backdrop" (click)="filterOpen.set(false)" aria-hidden="true"></div>
      }

      <!-- Main content -->
      <main class="catalog__main">
        <header class="catalog__header">
          <div>
            <h1 class="catalog__title">Rotițe Transpalet</h1>
            <p class="catalog__count" aria-live="polite" aria-atomic="true">
              {{ products().length }} produse găsite în catalog
            </p>
          </div>
        </header>

        @if (loading()) {
          <div class="catalog__spinner" role="status" aria-label="Se încarcă produsele…">
            <mat-spinner diameter="48" />
          </div>
        } @else if (error()) {
          <div class="catalog__empty" role="alert">
            <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none"
                 stroke="var(--rw-border)" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>Nu s-au putut încărca produsele.</p>
            <button class="btn-retry" (click)="loadProducts()">Reîncercați</button>
          </div>
        } @else if (products().length === 0) {
          <div class="catalog__empty" role="status">
            <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none"
                 stroke="var(--rw-border)" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>Nu au fost găsite produse pentru filtrele selectate.</p>
            <small>Modificați criteriile de filtrare și reîncercați.</small>
          </div>
        } @else {
          <div class="product-grid" role="list" aria-label="Catalog produse">
            @for (p of products(); track p.id) {
              <article class="product-card" role="listitem">
                <div class="product-card__img">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
                  } @else {
                    <div class="product-card__placeholder" aria-hidden="true">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                           stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
                        <circle cx="12" cy="12" r="9"/>
                        <circle cx="12" cy="12" r="4"/>
                        <line x1="12" y1="3"  x2="12" y2="8"/>
                        <line x1="12" y1="16" x2="12" y2="21"/>
                        <line x1="3"  y1="12" x2="8"  y2="12"/>
                        <line x1="16" y1="12" x2="21" y2="12"/>
                      </svg>
                    </div>
                  }

                  <span
                    class="product-card__type"
                    [class.product-card__type--bearing]="p.type === 'BEARING'"
                  >
                    {{ p.type === 'WHEEL' ? 'ROATĂ' : 'RULMENT' }}
                  </span>

                  @if (p.stockQty < 10 && p.stockQty > 0) {
                    <span class="product-card__badge product-card__badge--warn">
                      STOC CRITIC
                    </span>
                  } @else if (p.stockQty === 0) {
                    <span class="product-card__badge product-card__badge--out">
                      EPUIZAT
                    </span>
                  }
                </div>

                <div class="product-card__body">
                  <h3 class="product-card__name">{{ p.name }}</h3>

                  <div class="product-card__specs" aria-label="Specificații">
                    @if (p.material)       { <span class="spec-chip">{{ p.material }}</span> }
                    @if (p.size)           { <span class="spec-chip">{{ p.size }}</span> }
                    @if (p.maxLoad)        { <span class="spec-chip">{{ p.maxLoad }} kg</span> }
                    @if (p.diameter)       { <span class="spec-chip">Ø {{ p.diameter }}</span> }
                    @if (p.bearingMaterial){ <span class="spec-chip">{{ p.bearingMaterial }}</span> }
                  </div>

                  <!-- UC-4: available stock displayed per spec -->
                  <div class="product-card__stock">
                    @if (p.stockQty === 0) {
                      <span class="stock-pill stock-pill--out">Epuizat</span>
                    } @else if (p.stockQty < 10) {
                      <span class="stock-pill stock-pill--low">{{ p.stockQty }} buc. rămase</span>
                    } @else {
                      <span class="stock-pill stock-pill--ok">{{ p.stockQty }} buc. în stoc</span>
                    }
                  </div>

                  <div class="product-card__footer">
                    <span class="product-card__price" aria-label="Preț: {{ p.price | number:'1.2-2' }} RON">
                      {{ p.price | number:'1.2-2' }} <span class="product-card__currency">RON</span>
                    </span>

                    <button
                      class="product-card__cart"
                      [class.product-card__cart--loading]="addingId() === p.id"
                      [class.product-card__cart--disabled]="p.stockQty === 0"
                      [disabled]="p.stockQty === 0 || addingId() === p.id"
                      (click)="addToCart(p)"
                      [attr.aria-label]="p.stockQty === 0
                        ? p.name + ' — epuizat'
                        : 'Adaugă în coș: ' + p.name"
                    >
                      @if (addingId() === p.id) {
                        <span class="cart-btn-spinner" aria-hidden="true"></span>
                      } @else {
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                      }
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
      position: relative;
    }

    /* ── Mobile filter toggle ── */
    .catalog__filter-toggle {
      display: none;
    }

    /* ── Sidebar ── */
    .catalog__sidebar {
      width: 252px;
      flex-shrink: 0;
      background: var(--rw-white);
      border-right: 1px solid var(--rw-border);
      overflow-y: auto;
    }

    .catalog__sidebar-backdrop {
      display: none;
    }

    /* ── Main ── */
    .catalog__main {
      flex: 1;
      padding: var(--sp-8) var(--sp-8);
      overflow-y: auto;
      min-width: 0;
    }

    .catalog__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--sp-8);
    }

    .catalog__title {
      font-size: 22px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 var(--sp-1);
    }

    .catalog__count {
      font-size: 13px;
      color: var(--rw-muted);
      margin: 0;
    }

    /* ── States ── */
    .catalog__spinner {
      display: flex;
      justify-content: center;
      padding: 80px 0;
    }

    .catalog__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-3);
      text-align: center;
      padding: 80px var(--sp-4);
      color: var(--rw-muted);
    }

    .catalog__empty p    { font-size: 16px; margin: 0; }
    .catalog__empty small { font-size: 13px; }

    .btn-retry {
      padding: 9px var(--sp-5);
      background: none;
      border: 1.5px solid var(--rw-orange);
      color: var(--rw-orange);
      border-radius: var(--r-md);
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background var(--t-fast), color var(--t-fast);
    }

    .btn-retry:hover { background: var(--rw-orange); color: #fff; }

    /* ── Product grid ── */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
      gap: var(--sp-5);
    }

    /* ── Product card ── */
    .product-card {
      background: var(--rw-white);
      border: 1px solid var(--rw-border);
      border-radius: var(--r-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: box-shadow var(--t-base), transform var(--t-base), border-color var(--t-base);
    }

    .product-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-3px);
      border-color: rgba(232,96,28,0.18);
    }

    /* Card image */
    .product-card__img {
      background: var(--rw-dark-card);
      height: 168px;
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
      transition: transform 0.4s ease;
    }

    .product-card:hover .product-card__img img {
      transform: scale(1.04);
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
      top: var(--sp-2);
      left: var(--sp-2);
      background: var(--rw-orange);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.6px;
      padding: 3px 9px;
      border-radius: var(--r-sm);
    }

    .product-card__type--bearing { background: #2563EB; }

    .product-card__badge {
      position: absolute;
      top: var(--sp-2);
      right: var(--sp-2);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: var(--r-sm);
      color: #fff;
    }

    .product-card__badge--warn { background: #DC2626; }
    .product-card__badge--out  { background: #6B7280; }

    /* Card body */
    .product-card__body {
      padding: var(--sp-4);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-card__name {
      font-size: 14px;
      font-weight: 600;
      color: var(--rw-text);
      margin: 0 0 var(--sp-3);
      line-height: 1.4;
    }

    .product-card__specs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-1);
      margin-bottom: var(--sp-4);
      flex: 1;
    }

    .spec-chip {
      background: var(--rw-bg);
      color: var(--rw-muted);
      font-size: 11px;
      font-weight: 500;
      padding: 3px 9px;
      border-radius: var(--r-full);
      border: 1px solid var(--rw-border);
    }

    /* Stock availability — UC-4 */
    .product-card__stock {
      margin-bottom: var(--sp-3);
    }

    .stock-pill {
      display: inline-flex;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 9px;
      border-radius: var(--r-full);
    }

    .stock-pill--ok  { background: #dcfce7; color: #166534; }
    .stock-pill--low { background: #fef3c7; color: #92400e; }
    .stock-pill--out { background: #fee2e2; color: #991b1b; }

    /* Card footer */
    .product-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-2);
    }

    .product-card__price {
      font-size: 17px;
      font-weight: 800;
      color: var(--rw-text);
      line-height: 1;
    }

    .product-card__currency {
      font-size: 12px;
      font-weight: 600;
      color: var(--rw-muted);
    }

    /* Add-to-cart button */
    .product-card__cart {
      width: 38px;
      height: 38px;
      border-radius: var(--r-full);
      background: var(--rw-orange);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background var(--t-fast), transform var(--t-fast), opacity var(--t-fast);
      font-family: inherit;
    }

    .product-card__cart:hover:not(:disabled) {
      background: var(--rw-orange-h);
      transform: scale(1.1);
    }

    .product-card__cart:active:not(:disabled) {
      transform: scale(0.96);
    }

    .product-card__cart--disabled {
      background: var(--rw-border);
      color: var(--rw-muted);
      cursor: not-allowed;
    }

    .product-card__cart--loading {
      cursor: wait;
      opacity: 0.75;
    }

    /* Inline spinner for add-to-cart loading state */
    .cart-btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: var(--r-full);
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .catalog {
        flex-direction: column;
      }

      /* Show mobile filter toggle */
      .catalog__filter-toggle {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-3) var(--sp-4);
        background: var(--rw-white);
        border: none;
        border-bottom: 1px solid var(--rw-border);
        color: var(--rw-text);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        width: 100%;
        transition: background var(--t-fast);
      }

      .catalog__filter-toggle:hover { background: var(--rw-bg); }

      /* Sidebar becomes a fixed drawer on mobile */
      .catalog__sidebar {
        position: fixed;
        inset: 60px 0 0 0;
        width: 300px;
        max-width: 85vw;
        z-index: 150;
        transform: translateX(-100%);
        transition: transform var(--t-base);
        box-shadow: var(--shadow-lg);
        overflow-y: auto;
      }

      .catalog__sidebar--open {
        transform: translateX(0);
      }

      .catalog__sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 60px 0 0;
        background: rgba(0,0,0,0.45);
        z-index: 149;
        animation: fade-in var(--t-fast);
      }

      @keyframes fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      .catalog__main {
        padding: var(--sp-5) var(--sp-4);
      }

      .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--sp-3);
      }

      .product-card__img { height: 136px; }
    }

    @media (max-width: 400px) {
      .product-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService    = inject(CartService);
  private readonly toastService   = inject(ToastService);

  readonly products   = signal<Product[]>([]);
  readonly loading    = signal(true);
  readonly error      = signal(false);
  readonly filterOpen = signal(false);
  readonly addingId   = signal<number | null>(null);

  private currentFilter: ProductFilter = {};

  ngOnInit(): void { this.loadProducts(); }

  onFilterChange(filter: ProductFilter): void {
    this.currentFilter = filter;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    if (this.addingId() !== null) return;
    this.addingId.set(product.id);
    this.cartService.addToCart({
      productId: product.id,
      qty:       1,
      name:      product.name,
      price:     product.price,
      imageUrl:  product.imageUrl,
    }).subscribe({
      next:  () => {
        this.toastService.show('Produs adăugat în coș!');
        this.addingId.set(null);
      },
      error: () => this.addingId.set(null),
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(false);
    this.productService.getProducts(this.currentFilter).subscribe({
      next:  (products) => { this.products.set(products); this.loading.set(false); },
      error: ()         => { this.error.set(true);         this.loading.set(false); },
    });
  }
}
