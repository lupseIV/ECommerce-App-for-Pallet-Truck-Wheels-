import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'auth_role';
const USERNAME_KEY = 'auth_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api`;
  private readonly _isLoggedIn = signal<boolean>(this.hasValidToken());
  private readonly _role = signal<UserRole | null>(this.storedRole());
  private readonly _username = signal<string | null>(localStorage.getItem(USERNAME_KEY));

  readonly isLoggedIn = computed(() => this._isLoggedIn());
  readonly role = computed(() => this._role());
  readonly username = computed(() => this._username());
  readonly isAdmin = computed(() => this._role() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl + '/auth/login', request).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(ROLE_KEY, response.role);
        localStorage.setItem(USERNAME_KEY, response.username);
        this._isLoggedIn.set(true);
        this._role.set(response.role);
        this._username.set(response.username);
      })
    );
  }

  logout(): void {
    this.http.post(this.apiUrl + '/auth/logout', {}).subscribe();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this._isLoggedIn.set(false);
    this._role.set(null);
    this._username.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  private storedRole(): UserRole | null {
    return (localStorage.getItem(ROLE_KEY) as UserRole) ?? null;
  }
}
