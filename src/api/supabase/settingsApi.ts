import { supabase } from './client';
import { 
  VehicleModel, 
  VehicleTrim, 
  FuelType, 
  ExteriorColor, 
  Transmission, 
  Accessory,
  Vehicle 
} from '@/types';

// Models API
export const modelsApi = {
  getAll: async (): Promise<VehicleModel[]> => {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<VehicleModel> => {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching model:', error);
      throw error;
    }
    
    return data;
  },
  
  create: async (model: Omit<VehicleModel, 'id'>): Promise<VehicleModel> => {
    const { data, error } = await supabase
      .from('models')
      .insert(model)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating model:', error);
      throw error;
    }
    
    return data;
  },
  
  update: async (id: string, updates: Partial<VehicleModel>): Promise<VehicleModel> => {
    const { data, error } = await supabase
      .from('models')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating model:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('models')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting model:', error);
      throw error;
    }
  }
};

// Trims API
export const trimsApi = {
  getAll: async (): Promise<VehicleTrim[]> => {
    const { data, error } = await supabase
      .from('trims')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching trims:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<VehicleTrim> => {
    const { data, error } = await supabase
      .from('trims')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching trim:', error);
      throw error;
    }
    
    return data;
  },
  
  create: async (trim: Omit<VehicleTrim, 'id'>): Promise<VehicleTrim> => {
    const { data, error } = await supabase
      .from('trims')
      .insert(trim)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating trim:', error);
      throw error;
    }
    
    return data;
  },
  
  update: async (id: string, updates: Partial<VehicleTrim>): Promise<VehicleTrim> => {
    const { data, error } = await supabase
      .from('trims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating trim:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('trims')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting trim:', error);
      throw error;
    }
  }
};

// Fuel Types API
export const fuelTypesApi = {
  getAll: async (): Promise<FuelType[]> => {
    const { data, error } = await supabase
      .from('fuel_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching fuel types:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<FuelType> => {
    const { data, error } = await supabase
      .from('fuel_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching fuel type:', error);
      throw error;
    }
    
    return data;
  },
  
  create: async (fuelType: Omit<FuelType, 'id'>): Promise<FuelType> => {
    const { data, error } = await supabase
      .from('fuel_types')
      .insert(fuelType)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating fuel type:', error);
      throw error;
    }
    
    return data;
  },
  
  update: async (id: string, updates: Partial<FuelType>): Promise<FuelType> => {
    const { data, error } = await supabase
      .from('fuel_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fuel type:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('fuel_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting fuel type:', error);
      throw error;
    }
  }
};

// Colors API
export const colorsApi = {
  getAll: async (): Promise<ExteriorColor[]> => {
    const { data, error } = await supabase
      .from('exterior_colors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<ExteriorColor> => {
    const { data, error } = await supabase
      .from('exterior_colors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching color:', error);
      throw error;
    }
    
    return data;
  },
  
  create: async (color: Omit<ExteriorColor, 'id'>): Promise<ExteriorColor> => {
    const { data, error } = await supabase
      .from('exterior_colors')
      .insert(color)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating color:', error);
      throw error;
    }
    
    return data;
  },
  
  update: async (id: string, updates: Partial<ExteriorColor>): Promise<ExteriorColor> => {
    const { data, error } = await supabase
      .from('exterior_colors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating color:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('exterior_colors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting color:', error);
      throw error;
    }
  }
};

// Transmissions API
export const transmissionsApi = {
  getAll: async (): Promise<Transmission[]> => {
    const { data, error } = await supabase
      .from('transmissions')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching transmissions:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<Transmission> => {
    const { data, error } = await supabase
      .from('transmissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching transmission:', error);
      throw error;
    }
    
    return data;
  },
  
  create: async (transmission: Omit<Transmission, 'id'>): Promise<Transmission> => {
    const { data, error } = await supabase
      .from('transmissions')
      .insert(transmission)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transmission:', error);
      throw error;
    }
    
    return data;
  },
  
  update: async (id: string, updates: Partial<Transmission>): Promise<Transmission> => {
    const { data, error } = await supabase
      .from('transmissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transmission:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('transmissions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting transmission:', error);
      throw error;
    }
  }
};

// Accessories API
export const accessoriesApi = {
  getAll: async (): Promise<Accessory[]> => {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching accessories:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<Accessory> => {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching accessory:', error);
      throw error;
    }
    
    return data;
  },
  
  create: async (accessory: Omit<Accessory, 'id'>): Promise<Accessory> => {
    const { data, error } = await supabase
      .from('accessories')
      .insert(accessory)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating accessory:', error);
      throw error;
    }
    
    return data;
  },
  
  update: async (id: string, updates: Partial<Accessory>): Promise<Accessory> => {
    const { data, error } = await supabase
      .from('accessories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating accessory:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('accessories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting accessory:', error);
      throw error;
    }
  }
};

// Price calculation utility
export const calculateVehiclePrice = (basePrice: number, options: {
  trimPrice?: number;
  fuelTypePrice?: number;
  colorPrice?: number;
  transmissionPrice?: number;
  accessoriesPrices?: number[];
}) => {
  const {
    trimPrice = 0,
    fuelTypePrice = 0,
    colorPrice = 0,
    transmissionPrice = 0,
    accessoriesPrices = []
  } = options;
  
  // Calculate accessories total
  const accessoriesTotal = accessoriesPrices.reduce((sum, price) => sum + price, 0);
  
  // Calculate total price
  const totalPrice = basePrice + trimPrice + fuelTypePrice + colorPrice + transmissionPrice + accessoriesTotal;
  
  return totalPrice;
};

// Combined export for settings API
export const settingsApi = {
  models: modelsApi,
  trims: trimsApi,
  fuelTypes: fuelTypesApi,
  colors: colorsApi,
  transmissions: transmissionsApi,
  accessories: accessoriesApi,
  calculatePrice: calculateVehiclePrice
};
