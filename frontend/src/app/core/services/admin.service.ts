import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats, InventoryReport, ImportResult, ProductCreateRequest, ProductStock, SupportTicket } from '../models/admin.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiBaseUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/stats`);
  }

  getInventory(): Observable<InventoryReport> {
    return this.http.get<InventoryReport>(`${this.base}/inventory`);
  }

  importFile(file: File): Observable<ImportResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImportResult>(`${this.base}/products/import`, form);
  }

  createProduct(req: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, req);
  }

  updateStock(productId: number, stockQty: number): Observable<ProductStock> {
    return this.http.patch<ProductStock>(`${this.base}/products/${productId}/stock`, { stockQty });
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.base}/orders/${orderId}/status`, { status });
  }

  getTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.base}/tickets`);
  }

  resolveTicket(id: number): Observable<SupportTicket> {
    return this.http.put<SupportTicket>(`${this.base}/tickets/${id}/resolve`, {});
  }
}
