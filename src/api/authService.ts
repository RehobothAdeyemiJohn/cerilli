
import { LoginCredentials, AuthUser } from '@/types/auth';
import { adminUsersApi } from './localStorage';
import { dealers, vendors } from '@/data/mockData';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    const { email, password } = credentials;
    
    // Check admin users first
    const adminUsers = await adminUsersApi.getAll();
    const adminUser = adminUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password
    );
    
    if (adminUser && adminUser.isActive) {
      return {
        id: adminUser.id,
        type: 'admin',
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions
      };
    }
    
    // Check dealers
    const dealer = dealers.find(d => 
      d.email.toLowerCase() === email.toLowerCase() && 
      d.password === password && 
      d.isActive
    );
    
    if (dealer) {
      return {
        id: dealer.id,
        type: 'dealer',
        firstName: dealer.contactName.split(' ')[0] || '',
        lastName: dealer.contactName.split(' ').slice(1).join(' ') || '',
        email: dealer.email,
        dealerId: dealer.id,
        dealerName: dealer.companyName
      };
    }
    
    // Check vendors
    const vendor = vendors.find(v => 
      v.email.toLowerCase() === email.toLowerCase() && 
      v.password === password
    );
    
    if (vendor) {
      const vendorDealer = dealers.find(d => d.id === vendor.dealerId);
      
      if (vendorDealer && vendorDealer.isActive) {
        return {
          id: vendor.id,
          type: 'vendor',
          firstName: vendor.name.split(' ')[0] || '',
          lastName: vendor.name.split(' ').slice(1).join(' ') || '',
          email: vendor.email,
          dealerId: vendor.dealerId,
          dealerName: vendorDealer.companyName
        };
      }
    }
    
    throw new Error('Credenziali non valide o account disattivato');
  },
  
  // Get the current logged in user from localStorage
  getCurrentUser: (): AuthUser | null => {
    const userJson = localStorage.getItem('currentUser');
    
    if (!userJson) {
      return null;
    }
    
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },
  
  // Save the current user to localStorage
  saveUser: (user: AuthUser): void => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  
  // Clear the current user from localStorage
  clearUser: (): void => {
    localStorage.removeItem('currentUser');
  }
};
