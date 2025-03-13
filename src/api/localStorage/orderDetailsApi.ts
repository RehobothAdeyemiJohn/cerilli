
import { OrderDetails } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { KEYS, initLocalStorage } from './storageUtils';
import { ordersApi } from './ordersApi';

export const orderDetailsApi = {
  getByOrderId: async (orderId: string): Promise<OrderDetails | null> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDER_DETAILS);
    const orderDetails = data ? JSON.parse(data) : [];
    const details = orderDetails.find((detail: OrderDetails) => detail.orderId === orderId);
    return details || null;
  },
  
  getAll: async (): Promise<OrderDetails[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDER_DETAILS);
    return data ? JSON.parse(data) : [];
  },
  
  create: async (details: Omit<OrderDetails, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderDetails> => {
    const orderDetails = await orderDetailsApi.getAll();
    
    const now = new Date().toISOString();
    const newDetails: OrderDetails = {
      ...details,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    orderDetails.push(newDetails);
    localStorage.setItem(KEYS.ORDER_DETAILS, JSON.stringify(orderDetails));
    
    // Update the order object to include order details
    try {
      const order = await ordersApi.getById(details.orderId);
      await ordersApi.update(details.orderId, { 
        ...order,
        details: newDetails 
      });
    } catch (error) {
      console.error('Error updating order with details:', error);
    }
    
    return newDetails;
  },
  
  update: async (id: string, updates: Partial<OrderDetails>): Promise<OrderDetails> => {
    const orderDetails = await orderDetailsApi.getAll();
    const index = orderDetails.findIndex((detail: OrderDetails) => detail.id === id);
    
    if (index === -1) {
      throw new Error('Dettagli ordine non trovati');
    }
    
    const now = new Date().toISOString();
    const updatedDetails = {
      ...orderDetails[index],
      ...updates,
      updatedAt: now
    };
    
    orderDetails[index] = updatedDetails;
    localStorage.setItem(KEYS.ORDER_DETAILS, JSON.stringify(orderDetails));
    
    // Update the order object to include updated order details
    try {
      if (updatedDetails.orderId) {
        const order = await ordersApi.getById(updatedDetails.orderId);
        await ordersApi.update(updatedDetails.orderId, { 
          ...order,
          details: updatedDetails 
        });
      }
    } catch (error) {
      console.error('Error updating order with details:', error);
    }
    
    return updatedDetails;
  },
  
  generateODL: async (id: string): Promise<OrderDetails> => {
    const orderDetails = await orderDetailsApi.getAll();
    const index = orderDetails.findIndex((detail: OrderDetails) => detail.id === id);
    
    if (index === -1) {
      throw new Error('Dettagli ordine non trovati');
    }
    
    const now = new Date().toISOString();
    const updatedDetails = {
      ...orderDetails[index],
      odlGenerated: true,
      updatedAt: now
    };
    
    orderDetails[index] = updatedDetails;
    localStorage.setItem(KEYS.ORDER_DETAILS, JSON.stringify(orderDetails));
    
    // Update the order object to include updated order details
    try {
      if (updatedDetails.orderId) {
        const order = await ordersApi.getById(updatedDetails.orderId);
        await ordersApi.update(updatedDetails.orderId, { 
          ...order,
          details: updatedDetails 
        });
      }
    } catch (error) {
      console.error('Error updating order with details:', error);
    }
    
    return updatedDetails;
  }
};
