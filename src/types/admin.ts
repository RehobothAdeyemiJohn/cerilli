
export type Permission = 
  | 'dashboard'
  | 'inventory'
  | 'quotes'
  | 'orders'
  | 'dealers'
  | 'credentials'
  | 'settings';

export type Role = 'superAdmin' | 'admin' | 'operator' | 'supervisor';

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // In a real app, this should only be a hash
  isActive: boolean;
  role: Role;
  permissions: Permission[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  role: Role;
  permissions: Permission[];
};
