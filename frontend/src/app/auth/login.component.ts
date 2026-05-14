import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
      <div class="brand">
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
        <div class="panel__tabs">
          <button class="tab tab--active">Autentificare</button>
          <button class="tab" disabled>Cont Nou B2B</button>
        </div>

        <div class="panel__body">
          <h1 class="panel__title">Bine ați revenit</h1>
          <p class="panel__subtitle">
            Introduceți datele pentru a accesa platforma industrială.
          </p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="field">
              <label class="field__label">ADRESĂ EMAIL / UTILIZATOR</label>
              <input
                class="field__input"
                [class.field__input--err]="form.controls.username.invalid && form.controls.username.touched"
                formControlName="username"
                autocomplete="username"
                placeholder="name@company.ro"
              />
              @if (form.controls.username.invalid && form.controls.username.touched) {
                <span class="field__err">Câmpul este obligatoriu.</span>
              }
            </div>

            <div class="field">
              <div class="field__row">
                <label class="field__label">PAROLĂ</label>
                <a href="#" class="field__link">Ai uitat parola?</a>
              </div>
              <input
                class="field__input"
                [class.field__input--err]="form.controls.password.invalid && form.controls.password.touched"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="••••••••"
              />
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <span class="field__err">Câmpul este obligatoriu.</span>
              }
            </div>

            @if (errorMessage()) {
              <div class="alert">{{ errorMessage() }}</div>
            }

            <button class="btn-cta" type="submit" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
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

    .brand__logo { display: flex; flex-direction: column; gap: 4px; }

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
      margin-top: 8px;
    }

    .brand__quote {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 20px;
    }

    .brand__quote p {
      color: rgba(255,255,255,.70);
      font-size: 15px;
      font-style: italic;
      line-height: 1.75;
      margin: 0 0 14px;
    }

    .brand__quote strong {
      color: var(--rw-orange);
      font-style: normal;
    }

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
      transition: color .15s, border-color .15s;
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
      margin: 0 0 8px;
    }

    .panel__subtitle {
      font-size: 14px;
      color: var(--rw-muted);
      margin: 0 0 36px;
      line-height: 1.55;
    }

    /* ── Fields ── */
    .field { margin-bottom: 22px; }

    .field__label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--rw-muted);
      margin-bottom: 6px;
    }

    .field__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .field__link {
      font-size: 12px;
      color: var(--rw-orange);
      text-decoration: none;
    }

    .field__link:hover { text-decoration: underline; }

    .field__input {
      width: 100%;
      padding: 11px 16px;
      border: 1px solid var(--rw-border);
      border-radius: 6px;
      font-size: 14px;
      color: var(--rw-text);
      background: #fff;
      outline: none;
      font-family: inherit;
      transition: border-color .15s, box-shadow .15s;
    }

    .field__input:focus {
      border-color: var(--rw-orange);
      box-shadow: 0 0 0 3px rgba(232,96,28,.12);
    }

    .field__input--err { border-color: #ef4444; }

    .field__err {
      display: block;
      font-size: 12px;
      color: #ef4444;
      margin-top: 5px;
    }

    .alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 18px;
    }

    /* ── CTA button ── */
    .btn-cta {
      width: 100%;
      padding: 13px;
      background: var(--rw-orange);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.2px;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background .15s;
      margin-top: 4px;
    }

    .btn-cta:hover:not(:disabled) { background: var(--rw-orange-h); }
    .btn-cta:disabled { opacity: .55; cursor: not-allowed; }

    @media (max-width: 720px) {
      .brand { display: none; }
      .panel__body { padding: 32px 24px; }
      .panel__tabs { padding: 0 24px; }
    }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router     = inject(Router);
  private readonly fb         = inject(FormBuilder);

  readonly loading      = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.authService
      .login({ username: this.form.value.username!, password: this.form.value.password! })
      .subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => {
          this.errorMessage.set(err.error?.error ?? 'Autentificare eșuată. Vă rugăm să încercați din nou.');
          this.loading.set(false);
        },
      });
  }
}
