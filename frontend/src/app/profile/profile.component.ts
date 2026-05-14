import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../core/services/account.service';
import { UserProfile } from '../core/models/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-card">
        <div class="profile-card__header">
          <div class="profile-avatar">
            {{ initials() }}
          </div>
          <div>
            <h2 class="profile-card__name">Salut, {{ profile()?.username }}!</h2>
            <p class="profile-card__email">{{ profile()?.email }}</p>
          </div>
          <span class="profile-card__role" [class.profile-card__role--admin]="profile()?.role === 'ADMIN'">
            {{ profile()?.role === 'ADMIN' ? 'Administrator' : 'Client' }}
          </span>
        </div>

        @if (successMessage()) {
          <div class="alert-success">✓ {{ successMessage() }}</div>
        }

        @if (errorMessage()) {
          <div class="alert-error">{{ errorMessage() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="save()" class="profile-form">
          <h3 class="section-title">Actualizare Date Personale</h3>

          <div class="field">
            <label class="field__label">ADRESĂ EMAIL</label>
            <input class="field__input" formControlName="email" type="email"
                   [placeholder]="profile()?.email ?? 'email@example.com'" />
          </div>

          <div class="field">
            <label class="field__label">ADRESĂ DE FACTURARE / LIVRARE</label>
            <input class="field__input" formControlName="billingAddress"
                   [placeholder]="profile()?.billingAddress ?? 'Strada, Număr, Oraș'" />
          </div>

          <button class="btn-save" type="submit" [disabled]="saving()">
            {{ saving() ? 'Se salvează…' : 'Salvează Modificările' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      max-width: 600px;
      margin: 40px auto;
      padding: 0 24px;
    }

    .profile-card {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 10px;
      overflow: hidden;
    }

    .profile-card__header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: var(--rw-dark);
    }

    .profile-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--rw-orange);
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .profile-card__name {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 3px;
    }

    .profile-card__email {
      color: rgba(255,255,255,.55);
      font-size: 13px;
      margin: 0;
    }

    .profile-card__role {
      margin-left: auto;
      background: rgba(255,255,255,.12);
      color: rgba(255,255,255,.75);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 10px;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .profile-card__role--admin {
      background: var(--rw-orange);
      color: #fff;
    }

    .alert-success {
      background: #f0fdf4;
      border-bottom: 1px solid #86efac;
      color: #16a34a;
      padding: 12px 24px;
      font-size: 13px;
      font-weight: 600;
    }

    .alert-error {
      background: #fef2f2;
      border-bottom: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px 24px;
      font-size: 13px;
    }

    .profile-form {
      padding: 24px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 20px;
    }

    .field { margin-bottom: 18px; }

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

    .btn-save {
      padding: 11px 24px;
      background: var(--rw-orange);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background .15s;
    }

    .btn-save:hover:not(:disabled) { background: var(--rw-orange-h); }
    .btn-save:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class ProfileComponent implements OnInit {
  private accountService = inject(AccountService);
  private fb             = inject(FormBuilder);

  readonly profile        = signal<UserProfile | null>(null);
  readonly saving         = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage   = signal<string | null>(null);

  readonly form = this.fb.group({
    email:          [''],
    billingAddress: [''],
  });

  readonly initials = () => {
    const u = this.profile()?.username ?? '?';
    return u.slice(0, 2).toUpperCase();
  };

  ngOnInit(): void {
    this.accountService.getProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.form.patchValue({ email: p.email, billingAddress: p.billingAddress ?? '' });
      },
    });
  }

  save(): void {
    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const v = this.form.value;
    this.accountService.updateProfile({
      email:          v.email || undefined,
      billingAddress: v.billingAddress || undefined,
    }).subscribe({
      next: updated => {
        this.profile.set(updated);
        this.successMessage.set('Datele au fost actualizate cu succes.');
        this.saving.set(false);
      },
      error: err => {
        this.errorMessage.set(err.error?.error ?? 'Eroare la salvare.');
        this.saving.set(false);
      },
    });
  }
}
