
import { v4 as uuidv4 } from 'uuid';
import { AdminUser, AdminUserFormData } from '@/types/admin';
import { getStorageItem, setStorageItem } from './storageUtils';

const STORAGE_KEY = 'adminUsers';

const defaultAdminUsers: AdminUser[] = [
  {
    id: uuidv4(),
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'password123', // In a real app, this would be hashed
    isActive: true,
    role: 'superAdmin',
    permissions: ['dashboard', 'inventory', 'quotes', 'orders', 'dealers', 'credentials', 'settings'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
];

// Initialize storage with default admin users if empty
const initializeStorage = () => {
  const existingUsers = getStorageItem<AdminUser[]>(STORAGE_KEY);
  if (!existingUsers) {
    setStorageItem(STORAGE_KEY, defaultAdminUsers);
    return defaultAdminUsers;
  }
  return existingUsers;
};

export const adminUsersApi = {
  getAll: (): Promise<AdminUser[]> => {
    return Promise.resolve(initializeStorage());
  },

  getById: (id: string): Promise<AdminUser | undefined> => {
    const users = initializeStorage();
    return Promise.resolve(users.find(user => user.id === id));
  },

  create: (userData: AdminUserFormData): Promise<AdminUser> => {
    const users = initializeStorage();
    const newUser: AdminUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    setStorageItem(STORAGE_KEY, updatedUsers);
    return Promise.resolve(newUser);
  },

  update: (id: string, userData: Partial<AdminUserFormData>): Promise<AdminUser | undefined> => {
    const users = initializeStorage();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return Promise.resolve(undefined);
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    setStorageItem(STORAGE_KEY, users);
    return Promise.resolve(updatedUser);
  },

  delete: (id: string): Promise<boolean> => {
    const users = initializeStorage();
    const updatedUsers = users.filter(user => user.id !== id);
    
    if (updatedUsers.length === users.length) {
      return Promise.resolve(false);
    }
    
    setStorageItem(STORAGE_KEY, updatedUsers);
    return Promise.resolve(true);
  }
};
