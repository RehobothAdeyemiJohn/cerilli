
import { Dealer } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { KEYS, initLocalStorage } from './storageUtils';

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.DEALERS);
    return data ? JSON.parse(data) : [];
  },
  
  getById: async (id: string): Promise<Dealer> => {
    const dealers = await dealersApi.getAll();
    const dealer = dealers.find(d => d.id === id);
    if (!dealer) {
      throw new Error('Dealer non trovato');
    }
    return dealer;
  },
  
  create: async (dealer: Omit<Dealer, 'id'>): Promise<Dealer> => {
    const dealers = await dealersApi.getAll();
    const newDealer = {
      ...dealer,
      id: uuidv4(),
    };
    
    dealers.push(newDealer);
    localStorage.setItem(KEYS.DEALERS, JSON.stringify(dealers));
    
    return newDealer;
  },
  
  update: async (id: string, updates: Partial<Dealer>): Promise<Dealer> => {
    const dealers = await dealersApi.getAll();
    const index = dealers.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('Dealer non trovato');
    }
    
    const updatedDealer = {
      ...dealers[index],
      ...updates,
    };
    
    dealers[index] = updatedDealer;
    localStorage.setItem(KEYS.DEALERS, JSON.stringify(dealers));
    
    return updatedDealer;
  },
  
  delete: async (id: string): Promise<void> => {
    const dealers = await dealersApi.getAll();
    const filteredDealers = dealers.filter(d => d.id !== id);
    
    if (filteredDealers.length === dealers.length) {
      throw new Error('Dealer non trovato');
    }
    
    localStorage.setItem(KEYS.DEALERS, JSON.stringify(filteredDealers));
  }
};
