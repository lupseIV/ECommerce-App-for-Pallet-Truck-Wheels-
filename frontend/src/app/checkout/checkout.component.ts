import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../core/services/cart.service';
import { OrderService } from '../core/services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="checkout-page">

      <!-- Left: Form -->
      <div class="checkout-form">
        <nav class="breadcrumb">
          <span>Coș</span><span class="bc-sep">›</span>
          <span>Livrare</span><span class="bc-sep">›</span>
          <span class="bc-active">Plată</span>
        </nav>

        <form [formGroup]="form" (ngSubmit)="submit()">

          <!-- Section 1: Delivery -->
          <section class="form-section">
            <h2 class="form-section__title">
              <span class="form-section__num">1</span> Informații Livrare
            </h2>

            <div class="field-row">
              <div class="field">
                <label class="field__label">NUME</label>
                <input class="field__input" formControlName="firstName" placeholder="Popescu" />
              </div>
              <div class="field">
                <label class="field__label">PRENUME</label>
                <input class="field__input" formControlName="lastName" placeholder="Andrei" />
              </div>
            </div>

            <div class="field">
              <label class="field__label">ADRESĂ DE LIVRARE</label>
              <input class="field__input" formControlName="deliveryAddress"
                     placeholder="Strada, Număr, Bloc, Apartament" />
            </div>

            <div class="field-row">
              <div class="field">
                <label class="field__label">ORAȘ</label>
                <input class="field__input" formControlName="city" placeholder="București" />
              </div>
              <div class="field">
                <label class="field__label">JUDEȚ</label>
                <input class="field__input" formControlName="county" placeholder="Ilfov" />
              </div>
            </div>

            <div class="field">
              <label class="field__label">TELEFON</label>
              <input class="field__input" formControlName="phone" placeholder="+40 722 000 000" />
            </div>
          </section>

          <!-- Section 2: Payment — UC-12 Process Payment -->
          <section class="form-section">
            <h2 class="form-section__title">
              <span class="form-section__num">2</span> Metodă de Plată
            </h2>

            <label class="payment-option" [class.payment-option--active]="form.value.paymentMethod === 'CARD'">
              <input type="radio" formControlName="paymentMethod" value="CARD" />
              <div class="payment-option__body">
                <span class="payment-option__name">Card Online (Plată Securizată)</span>
                <span class="payment-option__desc">MasterCard, Visa, Maestro</span>
              </div>
              <span class="payment-option__icon">💳</span>
            </label>

            <!-- UC-12 Flow §2: card details shown when CARD is selected -->
            @if (form.value.paymentMethod === 'CARD') {
              <div class="card-details">
                <div class="field">
                  <label class="field__label">NUMĂR CARD</label>
                  <input class="field__input" formControlName="cardNumber"
                         placeholder="1234 5678 9012 3456" maxlength="19"
                         autocomplete="cc-number" inputmode="numeric" />
                </div>
                <div class="field-row">
                  <div class="field">
                    <label class="field__label">DATA EXPIRARE</label>
                    <input class="field__input" formControlName="cardExpiry"
                           placeholder="MM/AA" maxlength="5" autocomplete="cc-exp" />
                  </div>
                  <div class="field">
                    <label class="field__label">CVV</label>
                    <input class="field__input" formControlName="cardCvv"
                           placeholder="•••" maxlength="4"
                           type="password" autocomplete="cc-csc" />
                  </div>
                </div>
                <p class="card-details__note">
                  🔒 Datele cardului sunt procesate securizat și nu sunt stocate de noi.
                </p>
              </div>
            }

            <label class="payment-option" [class.payment-option--active]="form.value.paymentMethod === 'B2B'">
              <input type="radio" formControlName="paymentMethod" value="B2B" />
              <div class="payment-option__body">
                <span class="payment-option__name">Ordin de Plată (B2B)</span>
                <span class="payment-option__desc">Livrare după confirmarea plății prin bancă</span>
              </div>
              <span class="payment-option__icon">🏦</span>
            </label>

            <label class="payment-option" [class.payment-option--active]="form.value.paymentMethod === 'RAMBURS'">
              <input type="radio" formControlName="paymentMethod" value="RAMBURS" />
              <div class="payment-option__body">
                <span class="payment-option__name">Ramburs la Livrare</span>
                <span class="payment-option__desc">Plată numerar către curier</span>
              </div>
              <span class="payment-option__icon">📦</span>
            </label>
          </section>

          @if (errorMessage()) {
            <div class="alert-error">{{ errorMessage() }}</div>
          }

        </form>
      </div>

      <!-- Right: Order summary -->
      <aside class="checkout-summary">
        <h3 class="summary__title">Sumar Comandă</h3>

        @if (cart.cart()) {
          <div class="summary__items">
            @for (item of cart.cart()!.items; track item.id) {
              <div class="summary__item">
                <div class="summary__item-img">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.name" />
                  } @else {
                    <div class="summary__item-placeholder"></div>
                  }
                </div>
                <div class="summary__item-info">
                  <p class="summary__item-name">{{ item.name }}</p>
                  <p class="summary__item-qty">{{ item.quantity }} × {{ item.unitPrice | number:'1.2-2' }} Lei</p>
                </div>
              </div>
            }
          </div>

          <div class="summary__totals">
            <div class="summary-row">
              <span>Subtotal (fără TVA)</span>
              <span>{{ (cart.cart()!.total / 1.19) | number:'1.2-2' }} Lei</span>
            </div>
            <div class="summary-row">
              <span>TVA (19%)</span>
              <span>{{ (cart.cart()!.total - cart.cart()!.total / 1.19) | number:'1.2-2' }} Lei</span>
            </div>
            <div class="summary-row summary-row--muted">
              <span>Livrare Curier</span>
              <span class="text-green">Gratuit</span>
            </div>
            <div class="summary-row summary-row--total">
              <span>TOTAL</span>
              <span>{{ cart.cart()!.total | number:'1.2-2' }} Lei</span>
            </div>
          </div>

          <button class="btn-place" (click)="submit()" [disabled]="loading()">
            @if (loading()) { Se procesează… } @else { PLASEAZĂ COMANDA 🔒 }
          </button>
          <p class="summary__secure">Plată securizată SSL. Datele dvs. sunt protejate prin criptare avansată.</p>
        }
      </aside>

    </div>
  `,
  styles: [`
    .checkout-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 24px;
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 32px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .checkout-page { grid-template-columns: 1fr; }
      .checkout-summary { order: -1; }
    }

    /* Breadcrumb */
    .breadcrumb {
      font-size: 13px;
      color: var(--rw-muted);
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bc-sep { color: var(--rw-border); }
    .bc-active { color: var(--rw-text); font-weight: 600; }

    /* Form sections */
    .form-section {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .form-section__title {
      font-size: 16px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-section__num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--rw-orange);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 16px; }

    .field__label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--rw-muted);
      margin-bottom: 6px;
    }

    .field__input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--rw-border);
      border-radius: 6px;
      font-size: 14px;
      color: var(--rw-text);
      outline: none;
      font-family: inherit;
      transition: border-color .15s;
    }

    .field__input:focus {
      border-color: var(--rw-orange);
      box-shadow: 0 0 0 3px rgba(232,96,28,.10);
    }

    /* Payment options */
    .payment-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border: 1px solid var(--rw-border);
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 10px;
      transition: border-color .15s;
    }

    .payment-option input[type="radio"] { accent-color: var(--rw-orange); }
    .payment-option--active { border-color: var(--rw-orange); background: rgba(232,96,28,.04); }

    /* UC-12: Card details section */
    .card-details {
      background: #f8f9fb;
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 10px;
    }

    .card-details__note {
      font-size: 11px;
      color: var(--rw-muted);
      margin: 8px 0 0;
    }

    .payment-option__body { flex: 1; }
    .payment-option__name { display: block; font-size: 14px; font-weight: 600; color: var(--rw-text); }
    .payment-option__desc { display: block; font-size: 12px; color: var(--rw-muted); margin-top: 2px; }
    .payment-option__icon { font-size: 20px; }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 13px;
      margin-top: 8px;
    }

    /* Summary */
    .checkout-summary {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      padding: 24px;
      position: sticky;
      top: 80px;
    }

    .summary__title {
      font-size: 16px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--rw-border);
    }

    .summary__items { margin-bottom: 20px; }

    .summary__item {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
    }

    .summary__item-img {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--rw-dark-card);
    }

    .summary__item-img img { width: 100%; height: 100%; object-fit: cover; }
    .summary__item-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #0d1422, #1a2140); }

    .summary__item-name { font-size: 12px; font-weight: 600; color: var(--rw-text); margin: 0 0 3px; }
    .summary__item-qty { font-size: 11px; color: var(--rw-muted); margin: 0; }

    .summary__totals { border-top: 1px solid var(--rw-border); padding-top: 16px; }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 8px;
      color: var(--rw-text);
    }

    .summary-row--muted { color: var(--rw-muted); }
    .summary-row--total {
      font-size: 17px;
      font-weight: 700;
      margin: 14px 0;
      padding-top: 12px;
      border-top: 2px solid var(--rw-border);
    }

    .text-green { color: #16a34a; font-weight: 600; }

    .btn-place {
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
      letter-spacing: 0.5px;
    }

    .btn-place:hover:not(:disabled) { background: var(--rw-orange-h); }
    .btn-place:disabled { opacity: .6; cursor: not-allowed; }

    .summary__secure {
      font-size: 10px;
      color: var(--rw-muted);
      text-align: center;
      margin: 10px 0 0;
      line-height: 1.5;
    }
  `],
})
export class CheckoutComponent implements OnInit {
  readonly cart         = inject(CartService);
  private  orderService = inject(OrderService);
  private  router       = inject(Router);
  private  fb           = inject(FormBuilder);

  readonly loading      = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    deliveryAddress: ['', Validators.required],
    city:            ['', Validators.required],
    county:          ['', Validators.required],
    phone:           ['', Validators.required],
    paymentMethod:   ['CARD' as 'CARD' | 'B2B' | 'RAMBURS', Validators.required],
    // UC-12: card detail fields (required only when CARD method selected)
    cardNumber:      [''],
    cardExpiry:      [''],
    cardCvv:         [''],
  });

  ngOnInit(): void {
    if (!this.cart.cart()) {
      this.cart.load();
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.cart.cart() || this.cart.cart()!.items.length === 0) {
      this.errorMessage.set('Coșul este gol. Adăugați produse înainte de a finaliza comanda.');
      return;
    }
    // UC-12 Flow §2: validate card details when CARD method is selected
    if (this.form.value.paymentMethod === 'CARD') {
      const { cardNumber, cardExpiry, cardCvv } = this.form.value;
      if (!cardNumber || !cardExpiry || !cardCvv) {
        this.errorMessage.set('Completați toate datele cardului pentru plata online.');
        return;
      }
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const v = this.form.value;
    this.orderService.checkout({
      firstName: v.firstName!,
      lastName:  v.lastName!,
      deliveryAddress: v.deliveryAddress!,
      city:      v.city!,
      county:    v.county!,
      phone:     v.phone!,
      paymentMethod: v.paymentMethod!,
    }).subscribe({
      next: (confirmation) => {
        this.cart.reset();
        this.router.navigate(['/orders'], { queryParams: { confirmed: confirmation.orderId } });
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error ?? 'A apărut o eroare. Vă rugăm să reîncercați.');
        this.loading.set(false);
      },
    });
  }
}
