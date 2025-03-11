
import { AdminUser, Role, Permission } from './admin';
import { Dealer, Vendor } from '.';

export type UserType = 'admin' | 'dealer' | 'vendor';

export interface AuthUser {
  id: string;
  type: UserType;
  firstName: string;
  lastName: string;
  email: string;
  role?: Role;
  permissions?: Permission[];
  dealerId?: string;
  dealerName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
