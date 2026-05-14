import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart, CartItemRequest } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/cart`;

  private readonly _cart = signal<Cart | null>(null);
  private readonly _open  = signal(false);

  readonly cart      = this._cart.asReadonly();
  readonly isOpen    = this._open.asReadonly();
  readonly itemCount = computed(() => this._cart()?.itemCount ?? 0);

  constructor(private http: HttpClient) {}

  load(): void {
    this.http.get<Cart>(this.apiUrl).subscribe({
      next: cart => this._cart.set(cart),
      error: ()  => this._cart.set(null),
    });
  }

  addToCart(req: CartItemRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, req).pipe(
      tap(cart => this._cart.set(cart)),
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(cart => this._cart.set(cart)),
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this._cart.set(null)),
    );
  }

  open():  void { this._open.set(true);  }
  close(): void { this._open.set(false); }
  toggle(): void { this._open.update(v => !v); }

  reset(): void { this._cart.set(null); this._open.set(false); }
}
