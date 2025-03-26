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
    // console.log('Fetching models from Supabase');
    const { data, error } = await supabase
      .from('settings_models')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching models:', error);
      return [];
    }
    
    // Map the column names to our model structure
    const mappedData = data.filter((obj:any, index:any, self:any) => index === self.findIndex((o:any) => o.name === obj.name)).map(item => ({
      id: item.id,
      name: item.name,
      basePrice: item.base_price,
      imageUrl: item.imageurl
    }));
    
    // console.log('Fetched models:', mappedData);
    return mappedData;
  },
  
  getById: async (id: string): Promise<VehicleModel | null> => {
    // console.log('Fetching model by id from Supabase:', id);
    const { data, error } = await supabase
      .from('settings_models')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching model by id:', error);
      return null;
    }
    
    // Map the column names to our model structure
    const model = {
      id: data.id,
      name: data.name,
      basePrice: data.base_price,
      imageUrl: data.imageurl
    };
    
    return model;
  },
  
  create: async (model: Omit<VehicleModel, 'id'>): Promise<VehicleModel> => {
    // console.log('Creating model in Supabase:', model);
    const { data, error } = await supabase
      .from('settings_models')
      .insert([{
        name: model.name,
        base_price: model.basePrice,
        imageurl: model.imageUrl
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating model:', error);
      throw error;
    }
    
    // Map the column names to our model structure
    const createdModel = {
      id: data.id,
      name: data.name,
      basePrice: data.base_price,
      imageUrl: data.imageurl
    };
    
    return createdModel;
  },
  
  update: async (id: string, model: VehicleModel): Promise<VehicleModel> => {
    // console.log('Updating model in Supabase:', { id, model });
    const { data, error } = await supabase
      .from('settings_models')
      .update({
        name: model.name,
        base_price: model.basePrice,
        imageurl: model.imageUrl
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating model:', error);
      throw error;
    }
    
    // Map the column names to our model structure
    const updatedModel = {
      id: data.id,
      name: data.name,
      basePrice: data.base_price,
      imageUrl: data.imageurl
    };
    
    return updatedModel;
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
    // console.log('Fetching trims from Supabase');
    const { data, error } = await supabase
      .from('settings_trims')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching trims:', error);
      return [];
    }
    
    // Map the column names to our model structure
    const mappedData = data.map(item => ({
      id: item.id,
      name: item.name,
      basePrice: item.price_adjustment,
      compatible_models: item.compatible_models || []
    }));
    
    // console.log('Fetched trims:', mappedData);
    return mappedData;
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
    // Map from our API model to the database columns
    const dbTrim = {
      name: trim.name,
      price_adjustment: trim.basePrice,
      compatible_models: trim.compatible_models || []
    };
    
    const { data, error } = await supabase
      .from('settings_trims')
      .update(dbTrim)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map back from database columns to our API model
    return {
      id: data.id,
      name: data.name,
      basePrice: data.price_adjustment,
      compatible_models: data.compatible_models || []
    };
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
    // console.log('Fetching fuel types from Supabase');
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching fuel types:', error);
      return [];
    }
    
    // Map the column names to our model structure
    const mappedData = data.map(item => ({
      id: item.id,
      name: item.name,
      price_adjustment: item.price_adjustment,
      compatible_models: item.compatible_models || []
    }));
    
    // console.log('Fetched fuel types:', mappedData);
    return mappedData;
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
    // Map from our API model to the database columns
    const dbFuelType = {
      name: fuelType.name,
      price_adjustment: fuelType.price_adjustment,
      compatible_models: fuelType.compatible_models || []
    };
    
    const { data, error } = await supabase
      .from('settings_fuel_types')
      .update(dbFuelType)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map back from database columns to our API model
    return {
      id: data.id,
      name: data.name,
      price_adjustment: data.price_adjustment,
      compatible_models: data.compatible_models || []
    };
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
    // Map from our API model to the database columns
    const dbColor = {
      name: color.name,
      type: color.type,
      price_adjustment: color.price_adjustment,
      compatible_models: color.compatible_models || []
    };
    
    const { data, error } = await supabase
      .from('settings_colors')
      .update(dbColor)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map back from database columns to our API model
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      price_adjustment: data.price_adjustment,
      compatible_models: data.compatible_models || []
    };
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
    // Map from our API model to the database columns
    const dbTransmission = {
      name: transmission.name,
      price_adjustment: transmission.price_adjustment,
      compatible_models: transmission.compatible_models || []
    };
    
    // console.log('Updating transmission with data:', dbTransmission);
    
    const { data, error } = await supabase
      .from('settings_transmissions')
      .update(dbTransmission)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transmission in database:', error);
      throw error;
    }
    
    // Map back from database columns to our API model
    return {
      id: data.id,
      name: data.name,
      price_adjustment: data.price_adjustment,
      compatible_models: data.compatible_models || []
    };
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
    // console.log(data)
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
      const modelCompatible = accessory.compatible_models.length === 0 || 
                             accessory.compatible_models.includes(modelId);
      const trimCompatible = accessory.compatible_trims.length === 0 || 
                            accessory.compatible_trims.includes(trimId);
      return modelCompatible && trimCompatible;
    });
  },
  
  create: async (accessory: Omit<Accessory, 'id'>): Promise<Accessory> => {
    // Calculate priceWithoutVAT
    
    const { data, error } = await supabase
      .from('settings_accessories')
      .insert([{ ...accessory }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Accessory;
  },
  
  update: async (id: string, accessory: Partial<Accessory>): Promise<Accessory> => {
    // If price is being updated, recalculate priceWithoutVAT
    let dbUpdates: any = {
      name: accessory.name
    };
    
    if (accessory.compatible_models !== undefined) {
      dbUpdates.compatible_models = accessory.compatible_models;
    }
    
    if (accessory.compatible_trims !== undefined) {
      dbUpdates.compatible_trims = accessory.compatible_trims;
    }
    
    const { data, error } = await supabase
      .from('settings_accessories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating accessory:', error);
      throw error;
    }
    
    // Map back from database columns to our API model
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      compatible_models: data.compatible_models || [],
      compatible_trims: data.compatible_trims || []
    };
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
      totalPrice += fuelType.price_adjustment;
    }
    
    // Get color
    const color = await colorsApi.getById(colorId);
    if (color) {
      totalPrice += color.price_adjustment;
    }
    
    // Get transmission
    const transmission = await transmissionsApi.getById(transmissionId);
    if (transmission) {
      totalPrice += transmission.price_adjustment;
    }
    
    // Get accessories and sum their prices
    if (accessoryIds.length > 0) {
      const accessories = await accessoriesApi.getAll();
      const selectedAccessories = accessories.filter(acc => accessoryIds.includes(acc.id));
      for (const acc of selectedAccessories) {
        totalPrice += acc.price;
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
