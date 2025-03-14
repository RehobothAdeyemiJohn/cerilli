
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
    
    // Calculate estimated arrival days for virtual stock
    let estimatedArrivalDays = vehicle.estimatedArrivalDays;
    if (vehicle.location === 'Stock Virtuale' && vehicle.originalStock && !estimatedArrivalDays) {
      // Different arrival time estimates based on the original stock location
      if (vehicle.originalStock === 'Germania') {
        // Germany stock: 38-52 days
        estimatedArrivalDays = Math.floor(Math.random() * (52 - 38 + 1)) + 38;
      } else {
        // China stock (default): 90-120 days
        estimatedArrivalDays = Math.floor(Math.random() * (120 - 90 + 1)) + 90;
      }
      console.log(`Giorni di arrivo stimati per stock ${vehicle.originalStock}: ${estimatedArrivalDays}`);
    }
    
    // Impostazione dei valori di default
    const newVehicle = {
      ...vehicle,
      id: uuidv4(),
      imageUrl: vehicle.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
      dateAdded: vehicle.dateAdded || new Date().toISOString().split('T')[0],
      accessories: vehicle.accessories || [],
      // Per Stock Virtuale, lasciamo solo il modello obbligatorio
      trim: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.trim || ''),
      fuelType: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.fuelType || ''),
      exteriorColor: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.exteriorColor || ''),
      transmission: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.transmission || ''),
      telaio: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.telaio || ''),
      price: vehicle.location === 'Stock Virtuale' ? 0 : (vehicle.price || 0),
      originalStock: vehicle.location === 'Stock Virtuale' ? (vehicle.originalStock || undefined) : undefined,
      estimatedArrivalDays: estimatedArrivalDays
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
    
    // If updating to stock virtuale and original stock is provided, calculate estimated arrival days
    let estimatedArrivalDays = updates.estimatedArrivalDays;
    if (updates.location === 'Stock Virtuale' && updates.originalStock && !estimatedArrivalDays) {
      if (updates.originalStock === 'Germania') {
        estimatedArrivalDays = Math.floor(Math.random() * (52 - 38 + 1)) + 38;
      } else {
        estimatedArrivalDays = Math.floor(Math.random() * (120 - 90 + 1)) + 90;
      }
      console.log(`Giorni di arrivo stimati per stock ${updates.originalStock}: ${estimatedArrivalDays}`);
    }
    
    const updatedVehicle = {
      ...vehicles[index],
      ...updates,
      estimatedArrivalDays: estimatedArrivalDays || updates.estimatedArrivalDays || vehicles[index].estimatedArrivalDays
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
  },
  
  duplicate: async (id: string): Promise<Vehicle> => {
    const vehicle = await vehiclesApi.getById(id);
    
    const { id: _, ...vehicleWithoutId } = vehicle;
    
    return vehiclesApi.create({
      ...vehicleWithoutId,
      dateAdded: new Date().toISOString().split('T')[0],
    });
  },
  
  reserve: async (id: string, dealerId: string, reservedBy: string, reservedAccessories?: string[], virtualConfig?: Vehicle['virtualConfig'], reservationDestination?: string): Promise<Vehicle> => {
    const vehicle = await vehiclesApi.getById(id);
    
    if (vehicle.status !== 'available') {
      throw new Error('Il veicolo non è disponibile per la prenotazione');
    }
    
    // Calculate estimated arrival days if it's a virtual vehicle and doesn't already have it set
    let estimatedArrivalDays = vehicle.estimatedArrivalDays;
    if (vehicle.location === 'Stock Virtuale' && vehicle.originalStock && !estimatedArrivalDays) {
      if (vehicle.originalStock === 'Germania') {
        estimatedArrivalDays = Math.floor(Math.random() * (52 - 38 + 1)) + 38;
      } else {
        estimatedArrivalDays = Math.floor(Math.random() * (120 - 90 + 1)) + 90;
      }
    }
    
    const updatedVehicle: Vehicle = {
      ...vehicle,
      status: 'reserved' as const,
      reservedBy,
      reservedAccessories: reservedAccessories || [],
      reservationDestination,
      reservationTimestamp: new Date().toISOString(),
      estimatedArrivalDays
    };
    
    if (virtualConfig) {
      updatedVehicle.virtualConfig = virtualConfig;
    }
    
    return vehiclesApi.update(id, updatedVehicle);
  },
  
  transformToOrder: async (id: string): Promise<Vehicle> => {
    console.log("LocalStorage API: transformToOrder - Trasforma prenotazione in ordine:", id);
    
    const vehicle = await vehiclesApi.getById(id);
    
    if (vehicle.status !== 'reserved') {
      throw new Error('Il veicolo non è prenotato e non può essere trasformato in ordine');
    }
    
    const updatedVehicle: Partial<Vehicle> = {
      status: 'ordered',
    };
    
    return vehiclesApi.update(id, updatedVehicle);
  }
};
