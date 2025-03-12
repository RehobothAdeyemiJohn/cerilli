
import { initLocalStorage } from './storageUtils';
import { vehiclesApi } from './vehiclesApi';
import { quotesApi } from './quotesApi';
import { ordersApi } from './ordersApi';
import { 
  initSettingsData, 
  modelsApi, 
  trimsApi, 
  fuelTypesApi, 
  colorsApi, 
  transmissionsApi, 
  accessoriesApi,
  calculateVehiclePrice
} from './settingsApi';
import { adminUsersApi } from './adminUsersApi';

// Initialize data
initLocalStorage();
initSettingsData();

// Check if we should use Supabase or localStorage
const useSupabase = localStorage.getItem('useSupabaseSettings') === 'true';

// Import Supabase APIs if needed
let supabaseApis;
if (useSupabase) {
  try {
    supabaseApis = require('@/api/supabase/settingsApi');
  } catch (e) {
    console.error('Error importing Supabase APIs:', e);
  }
}

// Export APIs (use Supabase if available and enabled)
export {
  vehiclesApi,
  quotesApi,
  ordersApi,
  // Settings APIs (will use localStorage by default)
  modelsApi,
  trimsApi,
  fuelTypesApi,
  colorsApi,
  transmissionsApi,
  accessoriesApi,
  calculateVehiclePrice,
  adminUsersApi
};
