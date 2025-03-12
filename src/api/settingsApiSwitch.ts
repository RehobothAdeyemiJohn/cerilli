
import { toast } from '@/hooks/use-toast';

// Import localStorage APIs
import { 
  modelsApi as localModelsApi,
  trimsApi as localTrimsApi,
  fuelTypesApi as localFuelTypesApi,
  colorsApi as localColorsApi,
  transmissionsApi as localTransmissApi,
  accessoriesApi as localAccessoriesApi,
  calculateVehiclePrice as localCalculatePrice
} from '@/api/localStorage/settingsApi';

// Import Supabase APIs
import {
  modelsApi as supabaseModelsApi,
  trimsApi as supabaseTrimsApi,
  fuelTypesApi as supabaseFuelTypesApi,
  colorsApi as supabaseColorsApi,
  transmissionsApi as supabaseTransmissApi,
  accessoriesApi as supabaseAccessoriesApi,
  calculateVehiclePrice as supabaseCalculatePrice
} from '@/api/supabase/settingsApi';

// Function to switch between localStorage and Supabase
export const switchToSupabase = (enable: boolean) => {
  localStorage.setItem('useSupabaseSettings', enable ? 'true' : 'false');
  
  toast({
    title: enable ? "Supabase Attivato" : "Supabase Disattivato",
    description: enable 
      ? "Le impostazioni ora utilizzano Supabase." 
      : "Le impostazioni ora utilizzano localStorage.",
  });
  
  // Reload to apply the changes
  window.location.reload();
};

// Check if we should use Supabase or localStorage
export const isUsingSupabase = () => {
  return localStorage.getItem('useSupabaseSettings') === 'true';
};

// Export the API to use based on the setting
export const getSettingsApi = () => {
  const useSupabase = isUsingSupabase();
  
  return {
    modelsApi: useSupabase ? supabaseModelsApi : localModelsApi,
    trimsApi: useSupabase ? supabaseTrimsApi : localTrimsApi,
    fuelTypesApi: useSupabase ? supabaseFuelTypesApi : localFuelTypesApi,
    colorsApi: useSupabase ? supabaseColorsApi : localColorsApi,
    transmissionsApi: useSupabase ? supabaseTransmissApi : localTransmissApi,
    accessoriesApi: useSupabase ? supabaseAccessoriesApi : localAccessoriesApi,
    calculateVehiclePrice: useSupabase ? supabaseCalculatePrice : localCalculatePrice
  };
};
