
import { Vehicle } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { KEYS, initLocalStorage } from './storageUtils';

export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
  },
  
  getById: async (id: string): Promise<Vehicle> => {
    const vehicles = await vehiclesApi.getAll();
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) {
      throw new Error('Veicolo non trovato');
    }
    return vehicle;
  },
  
  create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const vehicles = await vehiclesApi.getAll();
    
    // Impostazione dei valori di default
    const newVehicle = {
      ...vehicle,
      id: uuidv4(),
      imageUrl: vehicle.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
      dateAdded: vehicle.dateAdded || new Date().toISOString().split('T')[0],
      accessories: vehicle.accessories || [],
      // Per Stock Virtuale, lasciamo alcuni campi vuoti o con valori predefiniti
      trim: vehicle.trim || '',
      fuelType: vehicle.fuelType || '',
      exteriorColor: vehicle.exteriorColor || '',
      transmission: vehicle.transmission || '',
      telaio: vehicle.telaio || '',
      price: vehicle.location === 'Stock Virtuale' ? 0 : (vehicle.price || 0),
    };
    
    const updatedVehicles = [...vehicles, newVehicle];
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(updatedVehicles));
    
    console.log('Vehicle saved:', newVehicle);
    console.log('Updated vehicles array:', updatedVehicles);
    
    return newVehicle;
  },
  
  update: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    const vehicles = await vehiclesApi.getAll();
    const index = vehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error('Veicolo non trovato');
    }
    
    const updatedVehicle = {
      ...vehicles[index],
      ...updates,
    };
    
    vehicles[index] = updatedVehicle;
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(vehicles));
    
    return updatedVehicle;
  },
  
  delete: async (id: string): Promise<void> => {
    const vehicles = await vehiclesApi.getAll();
    const filteredVehicles = vehicles.filter(v => v.id !== id);
    
    if (filteredVehicles.length === vehicles.length) {
      throw new Error('Veicolo non trovato');
    }
    
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(filteredVehicles));
  }
};
