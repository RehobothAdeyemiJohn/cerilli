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
      id: vehicle.id,
      model: vehicle.model,
      trim: vehicle.trim,
      fuelType: vehicle.fueltype,
      exteriorColor: vehicle.exteriorcolor,
      accessories: vehicle.accessories || [],
      price: vehicle.price,
      location: vehicle.location,
      imageUrl: vehicle.imageurl,
      status: vehicle.status,
      dateAdded: vehicle.dateadded,
      transmission: vehicle.transmission,
      telaio: vehicle.telaio,
      previousChassis: vehicle.previous_chassis,
      originalStock: vehicle.original_stock,
      reservedBy: vehicle.reservedby,
      reservedAccessories: vehicle.reservedaccessories || [],
      virtualConfig: vehicle.virtualconfig,
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
      id: data.id,
      model: data.model,
      trim: data.trim,
      fuelType: data.fueltype,
      exteriorColor: data.exteriorcolor,
      accessories: data.accessories || [],
      price: data.price,
      location: data.location,
      imageUrl: data.imageurl,
      status: data.status,
      dateAdded: data.dateadded,
      transmission: data.transmission,
      telaio: data.telaio,
      previousChassis: data.previous_chassis,
      originalStock: data.original_stock,
      reservedBy: data.reservedby,
      reservedAccessories: data.reservedaccessories || [],
      virtualConfig: data.virtualconfig,
    };

    console.log("Supabase API: getById - Veicolo recuperato:", formattedVehicle);
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
      previous_chassis: vehicle.previousChassis || null,
      original_stock: vehicle.originalStock || null,
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
      id: data.id,
      model: data.model,
      trim: data.trim,
      fuelType: data.fueltype,
      exteriorColor: data.exteriorcolor,
      accessories: data.accessories || [],
      price: data.price,
      location: data.location,
      imageUrl: data.imageurl,
      status: data.status,
      dateAdded: data.dateadded,
      transmission: data.transmission,
      telaio: data.telaio,
      previousChassis: data.previous_chassis,
      originalStock: data.original_stock,
      reservedBy: data.reservedby,
      reservedAccessories: data.reservedaccessories || [],
      virtualConfig: data.virtualconfig,
    };
    
    return formattedVehicle as Vehicle;
  },
  
  update: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    // Convert frontend field names to match database column names
    const dbUpdates: any = {
      model: updates.model,
      trim: updates.trim,
      fueltype: updates.fuelType,
      exteriorcolor: updates.exteriorColor,
      accessories: updates.accessories,
      price: updates.price,
      location: updates.location,
      imageurl: updates.imageUrl,
      status: updates.status,
      dateadded: updates.dateAdded,
      transmission: updates.transmission,
      telaio: updates.telaio,
      previous_chassis: updates.previousChassis,
      original_stock: updates.originalStock,
      reservedby: updates.reservedBy,
      reservedaccessories: updates.reservedAccessories,
      virtualconfig: updates.virtualConfig,
      updated_at: new Date().toISOString()
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    console.log("Supabase API: update - Richiesta update:", dbUpdates);
    
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
    
    console.log("Supabase API: update - Risposta:", data);
    
    // Convert database field names back to frontend model
    const formattedVehicle = {
      id: data.id,
      model: data.model,
      trim: data.trim,
      fuelType: data.fueltype,
      exteriorColor: data.exteriorcolor,
      accessories: data.accessories || [],
      price: data.price,
      location: data.location,
      imageUrl: data.imageurl,
      status: data.status,
      dateAdded: data.dateadded,
      transmission: data.transmission,
      telaio: data.telaio,
      previousChassis: data.previous_chassis,
      originalStock: data.original_stock,
      reservedBy: data.reservedby,
      reservedAccessories: data.reservedaccessories || [],
      virtualConfig: data.virtualconfig,
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
  
  reserve: async (id: string, dealerId: string, reservedBy: string, reservedAccessories?: string[], virtualConfig?: Vehicle['virtualConfig'], reservationDestination?: string): Promise<Vehicle> => {
    console.log("Supabase API: reserve - Prenotazione veicolo:", {
      id, dealerId, reservedBy, reservedAccessories, virtualConfig
    });
    
    const vehicle = await vehiclesApi.getById(id);
    
    if (vehicle.status !== 'available') {
      throw new Error('Il veicolo non è disponibile per la prenotazione');
    }
    
    const updatedVehicle: Partial<Vehicle> = {
      status: 'reserved',
      reservedBy,
      reservedAccessories: reservedAccessories || [],
      reservationTimestamp: new Date().toISOString(), // Add reservation timestamp
      reservationDestination
    };
    
    // Add virtual configuration if provided
    if (virtualConfig) {
      updatedVehicle.virtualConfig = virtualConfig;
    }
    
    return vehiclesApi.update(id, updatedVehicle);
  },
  
  transformToOrder: async (id: string): Promise<Vehicle> => {
    console.log("Supabase API: transformToOrder - Trasforma prenotazione in ordine:", id);
    
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
