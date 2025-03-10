
import axios from 'axios';
import { Vehicle, Quote, Order } from '@/types';

// Configurazione di base per axios
const apiClient = axios.create({
  // Cambia questo URL con l'indirizzo del tuo server quando sarà pronto
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API per i veicoli
export const vehiclesApi = {
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

// Puoi aggiungere API simili per quote e orders

export default apiClient;
