
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
  transmissionsApi as supabaseTransmissionsApi,
  accessoriesApi as supabaseAccessoriesApi,
  calculateVehiclePrice as supabaseCalculateVehiclePrice
} from '@/api/supabase/settingsApi';

// Initialize data
initLocalStorage();
initSettingsData();

// Always use Supabase for settings
localStorage.setItem('useSupabaseSettings', 'true');
const useSupabase = true;
console.log('Using Supabase for settings:', useSupabase);

// Export the appropriate APIs based on the setting
export const modelsApi = useSupabase ? supabaseModelsApi : localModelsApi;
export const trimsApi = useSupabase ? supabaseTrimsApi : localTrimsApi;
export const fuelTypesApi = useSupabase ? supabaseFuelTypesApi : localFuelTypesApi;
export const colorsApi = useSupabase ? supabaseColorsApi : localColorsApi;
export const transmissionsApi = useSupabase ? supabaseTransmissionsApi : localTransmissionsApi;
export const accessoriesApi = useSupabase ? supabaseAccessoriesApi : localAccessoriesApi;
export const calculateVehiclePrice = useSupabase ? supabaseCalculateVehiclePrice : localCalculateVehiclePrice;

// Export other APIs
export * from './ordersApi';
export * from './orderDetailsApi';
export * from './quotesApi';
export * from './vehiclesApi';
export * from './settingsApi';
export * from './adminUsersApi';
export * from './dealersApi';  // Export the dealersApi module
