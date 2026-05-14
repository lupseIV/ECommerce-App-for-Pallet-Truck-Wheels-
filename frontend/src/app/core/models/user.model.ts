export type UserRole = 'ADMIN' | 'DEFAULT';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  username: string;
}
