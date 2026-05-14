import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { OrderService } from '../core/services/order.service';
import { Order, ORDER_STATE_LABEL, OrderState } from '../core/models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="orders-page">

      @if (confirmed()) {
        <div class="alert-success">
          ✓ Comanda #{{ confirmed() }} a fost plasată cu succes! Vă mulțumim.
        </div>
      }

      <div class="page-header">
        <h1 class="page-title">Istoricul Comenzilor</h1>
        <span class="page-count">{{ orders().length }} comenzi</span>
      </div>

      @if (loading()) {
        <div class="spinner-wrap">
          <div class="spinner"></div>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <p>Nu aveți comenzi plasate încă.</p>
        </div>
      } @else {
        <div class="orders-table-wrap">
          <table class="orders-table">
            <thead>
              <tr>
                <th>#COMANDĂ</th>
                <th>DATA</th>
                <th>STATUS</th>
                <th>TOTAL</th>
                <th>ACȚIUNI</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr [class.row--expanded]="expanded() === order.id">
                  <td class="order-id">#ORD-{{ order.id }}</td>
                  <td>{{ order.createdAt | date:'dd MMM yyyy' }}</td>
                  <td>
                    <span class="status-badge" [class]="'status-badge--' + order.status.toLowerCase()">
                      {{ label(order.status) }}
                    </span>
                  </td>
                  <td class="order-total">{{ order.total | number:'1.2-2' }} RON</td>
                  <td class="order-actions">
                    <button class="btn-details" (click)="toggleExpand(order.id)">
                      {{ expanded() === order.id ? 'Ascunde' : 'Detalii' }}
                    </button>
                    @if (order.status === 'REGISTERED') {
                      <button class="btn-cancel" (click)="cancel(order.id)">
                        Anulează
                      </button>
                    }
                  </td>
                </tr>
                @if (expanded() === order.id) {
                  <tr class="detail-row">
                    <td colspan="5">
                      <div class="order-detail">
                        @for (item of order.items; track item.id) {
                          <div class="detail-item">
                            <span class="detail-item__name">{{ item.name }}</span>
                            <span class="detail-item__qty">{{ item.quantity }} buc.</span>
                            <span class="detail-item__price">{{ item.subtotal | number:'1.2-2' }} RON</span>
                          </div>
                        }
                        <div class="detail-total">
                          <span>Metodă plată: {{ order.paymentMethod }}</span>
                          <span>Total: {{ order.total | number:'1.2-2' }} RON</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .alert-success {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #16a34a;
      border-radius: 8px;
      padding: 14px 18px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0;
    }

    .page-count {
      background: var(--rw-dark);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 10px;
    }

    .spinner-wrap {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--rw-border);
      border-top-color: var(--rw-orange);
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      padding: 60px;
      color: var(--rw-muted);
    }

    /* Table */
    .orders-table-wrap {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table thead {
      background: var(--rw-bg);
    }

    .orders-table th {
      padding: 12px 16px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--rw-muted);
      text-align: left;
      border-bottom: 1px solid var(--rw-border);
    }

    .orders-table td {
      padding: 14px 16px;
      font-size: 14px;
      color: var(--rw-text);
      border-bottom: 1px solid var(--rw-border);
    }

    .orders-table tbody tr:last-child td { border-bottom: none; }

    .order-id { font-weight: 600; font-family: monospace; font-size: 13px; }
    .order-total { font-weight: 700; }
    .order-actions { display: flex; gap: 8px; }

    /* Status badges */
    .status-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 3px 10px;
      border-radius: 10px;
    }

    .status-badge--registered  { background: #fef3c7; color: #92400e; }
    .status-badge--confirmed   { background: #dbeafe; color: #1e40af; }
    .status-badge--on_going    { background: #ede9fe; color: #6d28d9; }
    .status-badge--delivered   { background: #dcfce7; color: #166534; }
    .status-badge--canceled    { background: #fee2e2; color: #991b1b; }

    /* Action buttons */
    .btn-details {
      background: none;
      border: 1px solid var(--rw-border);
      color: var(--rw-text);
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
      transition: all .15s;
    }

    .btn-details:hover { border-color: var(--rw-orange); color: var(--rw-orange); }

    .btn-cancel {
      background: none;
      border: 1px solid #fca5a5;
      color: #dc2626;
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
      transition: all .15s;
    }

    .btn-cancel:hover { background: #fee2e2; }

    /* Expanded detail row */
    .detail-row td { padding: 0; background: var(--rw-bg); }

    .order-detail {
      padding: 16px 20px;
      border-top: 1px solid var(--rw-border);
    }

    .detail-item {
      display: flex;
      gap: 16px;
      padding: 6px 0;
      font-size: 13px;
      color: var(--rw-text);
    }

    .detail-item__name { flex: 1; }
    .detail-item__qty { color: var(--rw-muted); }
    .detail-item__price { font-weight: 600; min-width: 100px; text-align: right; }

    .detail-total {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: var(--rw-text);
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--rw-border);
    }
  `],
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private route        = inject(ActivatedRoute);

  readonly orders    = signal<Order[]>([]);
  readonly loading   = signal(true);
  readonly confirmed = signal<number | null>(null);
  readonly expanded  = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('confirmed');
    if (id) this.confirmed.set(+id);
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getMyOrders().subscribe({
      next:  orders => { this.orders.set(orders); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  toggleExpand(id: number): void {
    this.expanded.update(cur => cur === id ? null : id);
  }

  cancel(orderId: number): void {
    this.orderService.cancelOrder(orderId).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
      },
    });
  }

  label(status: OrderState): string {
    return ORDER_STATE_LABEL[status];
  }
}
