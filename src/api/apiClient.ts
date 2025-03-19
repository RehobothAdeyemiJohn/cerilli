
import axios from 'axios';
import { Vehicle, Quote, Order } from '@/types';
import { vehiclesApi as localVehiclesApi, quotesApi as localQuotesApi } from './localStorage';
import { ordersApi as supabaseOrdersApi } from './supabase/ordersApi'; 

// Check if we're in a Lovable production environment
const isLovableProduction = window.location.hostname.includes('lovable.app');

// Base configuration for axios (used only in development environment)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API for vehicles
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

// API for quotes
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

// API for orders - ALWAYS use Supabase implementation regardless of environment
export const ordersApi = supabaseOrdersApi;

export default apiClient;
