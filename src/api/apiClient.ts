
import axios from 'axios';
import { Vehicle, Quote, Order } from '@/types';
import { vehiclesApi as localVehiclesApi, quotesApi as localQuotesApi, ordersApi as localOrdersApi } from './localStorageClient';

// Controlliamo se siamo in un ambiente di produzione Lovable
const isLovableProduction = window.location.hostname.includes('lovable.app');

// Configurazione di base per axios (usato solo in ambiente di sviluppo)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API per i veicoli
export const vehiclesApi = isLovableProduction ? localVehiclesApi : {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get('/vehicles');
    return response.data;
  },
  
  getById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get(`/vehicles/${id}`);
    return response.data;
  },
  
  create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const response = await apiClient.post('/vehicles', vehicle);
    return response.data;
  },
  
  update: async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await apiClient.put(`/vehicles/${id}`, vehicle);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`);
  }
};

// API per preventivi (quotes)
export const quotesApi = isLovableProduction ? localQuotesApi : {
  getAll: async (): Promise<Quote[]> => {
    const response = await apiClient.get('/quotes');
    return response.data;
  },
  
  getById: async (id: string): Promise<Quote> => {
    const response = await apiClient.get(`/quotes/${id}`);
    return response.data;
  },
  
  create: async (quote: Omit<Quote, 'id'>): Promise<Quote> => {
    const response = await apiClient.post('/quotes', quote);
    return response.data;
  },
  
  update: async (id: string, quote: Partial<Quote>): Promise<Quote> => {
    const response = await apiClient.put(`/quotes/${id}`, quote);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quotes/${id}`);
  }
};

// API per ordini (orders)
export const ordersApi = isLovableProduction ? localOrdersApi : {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },
  
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
  
  create: async (order: Omit<Order, 'id'>): Promise<Order> => {
    const response = await apiClient.post('/orders', order);
    return response.data;
  },
  
  update: async (id: string, order: Partial<Order>): Promise<Order> => {
    const response = await apiClient.put(`/orders/${id}`, order);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  }
};

export default apiClient;
