
import { supabase } from './client';
import { VehicleModel, VehicleTrim, FuelType, ExteriorColor, Transmission, Accessory } from '@/types';

// Models
const getModels = async (): Promise<VehicleModel[]> => {
  const { data, error } = await supabase
    .from('vehicle_models')
    .select('*');
  
  if (error) throw error;
  return data as VehicleModel[];
};

const getModelById = async (id: string): Promise<VehicleModel> => {
  const { data, error } = await supabase
    .from('vehicle_models')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as VehicleModel;
};

const createModel = async (model: Omit<VehicleModel, 'id'>): Promise<VehicleModel> => {
  const { data, error } = await supabase
    .from('vehicle_models')
    .insert([model])
    .select()
    .single();
  
  if (error) throw error;
  return data as VehicleModel;
};

const updateModel = async (id: string, updates: Partial<VehicleModel>): Promise<VehicleModel> => {
  const { data, error } = await supabase
    .from('vehicle_models')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as VehicleModel;
};

const deleteModel = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('vehicle_models')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Trims
const getTrims = async (): Promise<VehicleTrim[]> => {
  const { data, error } = await supabase
    .from('vehicle_trims')
    .select('*');
  
  if (error) throw error;
  return data as VehicleTrim[];
};

const getTrimById = async (id: string): Promise<VehicleTrim> => {
  const { data, error } = await supabase
    .from('vehicle_trims')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as VehicleTrim;
};

const createTrim = async (trim: Omit<VehicleTrim, 'id'>): Promise<VehicleTrim> => {
  const { data, error } = await supabase
    .from('vehicle_trims')
    .insert([trim])
    .select()
    .single();
  
  if (error) throw error;
  return data as VehicleTrim;
};

const updateTrim = async (id: string, updates: Partial<VehicleTrim>): Promise<VehicleTrim> => {
  const { data, error } = await supabase
    .from('vehicle_trims')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as VehicleTrim;
};

const deleteTrim = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('vehicle_trims')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Fuel Types
const getFuelTypes = async (): Promise<FuelType[]> => {
  const { data, error } = await supabase
    .from('fuel_types')
    .select('*');
  
  if (error) throw error;
  return data as FuelType[];
};

const getFuelTypeById = async (id: string): Promise<FuelType> => {
  const { data, error } = await supabase
    .from('fuel_types')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as FuelType;
};

const createFuelType = async (fuelType: Omit<FuelType, 'id'>): Promise<FuelType> => {
  const { data, error } = await supabase
    .from('fuel_types')
    .insert([fuelType])
    .select()
    .single();
  
  if (error) throw error;
  return data as FuelType;
};

const updateFuelType = async (id: string, updates: Partial<FuelType>): Promise<FuelType> => {
  const { data, error } = await supabase
    .from('fuel_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as FuelType;
};

const deleteFuelType = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('fuel_types')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Colors
const getColors = async (): Promise<ExteriorColor[]> => {
  const { data, error } = await supabase
    .from('exterior_colors')
    .select('*');
  
  if (error) throw error;
  return data as ExteriorColor[];
};

const getColorById = async (id: string): Promise<ExteriorColor> => {
  const { data, error } = await supabase
    .from('exterior_colors')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as ExteriorColor;
};

const createColor = async (color: Omit<ExteriorColor, 'id'>): Promise<ExteriorColor> => {
  const { data, error } = await supabase
    .from('exterior_colors')
    .insert([color])
    .select()
    .single();
  
  if (error) throw error;
  return data as ExteriorColor;
};

const updateColor = async (id: string, updates: Partial<ExteriorColor>): Promise<ExteriorColor> => {
  const { data, error } = await supabase
    .from('exterior_colors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ExteriorColor;
};

const deleteColor = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('exterior_colors')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Transmissions
const getTransmissions = async (): Promise<Transmission[]> => {
  const { data, error } = await supabase
    .from('transmissions')
    .select('*');
  
  if (error) throw error;
  return data as Transmission[];
};

const getTransmissionById = async (id: string): Promise<Transmission> => {
  const { data, error } = await supabase
    .from('transmissions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Transmission;
};

const createTransmission = async (transmission: Omit<Transmission, 'id'>): Promise<Transmission> => {
  const { data, error } = await supabase
    .from('transmissions')
    .insert([transmission])
    .select()
    .single();
  
  if (error) throw error;
  return data as Transmission;
};

const updateTransmission = async (id: string, updates: Partial<Transmission>): Promise<Transmission> => {
  const { data, error } = await supabase
    .from('transmissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Transmission;
};

const deleteTransmission = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('transmissions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

export const settingsApi = {
  models: {
    getAll: getModels,
    getById: getModelById,
    create: createModel,
    update: updateModel,
    delete: deleteModel
  },
  trims: {
    getAll: getTrims,
    getById: getTrimById,
    create: createTrim,
    update: updateTrim,
    delete: deleteTrim
  },
  fuelTypes: {
    getAll: getFuelTypes,
    getById: getFuelTypeById,
    create: createFuelType,
    update: updateFuelType,
    delete: deleteFuelType
  },
  colors: {
    getAll: getColors,
    getById: getColorById,
    create: createColor,
    update: updateColor,
    delete: deleteColor
  },
  transmissions: {
    getAll: getTransmissions,
    getById: getTransmissionById,
    create: createTransmission,
    update: updateTransmission,
    delete: deleteTransmission
  }
};
