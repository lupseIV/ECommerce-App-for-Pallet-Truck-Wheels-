import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar.component';
import { CartDrawerComponent } from './cart/cart-drawer.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent],
  template: `
    @if (auth.isLoggedIn()) {
      <app-navbar />
    }
    <router-outlet />
    <app-cart-drawer />
  `,
})
export class App {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);

  constructor() {
    // Load cart whenever user logs in
    effect(() => {
      if (this.auth.isLoggedIn()) {
        this.cart.load();
      } else {
        this.cart.reset();
      }
    });
  }
}
