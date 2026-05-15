import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, catchError, tap, map } from 'rxjs';
import { Cart, CartItem, GuestCartItem } from '../models/cart.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const GUEST_KEY = 'ptw_guest_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/cart`;
  private readonly http   = inject(HttpClient);
  private readonly auth   = inject(AuthService);

  private readonly _serverCart  = signal<Cart | null>(null);
  private readonly _guestItems  = signal<GuestCartItem[]>(this.readGuest());
  private readonly _open        = signal(false);

  readonly isOpen = this._open.asReadonly();

  readonly cart = computed<Cart | null>(() => {
    if (this.auth.isLoggedIn()) return this._serverCart();
    const items = this._guestItems();
    if (items.length === 0) return null;
    return this.guestToCart(items);
  });

  readonly itemCount = computed(() => this.cart()?.itemCount ?? 0);

  // ── Load (called on login) ─────────────────────────────────────────────────

  load(): void {
    const guest = this._guestItems();
    if (guest.length > 0) {
      this.mergeGuestCart(guest);
    } else {
      this.fetchServer();
    }
  }

  // ── Add to cart ───────────────────────────────────────────────────────────

  addToCart(req: { productId: number; qty: number; name: string; price: number; imageUrl?: string | null }): Observable<void> {
    if (!this.auth.isLoggedIn()) {
      this._guestItems.update(items => {
        const idx = items.findIndex(i => i.productId === req.productId);
        if (idx >= 0) {
          const updated = [...items];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + req.qty };
          return updated;
        }
        return [...items, {
          productId: req.productId,
          name: req.name,
          imageUrl: req.imageUrl ?? null,
          quantity: req.qty,
          unitPrice: req.price,
        }];
      });
      this.saveGuest();
      return of(undefined);
    }

    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId: req.productId, qty: req.qty }).pipe(
      tap(cart => this._serverCart.set(cart)),
      map(() => undefined),
    );
  }

  // ── Remove item ───────────────────────────────────────────────────────────

  removeItem(itemId: number): Observable<void> {
    if (!this.auth.isLoggedIn()) {
      // In guest mode itemId === productId
      this._guestItems.update(items => items.filter(i => i.productId !== itemId));
      this.saveGuest();
      return of(undefined);
    }
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(cart => this._serverCart.set(cart)),
      map(() => undefined),
    );
  }

  // ── Update quantity ───────────────────────────────────────────────────────

  updateQuantity(itemId: number, qty: number): Observable<void> {
    if (!this.auth.isLoggedIn()) {
      // In guest mode itemId === productId
      if (qty <= 0) {
        this._guestItems.update(items => items.filter(i => i.productId !== itemId));
      } else {
        this._guestItems.update(items =>
          items.map(i => i.productId === itemId ? { ...i, quantity: qty } : i)
        );
      }
      this.saveGuest();
      return of(undefined);
    }
    return this.http.patch<Cart>(`${this.apiUrl}/items/${itemId}`, { qty }).pipe(
      tap(cart => this._serverCart.set(cart)),
      map(() => undefined),
    );
  }

  // ── Clear cart ────────────────────────────────────────────────────────────

  clearCart(): Observable<void> {
    if (!this.auth.isLoggedIn()) {
      this._guestItems.set([]);
      this.saveGuest();
      return of(undefined);
    }
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => this._serverCart.set(null)),
    );
  }

  // ── Drawer control ────────────────────────────────────────────────────────

  open():   void { this._open.set(true);  }
  close():  void { this._open.set(false); }
  toggle(): void { this._open.update(v => !v); }

  reset(): void {
    this._serverCart.set(null);
    this._open.set(false);
    // Keep guest items until they log in and merge
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private fetchServer(): void {
    this.http.get<Cart>(this.apiUrl).subscribe({
      next:  cart => this._serverCart.set(cart),
      error: ()   => this._serverCart.set(null),
    });
  }

  private mergeGuestCart(guest: GuestCartItem[]): void {
    forkJoin(
      guest.map(gi =>
        this.http.post<Cart>(`${this.apiUrl}/items`, { productId: gi.productId, qty: gi.quantity }).pipe(
          catchError(() => of(null))
        )
      )
    ).subscribe(() => {
      this._guestItems.set([]);
      localStorage.removeItem(GUEST_KEY);
      this.fetchServer();
    });
  }

  private guestToCart(items: GuestCartItem[]): Cart {
    const cartItems: CartItem[] = items.map(gi => ({
      id:        gi.productId, // use productId as id in guest mode
      productId: gi.productId,
      name:      gi.name,
      imageUrl:  gi.imageUrl,
      quantity:  gi.quantity,
      unitPrice: gi.unitPrice,
      subtotal:  gi.unitPrice * gi.quantity,
    }));
    const total = cartItems.reduce((s, i) => s + i.subtotal, 0);
    return {
      id:        0,
      items:     cartItems,
      total:     Math.round(total * 100) / 100,
      itemCount: cartItems.reduce((s, i) => s + i.quantity, 0),
    };
  }

  private readGuest(): GuestCartItem[] {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveGuest(): void {
    localStorage.setItem(GUEST_KEY, JSON.stringify(this._guestItems()));
  }
}
