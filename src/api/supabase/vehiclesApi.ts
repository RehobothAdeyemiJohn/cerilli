import { v4 as uuidv4 } from 'uuid';
import { supabase } from './client';
import { Vehicle } from '@/types';

export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    console.log("Supabase API: getAll - Recupero veicoli");
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('dateAdded', { ascending: false });

    if (error) {
      console.error('Errore nel recupero dei veicoli:', error);
      throw error;
    }

    console.log("Supabase API: getAll - Dati recuperati:", data);
    return data as Vehicle[];
  },
  
  getById: async (id: string): Promise<Vehicle> => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore nel recupero del veicolo:', error);
      throw error;
    }

    return data as Vehicle;
  },
  
  create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    console.log("Supabase API: create - Creazione veicolo:", vehicle);
    
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log("Supabase API: create - Richiesta insert:", newVehicle);
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert(newVehicle)
      .select()
      .single();

    if (error) {
      console.error('Errore nella creazione del veicolo:', error);
      throw error;
    }
    
    console.log("Supabase API: create - Risposta:", data);
    return data as Vehicle;
  },
  
  update: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('vehicles')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiornamento del veicolo:', error);
      throw error;
    }
    
    return data as Vehicle;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Errore nell\'eliminazione del veicolo:', error);
      throw error;
    }
  },
  
  duplicate: async (id: string): Promise<Vehicle> => {
    // Get the vehicle to duplicate
    const vehicle = await vehiclesApi.getById(id);
    
    // Create a new vehicle with the same properties but a new ID
    const { id: _, ...vehicleWithoutId } = vehicle;
    
    // Add the duplicated vehicle
    return vehiclesApi.create({
      ...vehicleWithoutId,
      dateAdded: new Date().toISOString().split('T')[0], // Use current date
    });
  },
  
  reserve: async (id: string, dealerId: string, reservedBy: string, reservedAccessories?: string[], virtualConfig?: Vehicle['virtualConfig']): Promise<Vehicle> => {
    const vehicle = await vehiclesApi.getById(id);
    
    if (vehicle.status !== 'available') {
      throw new Error('Il veicolo non è disponibile per la prenotazione');
    }
    
    const updatedVehicle: Partial<Vehicle> = {
      status: 'reserved',
      reservedBy,
      reservedAccessories: reservedAccessories || [],
    };
    
    // Add virtual configuration if provided
    if (virtualConfig) {
      updatedVehicle.virtualConfig = virtualConfig;
    }
    
    return vehiclesApi.update(id, updatedVehicle);
  }
};
