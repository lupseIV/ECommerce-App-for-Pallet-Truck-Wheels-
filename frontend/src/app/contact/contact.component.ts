import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '../core/services/support.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="contact-page">
      <div class="contact-card">

        <div class="contact-card__header">
          <h1 class="contact-card__title">Asistență Tehnică</h1>
          <p class="contact-card__sub">
            Aveți nevoie de roți personalizate sau o soluție specială?
            Completați formularul și vă vom contacta în cel mai scurt timp.
          </p>
        </div>

        @if (success()) {
          <div class="alert-success">
            ✓ Mesajul dvs. a fost trimis. Vă vom răspunde în curând!
          </div>
        } @else {

          <form [formGroup]="form" (ngSubmit)="submit()" class="contact-form">

            <div class="field-row">
              <div class="field">
                <label class="field__label">NUME COMPLET</label>
                <input class="field__input"
                       [class.field__input--err]="form.controls.name.invalid && form.controls.name.touched"
                       formControlName="name" placeholder="Ion Popescu" />
              </div>
              <div class="field">
                <label class="field__label">ADRESĂ EMAIL</label>
                <input class="field__input" type="email"
                       [class.field__input--err]="form.controls.email.invalid && form.controls.email.touched"
                       formControlName="email" placeholder="ion@companie.ro" />
              </div>
            </div>

            <div class="field">
              <label class="field__label">MESAJ</label>
              <textarea class="field__input field__textarea"
                        [class.field__input--err]="form.controls.message.invalid && form.controls.message.touched"
                        formControlName="message"
                        placeholder="Descrieți soluția de care aveți nevoie: dimensiuni, capacitate de încărcare, material preferat...">
              </textarea>
            </div>

            @if (errorMessage()) {
              <div class="alert-error">{{ errorMessage() }}</div>
            }

            <div class="contact-form__footer">
              <div class="contact-info">
                <p class="contact-info__item">📞 +40 722 000 000</p>
                <p class="contact-info__item">🕐 Luni–Vineri, 08:00–17:00</p>
              </div>
              <button class="btn-cta" type="submit" [disabled]="loading() || form.invalid">
                {{ loading() ? 'Se trimite…' : 'Trimite Mesaj →' }}
              </button>
            </div>

          </form>
        }

      </div>
    </div>
  `,
  styles: [`
    .contact-page {
      max-width: 680px;
      margin: 48px auto;
      padding: 0 24px;
    }

    .contact-card {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 10px;
      overflow: hidden;
    }

    .contact-card__header {
      background: var(--rw-dark);
      padding: 28px 32px;
    }

    .contact-card__title {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .contact-card__sub {
      color: rgba(255,255,255,0.60);
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }

    .alert-success {
      background: #f0fdf4;
      border-bottom: 1px solid #86efac;
      color: #16a34a;
      padding: 20px 32px;
      font-size: 14px;
      font-weight: 600;
    }

    .contact-form {
      padding: 28px 32px;
    }

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
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

    .field__input:focus { border-color: var(--rw-orange); box-shadow: 0 0 0 3px rgba(232,96,28,.10); }
    .field__input--err { border-color: #ef4444; }

    .field__textarea {
      resize: vertical;
      min-height: 130px;
    }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .contact-form__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .contact-info__item {
      font-size: 12px;
      color: var(--rw-muted);
      margin: 0 0 4px;
    }

    .btn-cta {
      padding: 12px 28px;
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

    .btn-cta:hover:not(:disabled) { background: var(--rw-orange-h); }
    .btn-cta:disabled { opacity: .55; cursor: not-allowed; }

    @media (max-width: 600px) {
      .field-row { grid-template-columns: 1fr; }
      .contact-form__footer { flex-direction: column; gap: 16px; }
    }
  `],
})
export class ContactComponent {
  private supportService = inject(SupportService);
  private fb             = inject(FormBuilder);

  readonly loading      = signal(false);
  readonly success      = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set(null);

    const v = this.form.value;
    this.supportService.sendMessage({
      name:    v.name!,
      email:   v.email!,
      message: v.message!,
    }).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: err => {
        this.errorMessage.set(err.error?.error ?? 'Eroare la trimitere. Reîncercați.');
        this.loading.set(false);
      },
    });
  }
}
