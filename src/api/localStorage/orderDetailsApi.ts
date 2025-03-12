
import { OrderDetails } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { KEYS, initLocalStorage } from './storageUtils';

export const orderDetailsApi = {
  getByOrderId: async (orderId: string): Promise<OrderDetails | null> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDER_DETAILS);
    const orderDetails = data ? JSON.parse(data) : [];
    const details = orderDetails.find((detail: OrderDetails) => detail.orderId === orderId);
    return details || null;
  },
  
  create: async (details: Omit<OrderDetails, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderDetails> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDER_DETAILS);
    const orderDetails = data ? JSON.parse(data) : [];
    
    const now = new Date().toISOString();
    const newDetails: OrderDetails = {
      ...details,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    orderDetails.push(newDetails);
    localStorage.setItem(KEYS.ORDER_DETAILS, JSON.stringify(orderDetails));
    
    return newDetails;
  },
  
  update: async (id: string, updates: Partial<OrderDetails>): Promise<OrderDetails> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDER_DETAILS);
    const orderDetails = data ? JSON.parse(data) : [];
    
    const index = orderDetails.findIndex((detail: OrderDetails) => detail.id === id);
    
    if (index === -1) {
      throw new Error('Dettagli ordine non trovati');
    }
    
    const updatedDetails = {
      ...orderDetails[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    orderDetails[index] = updatedDetails;
    localStorage.setItem(KEYS.ORDER_DETAILS, JSON.stringify(orderDetails));
    
    return updatedDetails;
  },
  
  generateODL: async (id: string): Promise<OrderDetails> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDER_DETAILS);
    const orderDetails = data ? JSON.parse(data) : [];
    
    const index = orderDetails.findIndex((detail: OrderDetails) => detail.id === id);
    
    if (index === -1) {
      throw new Error('Dettagli ordine non trovati');
    }
    
    const updatedDetails = {
      ...orderDetails[index],
      odlGenerated: true,
      updatedAt: new Date().toISOString()
    };
    
    orderDetails[index] = updatedDetails;
    localStorage.setItem(KEYS.ORDER_DETAILS, JSON.stringify(orderDetails));
    
    return updatedDetails;
  }
};
