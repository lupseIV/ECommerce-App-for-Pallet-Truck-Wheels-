import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar.component';
import { CartDrawerComponent } from './cart/cart-drawer.component';
import { ToastComponent } from './shared/toast.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent, ToastComponent],
  template: `
    <a class="skip-link" href="#main-content">Sari la conținut principal</a>
    <app-navbar />
    <main id="main-content">
      <router-outlet />
    </main>
    <app-cart-drawer />
    <app-toast />
  `,
})
export class App {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.cart.load();
      } else {
        this.cart.reset();
      }
    }, { allowSignalWrites: true });
  }
}
