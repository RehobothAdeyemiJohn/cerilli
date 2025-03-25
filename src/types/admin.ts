
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
  first_name: string;
  last_name: string;
  email: string;
  password: string; // In a real app, this should only be a hash
  active: boolean;
  role: Role;
  permissions: Permission[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserFormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  active: boolean;
  role: Role;
  permissions: Permission[];
};
