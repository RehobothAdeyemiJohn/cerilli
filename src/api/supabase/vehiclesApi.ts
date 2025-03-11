
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './client';
import { Vehicle } from '@/types';

export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    console.log("Supabase API: getAll - Recupero veicoli");
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('dateadded', { ascending: false });

    if (error) {
      console.error('Errore nel recupero dei veicoli:', error);
      throw error;
    }

    // Format the data to match our frontend model
    const formattedVehicles = data.map(vehicle => ({
      ...vehicle,
      dateAdded: vehicle.dateadded,
      fuelType: vehicle.fueltype,
      exteriorColor: vehicle.exteriorcolor,
      reservedAccessories: vehicle.reservedaccessories,
    }));

    console.log("Supabase API: getAll - Dati recuperati:", formattedVehicles);
    return formattedVehicles as Vehicle[];
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

    // Format the data to match our frontend model
    const formattedVehicle = {
      ...data,
      dateAdded: data.dateadded,
      fuelType: data.fueltype,
      exteriorColor: data.exteriorcolor,
      reservedAccessories: data.reservedaccessories,
    };

    return formattedVehicle as Vehicle;
  },
  
  create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    console.log("Supabase API: create - Creazione veicolo:", vehicle);
    
    // Map frontend field names to database column names
    const newVehicle = {
      id: uuidv4(),
      model: vehicle.model,
      trim: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.trim || ''),
      fueltype: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.fuelType || ''),
      exteriorcolor: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.exteriorColor || ''),
      transmission: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.transmission || ''),
      telaio: vehicle.location === 'Stock Virtuale' ? '' : (vehicle.telaio || ''),
      accessories: vehicle.accessories || [],
      price: vehicle.location === 'Stock Virtuale' ? 0 : (vehicle.price || 0),
      location: vehicle.location,
      imageurl: vehicle.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
      dateadded: vehicle.dateAdded || new Date().toISOString().split('T')[0],
      status: vehicle.status || 'available',
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
    
    // Convert database field names to match our frontend model
    const formattedVehicle = {
      ...data,
      dateAdded: data.dateadded,
      fuelType: data.fueltype,
      exteriorColor: data.exteriorcolor,
      reservedAccessories: data.reservedaccessories,
    };
    
    return formattedVehicle as Vehicle;
  },
  
  update: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    // Convert frontend field names to match database column names
    const dbUpdates = {
      ...updates,
      dateadded: updates.dateAdded,
      fueltype: updates.fuelType,
      exteriorcolor: updates.exteriorColor,
      reservedaccessories: updates.reservedAccessories,
      updated_at: new Date().toISOString()
    };
    
    // Remove frontend fields that don't match database columns
    delete dbUpdates.dateAdded;
    delete dbUpdates.fuelType;
    delete dbUpdates.exteriorColor;
    delete dbUpdates.reservedAccessories;
    
    const { data, error } = await supabase
      .from('vehicles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiornamento del veicolo:', error);
      throw error;
    }
    
    // Convert database field names back to frontend model
    const formattedVehicle = {
      ...data,
      dateAdded: data.dateadded,
      fuelType: data.fueltype,
      exteriorColor: data.exteriorcolor,
      reservedAccessories: data.reservedaccessories,
    };
    
    return formattedVehicle as Vehicle;
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
