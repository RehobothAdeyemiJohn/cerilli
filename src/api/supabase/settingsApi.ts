
import { supabase } from './client';
import { 
  VehicleModel, 
  VehicleTrim, 
  FuelType, 
  ExteriorColor, 
  Transmission, 
  Accessory 
} from '@/types';

// Models API
const modelsApi = {
  getAll: async (): Promise<VehicleModel[]> => {
    const { data, error } = await supabase
      .from('settings_models')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching models:', error);
      return [];
    }
    
    return data as VehicleModel[];
  },
  
  getById: async (id: string): Promise<VehicleModel | null> => {
    const { data, error } = await supabase
      .from('settings_models')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching model by id:', error);
      return null;
    }
    
    return data as VehicleModel;
  },
  
  create: async (model: Omit<VehicleModel, 'id'>): Promise<VehicleModel> => {
    const { data, error } = await supabase
      .from('settings_models')
      .insert([model])
      .select()
      .single();
    
    if (error) throw error;
    return data as VehicleModel;
  },
  
  update: async (id: string, model: VehicleModel): Promise<VehicleModel> => {
    const { data, error } = await supabase
      .from('settings_models')
      .update(model)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as VehicleModel;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('settings_models')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Trims API
const trimsApi = {
  getAll: async (): Promise<VehicleTrim[]> => {
    const { data, error } = await supabase
      .from('settings_trims')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching trims:', error);
      return [];
    }
    
    return data as VehicleTrim[];
  },
  
  getById: async (id: string): Promise<VehicleTrim | null> => {
    const { data, error } = await supabase
      .from('settings_trims')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching trim by id:', error);
      return null;
    }
    
    return data as VehicleTrim;
  },
  
  create: async (trim: Omit<VehicleTrim, 'id'>): Promise<VehicleTrim> => {
    const { data, error } = await supabase
      .from('settings_trims')
      .insert([trim])
      .select()
      .single();
    
    if (error) throw error;
    return data as VehicleTrim;
  },
  
  update: async (id: string, trim: VehicleTrim): Promise<VehicleTrim> => {
    const { data, error } = await supabase
      .from('settings_trims')
      .update(trim)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as VehicleTrim;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('settings_trims')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Fuel Types API
const fuelTypesApi = {
  getAll: async (): Promise<FuelType[]> => {
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching fuel types:', error);
      return [];
    }
    
    return data as FuelType[];
  },
  
  getById: async (id: string): Promise<FuelType | null> => {
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching fuel type by id:', error);
      return null;
    }
    
    return data as FuelType;
  },
  
  create: async (fuelType: Omit<FuelType, 'id'>): Promise<FuelType> => {
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .insert([fuelType])
      .select()
      .single();
    
    if (error) throw error;
    return data as FuelType;
  },
  
  update: async (id: string, fuelType: FuelType): Promise<FuelType> => {
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .update(fuelType)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as FuelType;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('settings_fuel_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Colors API
const colorsApi = {
  getAll: async (): Promise<ExteriorColor[]> => {
    const { data, error } = await supabase
      .from('settings_colors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching colors:', error);
      return [];
    }
    
    return data as ExteriorColor[];
  },
  
  getById: async (id: string): Promise<ExteriorColor | null> => {
    const { data, error } = await supabase
      .from('settings_colors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching color by id:', error);
      return null;
    }
    
    return data as ExteriorColor;
  },
  
  create: async (color: Omit<ExteriorColor, 'id'>): Promise<ExteriorColor> => {
    const { data, error } = await supabase
      .from('settings_colors')
      .insert([color])
      .select()
      .single();
    
    if (error) throw error;
    return data as ExteriorColor;
  },
  
  update: async (id: string, color: ExteriorColor): Promise<ExteriorColor> => {
    const { data, error } = await supabase
      .from('settings_colors')
      .update(color)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ExteriorColor;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('settings_colors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Transmissions API
const transmissionsApi = {
  getAll: async (): Promise<Transmission[]> => {
    const { data, error } = await supabase
      .from('settings_transmissions')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching transmissions:', error);
      return [];
    }
    
    return data as Transmission[];
  },
  
  getById: async (id: string): Promise<Transmission | null> => {
    const { data, error } = await supabase
      .from('settings_transmissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching transmission by id:', error);
      return null;
    }
    
    return data as Transmission;
  },
  
  create: async (transmission: Omit<Transmission, 'id'>): Promise<Transmission> => {
    const { data, error } = await supabase
      .from('settings_transmissions')
      .insert([transmission])
      .select()
      .single();
    
    if (error) throw error;
    return data as Transmission;
  },
  
  update: async (id: string, transmission: Transmission): Promise<Transmission> => {
    const { data, error } = await supabase
      .from('settings_transmissions')
      .update(transmission)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Transmission;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('settings_transmissions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Accessories API
const accessoriesApi = {
  getAll: async (): Promise<Accessory[]> => {
    const { data, error } = await supabase
      .from('settings_accessories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching accessories:', error);
      return [];
    }
    
    return data as Accessory[];
  },
  
  getById: async (id: string): Promise<Accessory | null> => {
    const { data, error } = await supabase
      .from('settings_accessories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching accessory by id:', error);
      return null;
    }
    
    return data as Accessory;
  },
  
  getCompatible: async (modelId: string, trimId: string): Promise<Accessory[]> => {
    const { data, error } = await supabase
      .from('settings_accessories')
      .select('*');
    
    if (error) {
      console.error('Error fetching compatible accessories:', error);
      return [];
    }
    
    // Filter accessories that are compatible with the model and trim
    return (data as Accessory[]).filter(accessory => {
      const modelCompatible = accessory.compatibleModels.length === 0 || 
                             accessory.compatibleModels.includes(modelId);
      const trimCompatible = accessory.compatibleTrims.length === 0 || 
                            accessory.compatibleTrims.includes(trimId);
      return modelCompatible && trimCompatible;
    });
  },
  
  create: async (accessory: Omit<Accessory, 'id'>): Promise<Accessory> => {
    // Calculate priceWithoutVAT
    const priceWithoutVAT = Math.round((accessory.priceWithVAT || 0) / 1.22);
    
    const { data, error } = await supabase
      .from('settings_accessories')
      .insert([{ ...accessory, priceWithoutVAT }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Accessory;
  },
  
  update: async (id: string, accessory: Partial<Accessory>): Promise<Accessory> => {
    // If priceWithVAT is being updated, recalculate priceWithoutVAT
    let updates = { ...accessory };
    if (accessory.priceWithVAT !== undefined) {
      updates.priceWithoutVAT = Math.round(accessory.priceWithVAT / 1.22);
    }
    
    const { data, error } = await supabase
      .from('settings_accessories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Accessory;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('settings_accessories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Helper function to calculate vehicle price
const calculateVehiclePrice = async (
  modelId: string,
  trimId: string,
  fuelTypeId: string,
  colorId: string,
  transmissionId: string,
  accessoryIds: string[]
): Promise<number> => {
  let totalPrice = 0;
  
  try {
    // Get model
    const model = await modelsApi.getById(modelId);
    if (model) {
      totalPrice += model.basePrice;
    }
    
    // Get trim
    const trim = await trimsApi.getById(trimId);
    if (trim) {
      totalPrice += trim.basePrice;
    }
    
    // Get fuel type
    const fuelType = await fuelTypesApi.getById(fuelTypeId);
    if (fuelType) {
      totalPrice += fuelType.priceAdjustment;
    }
    
    // Get color
    const color = await colorsApi.getById(colorId);
    if (color) {
      totalPrice += color.priceAdjustment;
    }
    
    // Get transmission
    const transmission = await transmissionsApi.getById(transmissionId);
    if (transmission) {
      totalPrice += transmission.priceAdjustment;
    }
    
    // Get accessories and sum their prices
    if (accessoryIds.length > 0) {
      const accessories = await accessoriesApi.getAll();
      const selectedAccessories = accessories.filter(acc => accessoryIds.includes(acc.id));
      for (const acc of selectedAccessories) {
        totalPrice += acc.priceWithVAT;
      }
    }
    
    return totalPrice;
  } catch (error) {
    console.error('Error calculating vehicle price:', error);
    return 0;
  }
};

// Settings API for the app
export const settingsApi = {
  getSettings: async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
    
    return data;
  },
  
  updateSettings: async (settings: any) => {
    const { data, error } = await supabase
      .from('app_settings')
      .update(settings)
      .eq('id', 1)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export {
  modelsApi,
  trimsApi,
  fuelTypesApi,
  colorsApi,
  transmissionsApi,
  accessoriesApi,
  calculateVehiclePrice
};
