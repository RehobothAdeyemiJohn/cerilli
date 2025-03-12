
import { LoginCredentials, AuthUser } from '@/types/auth';
import { supabase } from './supabase/client';
import { vendors } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { dealersApi } from '@/api/supabase/dealersApi';

// Key to store the session ID in localStorage
const SESSION_ID_KEY = 'cmcSessionId';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    const { email, password } = credentials;
    
    // Check admin users first in Supabase
    const { data: adminUsers, error: adminError } = await supabase
      .rpc('get_admin_user_by_email', { p_email: email });
    
    if (adminError) {
      console.error('Error fetching admin user:', adminError);
    }
    
    const adminUser = adminUsers?.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password &&
      user.active
    );
    
    if (adminUser) {
      // Update last login timestamp
      try {
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', adminUser.id);
      } catch (err) {
        console.error('Error updating last login:', err);
      }
      
      return {
        id: adminUser.id,
        type: 'admin',
        firstName: adminUser.first_name,
        lastName: adminUser.last_name,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions
      };
    }
    
    // Check dealers using Supabase, not mock data
    try {
      const allDealers = await dealersApi.getAll();
      
      // Trova il dealer corrispondente alle credenziali
      const dealer = allDealers.find(d => 
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
      
      // Se non è un dealer, controlla se è un vendor
      // Per ora i vendor sono ancora in mockData
      const vendor = vendors.find(v => 
        v.email.toLowerCase() === email.toLowerCase() && 
        v.password === password
      );
      
      if (vendor) {
        // Verifica che il dealer associato esista e sia attivo
        const vendorDealer = allDealers.find(d => d.id === vendor.dealerId);
        
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
      
      // Se arriviamo qui, le credenziali non sono valide o l'account è disattivato
      throw new Error('Credenziali non valide o account disattivato');
      
    } catch (error) {
      console.error('Error during dealer/vendor authentication:', error);
      throw new Error('Errore durante l\'autenticazione. Riprova più tardi.');
    }
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
  
  // Get or create a unique session ID for the current browser
  getOrCreateSessionId: (): string => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  },
  
  // Save the current user to localStorage
  saveUser: (user: AuthUser): void => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Ensure we have a session ID
    authService.getOrCreateSessionId();
  },
  
  // Clear the current user from localStorage
  clearUser: (): void => {
    localStorage.removeItem('currentUser');
  }
};
