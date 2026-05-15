import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HelpDeskRequest } from '../models/admin.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/support`;

  constructor(private http: HttpClient) {}

  sendMessage(req: HelpDeskRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/contact`, req);
  }
}
