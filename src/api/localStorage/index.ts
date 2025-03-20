
import { initLocalStorage } from './storageUtils';
import { vehiclesApi } from './vehiclesApi';
import { quotesApi } from './quotesApi';
import { ordersApi } from './ordersApi';
import { dealersApi } from './dealersApi';
import { 
  initSettingsData, 
  modelsApi as localModelsApi, 
  trimsApi as localTrimsApi, 
  fuelTypesApi as localFuelTypesApi, 
  colorsApi as localColorsApi, 
  transmissionsApi as localTransmissionsApi, 
  accessoriesApi as localAccessoriesApi,
  calculateVehiclePrice as localCalculateVehiclePrice
} from './settingsApi';
import { adminUsersApi } from './adminUsersApi';

// Import Supabase APIs for settings
import {
  modelsApi as supabaseModelsApi,
  trimsApi as supabaseTrimsApi,
  fuelTypesApi as supabaseFuelTypesApi,
  colorsApi as supabaseColorsApi,
  transmissionsApi as supabaseTransmissApi,
  accessoriesApi as supabaseAccessoriesApi,
  calculateVehiclePrice as supabaseCalculateVehiclePrice
} from '@/api/supabase/settingsApi';

// Initialize data
initLocalStorage();
initSettingsData();

// Always use Supabase for settings
localStorage.setItem('useSupabaseSettings', 'true');
// Force using Supabase - this is crucial
const useSupabase = true;
console.log('Using Supabase for settings:', useSupabase);

// Export the appropriate APIs based on the setting - forcing Supabase
export const modelsApi = supabaseModelsApi;
export const trimsApi = supabaseTrimsApi;
export const fuelTypesApi = supabaseFuelTypesApi;
export const colorsApi = supabaseColorsApi;
export const transmissionsApi = supabaseTransmissApi;
export const accessoriesApi = supabaseAccessoriesApi;
export const calculateVehiclePrice = supabaseCalculateVehiclePrice;

// Export other APIs
export * from './ordersApi';
export * from './quotesApi';
export * from './vehiclesApi';
export * from './settingsApi';
export * from './adminUsersApi';
export * from './dealersApi';
