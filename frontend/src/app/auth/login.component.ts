import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatProgressSpinnerModule],
  template: `
    <div class="login-page">

      <!-- Left brand panel -->
      <div class="brand" aria-hidden="true">
        <div class="brand__top">
          <div class="brand__logo">
            <span class="brand__name">RO-WHEELS<br>INDUSTRIAL</span>
            <span class="brand__accent"></span>
          </div>
        </div>
        <div class="brand__quote">
          <p>"Precision is not an option, it is the
            <strong>foundation</strong> of industrial excellence."
          </p>
          <span class="brand__sub">PALLET TRUCK SOLUTIONS &amp; COMPONENTS</span>
        </div>
        <span class="brand__footer">RO-Wheels Industrial S.R.L.</span>
      </div>

      <!-- Right form panel -->
      <div class="panel">
        <div class="panel__tabs" role="tablist">
          <button class="tab tab--active" role="tab" aria-selected="true">Autentificare</button>
          <button class="tab" role="tab" aria-selected="false" disabled
                  aria-label="Cont Nou B2B — în curând disponibil">
            Cont Nou B2B
          </button>
        </div>

        <div class="panel__body">
          <h1 class="panel__title">Bine ați revenit</h1>
          <p class="panel__subtitle" id="form-desc">
            Introduceți datele pentru a accesa platforma industrială.
          </p>

          <form
            [formGroup]="form"
            (ngSubmit)="submit()"
            aria-describedby="form-desc"
            novalidate
          >
            <div class="field">
              <label class="field__label" for="username">ADRESĂ EMAIL / UTILIZATOR</label>
              <input
                id="username"
                class="field__input"
                [class.field__input--err]="isInvalid('username')"
                formControlName="username"
                autocomplete="username"
                placeholder="name@company.ro"
                [attr.aria-invalid]="isInvalid('username')"
                aria-describedby="username-err"
              />
              <span id="username-err" class="field__err" role="alert"
                    [class.field__err--visible]="isInvalid('username')">
                Câmpul este obligatoriu.
              </span>
            </div>

            <div class="field">
              <div class="field__row">
                <label class="field__label" for="password">PAROLĂ</label>
                <button
                  type="button"
                  class="field__link-btn"
                  (click)="forgotPassword()"
                >Ai uitat parola?</button>
              </div>
              <input
                id="password"
                class="field__input"
                [class.field__input--err]="isInvalid('password')"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="••••••••"
                [attr.aria-invalid]="isInvalid('password')"
                aria-describedby="password-err"
              />
              <span id="password-err" class="field__err" role="alert"
                    [class.field__err--visible]="isInvalid('password')">
                Câmpul este obligatoriu.
              </span>
            </div>

            @if (isLocked()) {
              <!-- UC-2.E2: Account locked — terminate use case, no retry -->
              <div class="alert alert--locked" role="alert" aria-live="assertive">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <div>
                  <strong>Cont blocat temporar</strong>
                  <p>{{ errorMessage() }}</p>
                  <p>Contactați suportul la suport&#64;ro-wheels.ro pentru deblocare.</p>
                </div>
              </div>
            } @else if (errorMessage()) {
              <!-- UC-2.E1: Invalid credentials -->
              <div class="alert" role="alert" aria-live="assertive">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ errorMessage() }}
              </div>
            }

            <button class="btn-cta" type="submit" [disabled]="loading() || isLocked()">
              @if (loading()) {
                <mat-spinner diameter="18" />
                <span>Se autentifică…</span>
              } @else {
                ACCESEAZĂ CONTUL
              }
            </button>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ── Page shell ── */
    .login-page {
      display: flex;
      min-height: 100vh;
    }

    /* ── Brand panel (left) ── */
    .brand {
      width: 38%;
      min-width: 280px;
      background: var(--rw-dark);
      display: flex;
      flex-direction: column;
      padding: 44px 52px;
      position: relative;
      overflow: hidden;
    }

    .brand::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 25% 35%, rgba(232,96,28,.10) 0%, transparent 55%),
        radial-gradient(ellipse at 75% 75%, rgba(255,255,255,.03) 0%, transparent 50%);
      pointer-events: none;
    }

    .brand__top { position: relative; }
    .brand__logo { display: flex; flex-direction: column; gap: var(--sp-1); }

    .brand__name {
      color: #fff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1.2px;
      line-height: 1.25;
    }

    .brand__accent {
      display: block;
      width: 36px;
      height: 3px;
      background: var(--rw-orange);
      margin-top: var(--sp-2);
    }

    .brand__quote {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: var(--sp-5);
    }

    .brand__quote p {
      color: rgba(255,255,255,.70);
      font-size: 15px;
      font-style: italic;
      line-height: 1.75;
      margin: 0 0 14px;
    }

    .brand__quote strong { color: var(--rw-orange); font-style: normal; }

    .brand__sub {
      color: rgba(255,255,255,.28);
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .brand__footer {
      position: relative;
      color: rgba(255,255,255,.30);
      font-size: 11px;
    }

    /* ── Form panel (right) ── */
    .panel {
      flex: 1;
      background: var(--rw-white);
      display: flex;
      flex-direction: column;
    }

    .panel__tabs {
      display: flex;
      padding: 0 52px;
      border-bottom: 1px solid var(--rw-border);
    }

    .tab {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      margin-right: 28px;
      padding: 18px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--rw-muted);
      cursor: pointer;
      font-family: inherit;
      transition: color var(--t-fast), border-color var(--t-fast);
    }

    .tab--active {
      color: var(--rw-orange);
      border-bottom-color: var(--rw-orange);
      font-weight: 600;
    }

    .tab:disabled { opacity: .35; cursor: default; }

    .panel__body {
      flex: 1;
      padding: 52px;
      max-width: 500px;
    }

    .panel__title {
      font-size: 26px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 var(--sp-2);
    }

    .panel__subtitle {
      font-size: 14px;
      color: var(--rw-muted);
      margin: 0 0 36px;
      line-height: 1.6;
    }

    /* ── Fields ── */
    .field { margin-bottom: var(--sp-5); }

    .field__label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.9px;
      color: var(--rw-muted);
      margin-bottom: var(--sp-2);
      text-transform: uppercase;
    }

    .field__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sp-2);
    }

    /* Forgot password — button, not link, as it doesn't navigate */
    .field__link-btn {
      background: none;
      border: none;
      font-size: 12px;
      color: var(--rw-orange);
      cursor: pointer;
      font-family: inherit;
      padding: 0;
      transition: text-decoration var(--t-fast);
    }

    .field__link-btn:hover { text-decoration: underline; }

    .field__input {
      width: 100%;
      padding: 11px var(--sp-4);
      border: 1px solid var(--rw-border);
      border-radius: var(--r-md);
      font-size: 14px;
      color: var(--rw-text);
      background: #fff;
      outline: none;
      font-family: inherit;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .field__input:focus {
      border-color: var(--rw-orange);
      box-shadow: 0 0 0 3px rgba(232,96,28,.12);
    }

    .field__input--err { border-color: var(--rw-error); }
    .field__input--err:focus { box-shadow: 0 0 0 3px rgba(220,38,38,.12); }

    .field__err {
      display: block;
      font-size: 12px;
      color: var(--rw-error);
      margin-top: var(--sp-1);
      /* Hidden by default to avoid layout shift */
      visibility: hidden;
      height: 0;
      overflow: hidden;
    }

    .field__err--visible {
      visibility: visible;
      height: auto;
    }

    /* ── Error alert ── */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-2);
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: var(--rw-error);
      border-radius: var(--r-md);
      padding: 12px 14px;
      font-size: 13px;
      margin-bottom: var(--sp-5);
      line-height: 1.5;
    }

    /* UC-2.E2 — distinct locked state */
    .alert--locked {
      background: #fdf4ff;
      border-color: #e9d5ff;
      color: #6b21a8;
    }

    .alert--locked strong { display: block; margin-bottom: 4px; }
    .alert--locked p { margin: 2px 0; font-size: 12px; }

    /* ── CTA button ── */
    .btn-cta {
      width: 100%;
      padding: 13px;
      background: var(--rw-orange);
      color: #fff;
      border: none;
      border-radius: var(--r-md);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.2px;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      transition: background var(--t-fast), opacity var(--t-fast);
      margin-top: var(--sp-1);
    }

    .btn-cta:hover:not(:disabled) { background: var(--rw-orange-h); }
    .btn-cta:disabled { opacity: .55; cursor: not-allowed; }

    @media (max-width: 720px) {
      .brand { display: none; }
      .panel__body { padding: 32px var(--sp-6); }
      .panel__tabs { padding: 0 var(--sp-6); }
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);
  private readonly fb          = inject(FormBuilder);

  readonly loading      = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isLocked     = signal(false);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  isInvalid(field: 'username' | 'password'): boolean {
    const ctrl = this.form.controls[field];
    return ctrl.invalid && ctrl.touched;
  }

  forgotPassword(): void {
    alert('Contactați administratorul la suport@ro-wheels.ro pentru resetarea parolei.');
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.isLocked.set(false);
    this.authService
      .login({ username: this.form.value.username!, password: this.form.value.password! })
      .subscribe({
        next: () => {
          // UC-9→UC-2 include: honour returnUrl (e.g. /checkout) set by authGuard
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else {
            // UC-2 Flow §6: role-appropriate redirect
            const destination = this.authService.isAdmin() ? '/admin' : '/products';
            this.router.navigate([destination]);
          }
        },
        error: (err) => {
          // UC-2.E2: HTTP 422 = account locked — distinct UI treatment, no retry
          if (err.status === 422) {
            this.isLocked.set(true);
            this.errorMessage.set(err.error?.error ?? 'Contul este blocat temporar.');
            this.form.disable();
          } else {
            this.errorMessage.set(err.error?.error ?? 'Autentificare eșuată. Vă rugăm să încercați din nou.');
          }
          this.loading.set(false);
        },
      });
  }
}
