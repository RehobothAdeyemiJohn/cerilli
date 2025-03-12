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
export const modelsApi = {
  getAll: async (): Promise<VehicleModel[]> => {
    const { data, error } = await supabase
      .from('settings_models')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
    
    return data.map(model => ({
      id: model.id,
      name: model.name,
      basePrice: model.base_price
    }));
  },
  
  getById: async (id: string): Promise<VehicleModel | null> => {
    const { data, error } = await supabase
      .from('settings_models')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching model:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      basePrice: data.base_price
    };
  },
  
  create: async (model: Omit<VehicleModel, 'id'>): Promise<VehicleModel> => {
    const { data, error } = await supabase
      .from('settings_models')
      .insert({
        name: model.name,
        base_price: model.basePrice
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating model:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      basePrice: data.base_price
    };
  },
  
  update: async (id: string, model: VehicleModel): Promise<VehicleModel> => {
    const { data, error } = await supabase
      .from('settings_models')
      .update({
        name: model.name,
        base_price: model.basePrice,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating model:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      basePrice: data.base_price
    };
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('settings_models')
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
      .from('settings_trims')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching trims:', error);
      throw error;
    }
    
    return data.map(trim => ({
      id: trim.id,
      name: trim.name,
      basePrice: trim.price_adjustment,
      compatibleModels: trim.compatible_models || []
    }));
  },
  
  getById: async (id: string): Promise<VehicleTrim | null> => {
    const { data, error } = await supabase
      .from('settings_trims')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching trim:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      basePrice: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  create: async (trim: Omit<VehicleTrim, 'id'>): Promise<VehicleTrim> => {
    const { data, error } = await supabase
      .from('settings_trims')
      .insert({
        name: trim.name,
        price_adjustment: trim.basePrice,
        compatible_models: trim.compatibleModels || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating trim:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      basePrice: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  update: async (id: string, trim: VehicleTrim): Promise<VehicleTrim> => {
    const { data, error } = await supabase
      .from('settings_trims')
      .update({
        name: trim.name,
        price_adjustment: trim.basePrice,
        compatible_models: trim.compatibleModels || [],
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating trim:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      basePrice: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('settings_trims')
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
      .from('settings_fuel_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching fuel types:', error);
      throw error;
    }
    
    return data.map(fuelType => ({
      id: fuelType.id,
      name: fuelType.name,
      priceAdjustment: fuelType.price_adjustment,
      compatibleModels: fuelType.compatible_models || []
    }));
  },
  
  getById: async (id: string): Promise<FuelType | null> => {
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching fuel type:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  create: async (fuelType: Omit<FuelType, 'id'>): Promise<FuelType> => {
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .insert({
        name: fuelType.name,
        price_adjustment: fuelType.priceAdjustment,
        compatible_models: fuelType.compatibleModels || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating fuel type:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  update: async (id: string, fuelType: FuelType): Promise<FuelType> => {
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .update({
        name: fuelType.name,
        price_adjustment: fuelType.priceAdjustment,
        compatible_models: fuelType.compatibleModels || [],
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fuel type:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('settings_fuel_types')
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
      .from('settings_colors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
    
    return data.map(color => ({
      id: color.id,
      name: color.name,
      type: color.type,
      priceAdjustment: color.price_adjustment,
      compatibleModels: color.compatible_models || []
    }));
  },
  
  getById: async (id: string): Promise<ExteriorColor | null> => {
    const { data, error } = await supabase
      .from('settings_colors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching color:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  create: async (color: Omit<ExteriorColor, 'id'>): Promise<ExteriorColor> => {
    console.log('Creating color in Supabase:', color);
    
    const { data, error } = await supabase
      .from('settings_colors')
      .insert({
        name: color.name,
        type: color.type,
        price_adjustment: color.priceAdjustment,
        compatible_models: color.compatibleModels || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating color:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  update: async (id: string, color: ExteriorColor): Promise<ExteriorColor> => {
    const { data, error } = await supabase
      .from('settings_colors')
      .update({
        name: color.name,
        type: color.type,
        price_adjustment: color.priceAdjustment,
        compatible_models: color.compatibleModels || [],
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating color:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('settings_colors')
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
      .from('settings_transmissions')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching transmissions:', error);
      throw error;
    }
    
    return data.map(transmission => ({
      id: transmission.id,
      name: transmission.name,
      priceAdjustment: transmission.price_adjustment,
      compatibleModels: transmission.compatible_models || []
    }));
  },
  
  getById: async (id: string): Promise<Transmission | null> => {
    const { data, error } = await supabase
      .from('settings_transmissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching transmission:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  create: async (transmission: Omit<Transmission, 'id'>): Promise<Transmission> => {
    const { data, error } = await supabase
      .from('settings_transmissions')
      .insert({
        name: transmission.name,
        price_adjustment: transmission.priceAdjustment,
        compatible_models: transmission.compatibleModels || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transmission:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  update: async (id: string, transmission: Transmission): Promise<Transmission> => {
    const { data, error } = await supabase
      .from('settings_transmissions')
      .update({
        name: transmission.name,
        price_adjustment: transmission.priceAdjustment,
        compatible_models: transmission.compatibleModels || [],
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transmission:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceAdjustment: data.price_adjustment,
      compatibleModels: data.compatible_models || []
    };
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('settings_transmissions')
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
      .from('settings_accessories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching accessories:', error);
      throw error;
    }
    
    return data.map(accessory => ({
      id: accessory.id,
      name: accessory.name,
      priceWithVAT: accessory.price,
      priceWithoutVAT: Math.round(accessory.price / 1.22),
      compatibleModels: accessory.compatible_models || [],
      compatibleTrims: accessory.compatible_trims || []
    }));
  },
  
  getById: async (id: string): Promise<Accessory | null> => {
    const { data, error } = await supabase
      .from('settings_accessories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching accessory:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceWithVAT: data.price,
      priceWithoutVAT: Math.round(data.price / 1.22),
      compatibleModels: data.compatible_models || [],
      compatibleTrims: data.compatible_trims || []
    };
  },
  
  create: async (accessory: Omit<Accessory, 'id'>): Promise<Accessory> => {
    const { data, error } = await supabase
      .from('settings_accessories')
      .insert({
        name: accessory.name,
        price: accessory.priceWithVAT,
        compatible_models: accessory.compatibleModels || [],
        compatible_trims: accessory.compatibleTrims || []
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating accessory:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceWithVAT: data.price,
      priceWithoutVAT: Math.round(data.price / 1.22),
      compatibleModels: data.compatible_models || [],
      compatibleTrims: data.compatible_trims || []
    };
  },
  
  update: async (id: string, accessory: Accessory): Promise<Accessory> => {
    const { data, error } = await supabase
      .from('settings_accessories')
      .update({
        name: accessory.name,
        price: accessory.priceWithVAT,
        compatible_models: accessory.compatibleModels || [],
        compatible_trims: accessory.compatibleTrims || [],
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating accessory:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.name,
      priceWithVAT: data.price,
      priceWithoutVAT: Math.round(data.price / 1.22),
      compatibleModels: data.compatible_models || [],
      compatibleTrims: data.compatible_trims || []
    };
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('settings_accessories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting accessory:', error);
      throw error;
    }
  },
  
  getCompatible: async (modelId: string, trimId: string): Promise<Accessory[]> => {
    const { data, error } = await supabase
      .from('settings_accessories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching compatible accessories:', error);
      throw error;
    }
    
    return data
      .filter(acc => {
        const modelCompatible = acc.compatible_models.length === 0 || acc.compatible_models.includes(modelId);
        const trimCompatible = acc.compatible_trims.length === 0 || acc.compatible_trims.includes(trimId);
        return modelCompatible && trimCompatible;
      })
      .map(accessory => ({
        id: accessory.id,
        name: accessory.name,
        priceWithVAT: accessory.price,
        priceWithoutVAT: Math.round(accessory.price / 1.22),
        compatibleModels: accessory.compatible_models || [],
        compatibleTrims: accessory.compatible_trims || []
      }));
  }
};

// Helper function to calculate the total price of a vehicle
export const calculateVehiclePrice = async (
  modelId: string,
  trimId: string,
  fuelTypeId: string,
  colorId: string,
  transmissionId: string,
  accessoryIds: string[]
): Promise<number> => {
  let totalPrice = 0;
  
  try {
    // Base price from model
    const model = await modelsApi.getById(modelId);
    if (model) {
      totalPrice += model.basePrice;
    }
    
    // Add trim price adjustment
    const trim = await trimsApi.getById(trimId);
    if (trim) {
      totalPrice += trim.basePrice;
    }
    
    // Add fuel type price adjustment
    const fuelType = await fuelTypesApi.getById(fuelTypeId);
    if (fuelType) {
      totalPrice += fuelType.priceAdjustment;
    }
    
    // Add color price adjustment
    const color = await colorsApi.getById(colorId);
    if (color) {
      totalPrice += color.priceAdjustment;
    }
    
    // Add transmission price adjustment
    const transmission = await transmissionsApi.getById(transmissionId);
    if (transmission) {
      totalPrice += transmission.priceAdjustment;
    }
    
    // Add accessories prices
    if (accessoryIds.length > 0) {
      const allAccessories = await accessoriesApi.getAll();
      for (const accId of accessoryIds) {
        const accessory = allAccessories.find(a => a.id === accId);
        if (accessory) {
          totalPrice += accessory.priceWithVAT;
        }
      }
    }
    
    return totalPrice;
  } catch (error) {
    console.error('Error calculating vehicle price:', error);
    return 0;
  }
};
