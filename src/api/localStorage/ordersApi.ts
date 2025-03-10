
import { Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { KEYS, initLocalStorage } from './storageUtils';

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  
  getById: async (id: string): Promise<Order> => {
    const orders = await ordersApi.getAll();
    const order = orders.find(o => o.id === id);
    if (!order) {
      throw new Error('Ordine non trovato');
    }
    return order;
  },
  
  create: async (order: Omit<Order, 'id'>): Promise<Order> => {
    const orders = await ordersApi.getAll();
    const newOrder = {
      ...order,
      id: uuidv4(),
    };
    
    orders.push(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    
    return newOrder;
  },
  
  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    const orders = await ordersApi.getAll();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      throw new Error('Ordine non trovato');
    }
    
    const updatedOrder = {
      ...orders[index],
      ...updates,
    };
    
    orders[index] = updatedOrder;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    
    return updatedOrder;
  },
  
  delete: async (id: string): Promise<void> => {
    const orders = await ordersApi.getAll();
    const filteredOrders = orders.filter(o => o.id !== id);
    
    if (filteredOrders.length === orders.length) {
      throw new Error('Ordine non trovato');
    }
    
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(filteredOrders));
  }
};
