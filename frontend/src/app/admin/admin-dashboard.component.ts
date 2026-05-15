import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { AdminService } from '../core/services/admin.service';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../shared/toast.service';
import { AdminStats, InventoryReport, ImportResult, ProductCreateRequest, SupportTicket } from '../core/models/admin.model';
import { Order, ORDER_STATE_LABEL, OrderState } from '../core/models/order.model';

type Tab = 'overview' | 'orders' | 'inventory' | 'products' | 'tickets';

const ORDER_STATES: OrderState[] = ['REGISTERED', 'CONFIRMED', 'ON_GOING', 'DELIVERED', 'CANCELED'];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, SlicePipe],
  template: `
    <div class="admin-layout">

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <div class="sidebar__brand">
          <span class="sidebar__brand-name">ADMIN PANEL</span>
          <span class="sidebar__brand-sub">Gestiune Industrială</span>
        </div>

        <nav class="sidebar__nav">
          <button class="sidebar__item" [class.sidebar__item--active]="tab() === 'overview'"
                  (click)="tab.set('overview')">
            <span class="sidebar__icon">📊</span> Panou Control
          </button>
          <button class="sidebar__item" [class.sidebar__item--active]="tab() === 'orders'"
                  (click)="tab.set('orders'); loadOrders()">
            <span class="sidebar__icon">📦</span> Comenzi
          </button>
          <button class="sidebar__item" [class.sidebar__item--active]="tab() === 'inventory'"
                  (click)="tab.set('inventory'); loadInventory()">
            <span class="sidebar__icon">🏭</span> Stoc Produse
          </button>
          <button class="sidebar__item" [class.sidebar__item--active]="tab() === 'products'"
                  (click)="tab.set('products')">
            <span class="sidebar__icon">➕</span> Adaugă Produse
          </button>
          <button class="sidebar__item" [class.sidebar__item--active]="tab() === 'tickets'"
                  (click)="tab.set('tickets'); loadTickets()">
            <span class="sidebar__icon">💬</span> Mesaje Suport
            @if (openTicketCount() > 0) {
              <span class="sidebar__badge">{{ openTicketCount() }}</span>
            }
          </button>
        </nav>

        <div class="sidebar__footer">
          <button class="sidebar__logout" (click)="auth.logout()">
            <span class="sidebar__icon">🚪</span> Deconectare
          </button>
        </div>
      </aside>

      <!-- ── Main ── -->
      <main class="admin-main">

        <!-- Overview tab -->
        @if (tab() === 'overview') {
          <div class="page-header">
            <h1 class="page-title">Panou Control</h1>
            <p class="page-sub">Bună ziua, Admin. Iată situația operativă de astăzi.</p>
          </div>

          @if (stats()) {
            <div class="kpi-grid">
              <div class="kpi-card">
                <p class="kpi-label">VÂNZĂRI TOTALE</p>
                <p class="kpi-value">{{ stats()!.totalSales | number:'1.2-2' }}</p>
                <p class="kpi-unit">RON</p>
              </div>
              <div class="kpi-card kpi-card--blue">
                <p class="kpi-label">COMENZI ÎN AȘTEPTARE</p>
                <p class="kpi-value">{{ stats()!.pendingOrdersCount }}</p>
                <p class="kpi-unit">Unități</p>
              </div>
              <div class="kpi-card kpi-card--warn" [class.kpi-card--alert]="stats()!.lowStockCount > 0">
                <p class="kpi-label">ALERTĂ STOC SCĂZUT</p>
                <p class="kpi-value">{{ stats()!.lowStockCount }}</p>
                <p class="kpi-unit">Repere</p>
              </div>
              <div class="kpi-card kpi-card--purple">
                <p class="kpi-label">TICHETE DESCHISE</p>
                <p class="kpi-value">{{ stats()!.openTicketsCount }}</p>
                <p class="kpi-unit">Mesaje</p>
              </div>
            </div>
          }

          <div class="section-header">
            <h2 class="section-title">Comenzi Recente</h2>
            <button class="btn-link" (click)="tab.set('orders'); loadOrders()">
              Vezi Tot Catalogul →
            </button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>
                <th>#COMANDĂ</th><th>CLIENT</th><th>VALOARE</th><th>STATUS</th><th>ACȚIUNI</th>
              </tr></thead>
              <tbody>
                @for (o of recentOrders(); track o.id) {
                  <tr>
                    <td class="mono">#ORD-{{ o.id }}</td>
                    <td>{{ o.username }}</td>
                    <td>{{ o.total | number:'1.2-2' }} RON</td>
                    <td><span class="badge" [class]="'badge--' + o.status.toLowerCase()">{{ label(o.status) }}</span></td>
                    <td>
                      <select class="status-select" [value]="o.status"
                              (change)="changeStatus(o.id, $any($event.target).value)">
                        @for (s of orderStates; track s) {
                          <option [value]="s">{{ label(s) }}</option>
                        }
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Orders tab -->
        @if (tab() === 'orders') {
          <div class="page-header">
            <h1 class="page-title">Toate Comenzile</h1>
          </div>
          @if (ordersLoading()) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else {
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr>
                  <th>#COMANDĂ</th><th>CLIENT</th><th>DATA</th><th>TOTAL</th><th>METODĂ PLATĂ</th><th>STATUS</th><th>ACȚIUNI</th>
                </tr></thead>
                <tbody>
                  @for (o of orders(); track o.id) {
                    <tr>
                      <td class="mono">#ORD-{{ o.id }}</td>
                      <td>{{ o.username }}</td>
                      <td>{{ o.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td>{{ o.total | number:'1.2-2' }} RON</td>
                      <td>{{ o.paymentMethod }}</td>
                      <td><span class="badge" [class]="'badge--' + o.status.toLowerCase()">{{ label(o.status) }}</span></td>
                      <td>
                        <select class="status-select" [value]="o.status"
                                (change)="changeStatus(o.id, $any($event.target).value)">
                          @for (s of orderStates; track s) {
                            <option [value]="s">{{ label(s) }}</option>
                          }
                        </select>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- Inventory tab -->
        @if (tab() === 'inventory') {
          <div class="page-header">
            <h1 class="page-title">Stoc Produse</h1>
            @if (inventory()) {
              <p class="page-sub">
                {{ inventory()!.totalProducts }} produse totale —
                <span class="text-warn">{{ inventory()!.lowStockCount }} sub prag minim</span>
              </p>
            }
          </div>

          @if (inventory()?.lowStockWarnings?.length) {
            <div class="low-stock-alert">
              <strong>⚠ Alertă Stoc Critic</strong>
              <ul>
                @for (w of inventory()!.lowStockWarnings; track w) {
                  <li>{{ w }}</li>
                }
              </ul>
            </div>
          }

          <div class="table-wrap">
            <table class="data-table">
              <thead><tr>
                <th>ID</th><th>PRODUS</th><th>TIP</th><th>STOC CURENT</th><th>STATUS</th><th>REAPROVIZIONARE</th>
              </tr></thead>
              <tbody>
                @for (p of inventory()?.products ?? []; track p.id) {
                  <tr [class.row--warn]="p.lowStock">
                    <td class="mono">{{ p.id }}</td>
                    <td>{{ p.name }}</td>
                    <td>{{ p.type }}</td>
                    <td class="stock-qty" [class.stock-qty--low]="p.lowStock">{{ p.stockQty }}</td>
                    <td>
                      @if (p.lowStock) {
                        <span class="badge badge--canceled">STOC CRITIC</span>
                      } @else {
                        <span class="badge badge--delivered">OK</span>
                      }
                    </td>
                    <td>
                      @if (editingStockId() === p.id) {
                        <div class="stock-edit">
                          <input
                            class="stock-input"
                            type="number"
                            min="0"
                            [value]="editingQty()"
                            (input)="editingQty.set(+$any($event.target).value)"
                            (keydown.enter)="saveStock(p.id)"
                            (keydown.escape)="editingStockId.set(null)"
                          />
                          <button class="btn-save-stock" (click)="saveStock(p.id)"
                                  [disabled]="stockSaving()">
                            {{ stockSaving() ? '…' : 'Salvează' }}
                          </button>
                          <button class="btn-cancel-stock" (click)="editingStockId.set(null)">✕</button>
                        </div>
                      } @else {
                        <button class="btn-restock"
                                [class.btn-restock--urgent]="p.lowStock"
                                (click)="startEditStock(p.id, p.stockQty)">
                          {{ p.lowStock ? '⚠ Reaprovizionează' : 'Editează stoc' }}
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Products tab -->
        @if (tab() === 'products') {
          <div class="page-header">
            <h1 class="page-title">Adaugă / Importă Produse</h1>
          </div>

          <!-- Import section -->
          <div class="card">
            <h3 class="card__title">Import CSV / JSON</h3>
            <p class="card__desc">
              Format CSV: <code>type,name,price,stockQty,material,size,maxLoad,diameter</code><br>
              Format JSON: array de obiecte cu aceleași câmpuri.
            </p>
            <div class="upload-zone" (click)="fileInput.click()" (dragover)="$event.preventDefault()"
                 (drop)="onDrop($event)">
              <input #fileInput type="file" accept=".csv,.json" style="display:none"
                     (change)="onFileChange($event)" />
              <p>📁 Trageți fișierul aici sau <strong>click pentru a selecta</strong></p>
              <p class="upload-zone__hint">Acceptat: .csv, .json</p>
            </div>
            @if (importResult()) {
              <div class="import-result" [class.import-result--error]="importResult()!.errorCount > 0">
                <p>✅ {{ importResult()!.successCount }} produse importate cu succes</p>
                @if (importResult()!.errorCount > 0) {
                  <p>❌ {{ importResult()!.errorCount }} erori:</p>
                  <ul>@for (e of importResult()!.errors; track e) { <li>{{ e }}</li> }</ul>
                }
              </div>
            }
          </div>

          <!-- Manual add section -->
          <div class="card">
            <h3 class="card__title">Adaugă Produs Manual</h3>
            <form [formGroup]="productForm" (ngSubmit)="addProduct()">
              <div class="field-row">
                <div class="field">
                  <label class="field__label">TIP PRODUS</label>
                  <select class="field__input" formControlName="type">
                    <option value="WHEEL">Roată (WHEEL)</option>
                    <option value="BEARING">Rulment (BEARING)</option>
                  </select>
                </div>
                <div class="field">
                  <label class="field__label">DENUMIRE</label>
                  <input class="field__input" formControlName="name" placeholder="ex. Roată PU 200mm" />
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label class="field__label">PREȚ (RON)</label>
                  <input class="field__input" type="number" formControlName="price" placeholder="45.99" />
                </div>
                <div class="field">
                  <label class="field__label">STOC INIȚIAL</label>
                  <input class="field__input" type="number" formControlName="stockQty" placeholder="0" />
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label class="field__label">MATERIAL</label>
                  <input class="field__input" formControlName="material" placeholder="ex. Poliuretan" />
                </div>
                <div class="field">
                  <label class="field__label">DIMENSIUNE</label>
                  <input class="field__input" formControlName="size" placeholder="ex. 200mm" />
                </div>
              </div>

              @if (productForm.value.type === 'WHEEL') {
                <div class="field">
                  <label class="field__label">CAPACITATE MAX (kg)</label>
                  <input class="field__input" type="number" formControlName="maxLoad" placeholder="600" />
                </div>
              }
              @if (productForm.value.type === 'BEARING') {
                <div class="field">
                  <label class="field__label">DIAMETRU</label>
                  <input class="field__input" formControlName="diameter" placeholder="ex. 52mm" />
                </div>
              }

              @if (addSuccess()) {
                <div class="alert-success">✅ {{ addSuccess() }}</div>
              }
              @if (addError()) {
                <div class="alert-error">❌ {{ addError() }}</div>
              }

              <button class="btn-primary" type="submit" [disabled]="productForm.invalid">
                Salvează Produsul
              </button>
            </form>
          </div>
        }

        <!-- Tickets tab -->
        @if (tab() === 'tickets') {
          <div class="page-header">
            <h1 class="page-title">Mesaje Suport</h1>
            <p class="page-sub">{{ openTicketCount() }} mesaje nerezolvate</p>
          </div>
          @if (ticketsLoading()) {
            <div class="spinner-wrap"><div class="spinner"></div></div>
          } @else if (tickets().length === 0) {
            <div class="table-wrap" style="padding: 40px; text-align: center; color: var(--rw-muted);">
              Nicio solicitare primită.
            </div>
          } @else {
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr>
                  <th>#</th><th>NUME</th><th>EMAIL</th><th>MESAJ</th><th>DATA</th><th>STATUS</th><th>ACȚIUNI</th>
                </tr></thead>
                <tbody>
                  @for (t of tickets(); track t.id) {
                    <tr>
                      <td class="mono">{{ t.id }}</td>
                      <td>{{ t.name }}</td>
                      <td><a [href]="'mailto:' + t.email" class="email-link">{{ t.email }}</a></td>
                      <td class="msg-cell" [title]="t.message">
                        {{ t.message.length > 80 ? (t.message | slice:0:80) + '…' : t.message }}
                      </td>
                      <td>{{ t.createdAt | date:'dd/MM/yy' }}</td>
                      <td>
                        @if (t.resolved) {
                          <span class="badge badge--delivered">Rezolvat</span>
                        } @else {
                          <span class="badge badge--registered">Deschis</span>
                        }
                      </td>
                      <td>
                        @if (!t.resolved) {
                          <button class="btn-primary" (click)="resolveTicket(t.id)">
                            Marchează Rezolvat
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: calc(100vh - 60px);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px;
      flex-shrink: 0;
      background: var(--rw-dark);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 60px;
      height: calc(100vh - 60px);
    }

    .sidebar__brand {
      padding: 24px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .sidebar__brand-name {
      display: block;
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
    }

    .sidebar__brand-sub {
      display: block;
      color: rgba(255,255,255,0.35);
      font-size: 10px;
      margin-top: 3px;
    }

    .sidebar__nav {
      flex: 1;
      padding: 12px 0;
    }

    .sidebar__item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 11px 20px;
      background: none;
      border: none;
      border-left: 3px solid transparent;
      color: rgba(255,255,255,0.55);
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition: all .15s;
    }

    .sidebar__item:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); }
    .sidebar__item--active {
      color: #fff;
      font-weight: 600;
      border-left-color: var(--rw-orange);
      background: rgba(232,96,28,0.10);
    }

    .sidebar__icon { font-size: 14px; }

    .sidebar__badge {
      margin-left: auto;
      background: var(--rw-orange);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
    }

    .sidebar__footer {
      padding: 16px 0;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .sidebar__logout {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 20px;
      background: none;
      border: none;
      color: rgba(255,255,255,0.4);
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
      transition: color .15s;
    }

    .sidebar__logout:hover { color: rgba(255,255,255,0.8); }

    /* ── Main ── */
    .admin-main {
      flex: 1;
      padding: 32px 32px;
      overflow-y: auto;
    }

    .page-header { margin-bottom: 28px; }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 4px;
    }

    .page-sub { font-size: 13px; color: var(--rw-muted); margin: 0; }

    /* ── KPI cards ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      padding: 20px;
      border-top: 3px solid var(--rw-orange);
    }

    .kpi-card--blue   { border-top-color: #3b82f6; }
    .kpi-card--warn   { border-top-color: #f59e0b; }
    .kpi-card--alert  { border-top-color: #ef4444; }
    .kpi-card--purple { border-top-color: #8b5cf6; }

    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--rw-muted);
      margin: 0 0 8px;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--rw-text);
      margin: 0;
      line-height: 1;
    }

    .kpi-unit { font-size: 12px; color: var(--rw-muted); margin: 4px 0 0; }

    /* ── Section header ── */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .section-title { font-size: 16px; font-weight: 700; color: var(--rw-text); margin: 0; }

    .btn-link {
      background: none;
      border: none;
      color: var(--rw-orange);
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }

    /* ── Table ── */
    .table-wrap {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead { background: var(--rw-bg); }

    .data-table th {
      padding: 11px 14px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--rw-muted);
      text-align: left;
      border-bottom: 1px solid var(--rw-border);
    }

    .data-table td {
      padding: 12px 14px;
      font-size: 13px;
      color: var(--rw-text);
      border-bottom: 1px solid var(--rw-border);
    }

    .data-table tbody tr:last-child td { border-bottom: none; }
    .row--warn { background: #fffbeb; }

    .mono { font-family: monospace; font-size: 12px; font-weight: 600; }

    /* Status badges */
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 3px 9px;
      border-radius: 10px;
    }

    .badge--registered  { background: #fef3c7; color: #92400e; }
    .badge--confirmed   { background: #dbeafe; color: #1e40af; }
    .badge--on_going    { background: #ede9fe; color: #6d28d9; }
    .badge--delivered   { background: #dcfce7; color: #166534; }
    .badge--canceled    { background: #fee2e2; color: #991b1b; }

    /* Status select */
    .status-select {
      padding: 4px 8px;
      border: 1px solid var(--rw-border);
      border-radius: 4px;
      font-size: 12px;
      font-family: inherit;
      background: #fff;
      cursor: pointer;
    }

    .stock-qty { font-weight: 700; }
    .stock-qty--low { color: #dc2626; }

    /* ── Stock replenishment inline edit ── */
    .stock-edit {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stock-input {
      width: 80px;
      padding: 5px 8px;
      border: 1px solid var(--rw-orange);
      border-radius: 4px;
      font-size: 13px;
      font-family: inherit;
      color: var(--rw-text);
      outline: none;
      box-shadow: 0 0 0 2px rgba(232,96,28,0.15);
    }

    /* Hide browser number arrows */
    .stock-input::-webkit-inner-spin-button,
    .stock-input::-webkit-outer-spin-button { -webkit-appearance: none; }
    .stock-input { -moz-appearance: textfield; }

    .btn-save-stock {
      padding: 5px 10px;
      background: var(--rw-orange);
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background .15s, opacity .15s;
    }

    .btn-save-stock:hover:not(:disabled) { background: var(--rw-orange-h); }
    .btn-save-stock:disabled { opacity: .6; cursor: wait; }

    .btn-cancel-stock {
      padding: 5px 8px;
      background: none;
      border: 1px solid var(--rw-border);
      border-radius: 4px;
      font-size: 12px;
      color: var(--rw-muted);
      cursor: pointer;
      font-family: inherit;
      transition: all .15s;
    }

    .btn-cancel-stock:hover { border-color: #dc2626; color: #dc2626; }

    .btn-restock {
      padding: 5px 12px;
      background: none;
      border: 1px solid var(--rw-border);
      border-radius: 4px;
      font-size: 12px;
      color: var(--rw-muted);
      cursor: pointer;
      font-family: inherit;
      white-space: nowrap;
      transition: all .15s;
    }

    .btn-restock:hover { border-color: var(--rw-orange); color: var(--rw-orange); }

    .btn-restock--urgent {
      border-color: #dc2626;
      color: #dc2626;
      font-weight: 600;
    }

    .btn-restock--urgent:hover { background: #fef2f2; }

    /* Low stock alert */
    .low-stock-alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
      font-size: 13px;
      color: #991b1b;
    }

    .low-stock-alert ul { margin: 8px 0 0; padding-left: 20px; }
    .low-stock-alert li { margin-bottom: 4px; }

    .text-warn { color: #d97706; font-weight: 600; }

    /* ── Cards ── */
    .card {
      background: #fff;
      border: 1px solid var(--rw-border);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .card__title {
      font-size: 15px;
      font-weight: 700;
      color: var(--rw-text);
      margin: 0 0 8px;
    }

    .card__desc {
      font-size: 12px;
      color: var(--rw-muted);
      margin: 0 0 16px;
      line-height: 1.6;
    }

    code {
      background: var(--rw-bg);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
    }

    /* Upload zone */
    .upload-zone {
      border: 2px dashed var(--rw-border);
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      color: var(--rw-muted);
      font-size: 14px;
      transition: border-color .15s;
    }

    .upload-zone:hover { border-color: var(--rw-orange); color: var(--rw-text); }
    .upload-zone__hint { font-size: 12px; margin-top: 6px; }

    /* Import result */
    .import-result {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 6px;
      padding: 14px 16px;
      font-size: 13px;
      color: #166534;
      margin-top: 12px;
    }

    .import-result--error {
      background: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }

    .import-result ul { margin: 6px 0 0; padding-left: 18px; }

    /* Form fields */
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 16px; }

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
      padding: 10px 12px;
      border: 1px solid var(--rw-border);
      border-radius: 6px;
      font-size: 13px;
      color: var(--rw-text);
      outline: none;
      font-family: inherit;
      background: #fff;
      transition: border-color .15s;
    }

    .field__input:focus { border-color: var(--rw-orange); }

    .alert-success {
      background: #f0fdf4; border: 1px solid #86efac; color: #166534;
      border-radius: 6px; padding: 10px 14px; font-size: 13px; margin-bottom: 12px;
    }

    .alert-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
      border-radius: 6px; padding: 10px 14px; font-size: 13px; margin-bottom: 12px;
    }

    .btn-primary {
      padding: 11px 24px;
      background: var(--rw-orange);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background .15s;
    }

    .btn-primary:hover:not(:disabled) { background: var(--rw-orange-h); }
    .btn-primary:disabled { opacity: .55; cursor: not-allowed; }

    .spinner-wrap { display: flex; justify-content: center; padding: 60px; }

    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--rw-border);
      border-top-color: var(--rw-orange);
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .email-link { color: var(--rw-orange); text-decoration: none; font-size: 12px; }
    .email-link:hover { text-decoration: underline; }
    .msg-cell { max-width: 260px; font-size: 12px; color: var(--rw-muted); }

    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  readonly auth        = inject(AuthService);
  private toast        = inject(ToastService);
  private fb           = inject(FormBuilder);

  readonly tab           = signal<Tab>('overview');
  readonly stats         = signal<AdminStats | null>(null);
  readonly inventory     = signal<InventoryReport | null>(null);
  readonly orders        = signal<Order[]>([]);
  readonly recentOrders  = signal<Order[]>([]);
  readonly ordersLoading = signal(false);
  readonly importResult  = signal<ImportResult | null>(null);
  readonly addSuccess    = signal<string | null>(null);
  readonly addError      = signal<string | null>(null);
  readonly tickets        = signal<SupportTicket[]>([]);
  readonly ticketsLoading = signal(false);
  readonly openTicketCount = signal(0);

  // Stock replenishment inline edit state
  readonly editingStockId = signal<number | null>(null);
  readonly editingQty     = signal<number>(0);
  readonly stockSaving    = signal(false);

  readonly orderStates = ORDER_STATES;

  readonly productForm = this.fb.group({
    type:     ['WHEEL' as 'WHEEL' | 'BEARING', Validators.required],
    name:     ['', Validators.required],
    price:    [null as number | null, [Validators.required, Validators.min(0.01)]],
    stockQty: [0],
    material: [''],
    size:     [''],
    maxLoad:  [null as number | null],
    diameter: [''],
  });

  ngOnInit(): void {
    this.adminService.getStats().subscribe({ next: s => {
      this.stats.set(s);
      this.openTicketCount.set(s.openTicketsCount);
    }});
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersLoading.set(true);
    this.adminService.getAllOrders().subscribe({
      next: list => {
        this.orders.set(list);
        this.recentOrders.set(list.slice(0, 5));
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false),
    });
  }

  loadInventory(): void {
    this.adminService.getInventory().subscribe({ next: r => this.inventory.set(r) });
  }

  startEditStock(productId: number, currentQty: number): void {
    this.editingStockId.set(productId);
    this.editingQty.set(currentQty);
  }

  saveStock(productId: number): void {
    const newQty = this.editingQty();
    if (newQty < 0) return;
    this.stockSaving.set(true);
    this.adminService.updateStock(productId, newQty).subscribe({
      next: (updated) => {
        this.inventory.update(inv => {
          if (!inv) return inv;
          const updatedProducts = inv.products.map(p =>
            p.id === productId ? { ...p, stockQty: updated.stockQty, lowStock: updated.lowStock } : p
          );
          const lowStockCount = updatedProducts.filter(p => p.lowStock).length;
          const lowStockWarnings = updatedProducts
            .filter(p => p.lowStock)
            .map(p => `${p.name} — doar ${p.stockQty} unități în stoc`);
          return { ...inv, products: updatedProducts, lowStockCount, lowStockWarnings };
        });
        this.editingStockId.set(null);
        this.stockSaving.set(false);
        this.toast.show(`Stoc actualizat: ${updated.name} → ${updated.stockQty} buc.`);
        // Refresh KPI card so lowStockCount counter updates
        this.adminService.getStats().subscribe({ next: s => this.stats.set(s) });
      },
      error: (err) => {
        this.toast.show(err.error?.error ?? 'Eroare la actualizarea stocului.', 'error');
        this.stockSaving.set(false);
      },
    });
  }

  loadTickets(): void {
    this.ticketsLoading.set(true);
    this.adminService.getTickets().subscribe({
      next: list => {
        this.tickets.set(list);
        this.openTicketCount.set(list.filter(t => !t.resolved).length);
        this.ticketsLoading.set(false);
      },
      error: () => this.ticketsLoading.set(false),
    });
  }

  resolveTicket(id: number): void {
    this.adminService.resolveTicket(id).subscribe({
      next: updated => {
        this.tickets.update(list => list.map(t => t.id === updated.id ? updated : t));
        this.openTicketCount.update(n => Math.max(0, n - 1));
        this.adminService.getStats().subscribe({ next: s => this.stats.set(s) });
      },
    });
  }

  changeStatus(orderId: number, status: string): void {
    this.adminService.updateOrderStatus(orderId, status).subscribe({
      next: updated => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.recentOrders.update(list => list.map(o => o.id === updated.id ? updated : o));
        this.adminService.getStats().subscribe({ next: s => this.stats.set(s) });
      },
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadFile(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.uploadFile(file);
  }

  uploadFile(file: File): void {
    this.importResult.set(null);
    this.adminService.importFile(file).subscribe({ next: r => this.importResult.set(r) });
  }

  addProduct(): void {
    if (this.productForm.invalid) return;
    this.addSuccess.set(null);
    this.addError.set(null);

    const v = this.productForm.value;
    const req: ProductCreateRequest = {
      type:     v.type!,
      name:     v.name!,
      price:    v.price!,
      stockQty: v.stockQty ?? 0,
      material: v.material || undefined,
      size:     v.size || undefined,
      maxLoad:  v.maxLoad || undefined,
      diameter: v.diameter || undefined,
    };

    this.adminService.createProduct(req).subscribe({
      next: p => {
        this.addSuccess.set(`Produsul "${p.name}" a fost adăugat cu succes.`);
        this.productForm.reset({ type: 'WHEEL', stockQty: 0 });
      },
      error: err => this.addError.set(err.error?.error ?? 'Eroare la salvare.'),
    });
  }

  label(status: OrderState): string {
    return ORDER_STATE_LABEL[status];
  }
}
