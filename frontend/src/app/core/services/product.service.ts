import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductFilter } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/products`;

  constructor(private http: HttpClient) {}

  getProducts(filter?: ProductFilter): Observable<Product[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.name) params = params.set('name', filter.name);
      if (filter.type) params = params.set('type', filter.type);
      if (filter.size) params = params.set('size', filter.size);
      if (filter.material) params = params.set('material', filter.material);
      if (filter.maxLoad != null) params = params.set('maxLoad', filter.maxLoad.toString());
      if (filter.diameter) params = params.set('diameter', filter.diameter);
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }
}
