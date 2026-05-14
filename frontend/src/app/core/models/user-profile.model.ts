export interface UserProfile {
  id: number;
  username: string;
  email: string;
  billingAddress: string | null;
  role: 'ADMIN' | 'DEFAULT';
}

export interface UserUpdateRequest {
  email?: string;
  billingAddress?: string;
}
