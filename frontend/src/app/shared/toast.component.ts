import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div
      class="toast-region"
      role="region"
      aria-label="Notificări"
      aria-live="polite"
      aria-atomic="true"
    >
      @if (toast.toast(); as t) {
        <div
          class="toast"
          [class]="'toast--' + t.type"
          role="alert"
        >
          <span class="toast__icon" aria-hidden="true">
            @if (t.type === 'success') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            }
            @if (t.type === 'error') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            }
            @if (t.type === 'info') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            }
          </span>
          <span class="toast__message">{{ t.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-region {
      position: fixed;
      top: 76px;
      right: var(--sp-6);
      z-index: 9999;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: 13px var(--sp-5);
      border-radius: var(--r-md);
      font-size: 14px;
      font-weight: 500;
      box-shadow: var(--shadow-lg);
      animation: slide-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      min-width: 220px;
      max-width: 360px;
      line-height: 1.4;
    }

    .toast--success { background: #166534; color: #fff; }
    .toast--error   { background: #991b1b; color: #fff; }
    .toast--info    { background: var(--rw-dark); color: #fff; }

    .toast__icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .toast__message { flex: 1; }

    @keyframes slide-in {
      from { transform: translateX(calc(100% + var(--sp-6))); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }

    @media (max-width: 480px) {
      .toast-region {
        right: var(--sp-3);
        left: var(--sp-3);
      }
      .toast { max-width: 100%; }
    }
  `],
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
