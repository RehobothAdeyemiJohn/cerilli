
import { orderDetailsApi as supabaseOrderDetailsApi } from './supabase/orderDetailsApi';
import { orderDetailsApi as localStorageOrderDetailsApi } from './localStorage/orderDetailsApi';
import { settingsApiSwitch } from './settingsApiSwitch';

// Use the same API source (Supabase or localStorage) as we're using for other APIs
const { currentApiSource } = settingsApiSwitch;

// Export the appropriate orderDetailsApi based on the current API source
export const orderDetailsApi = currentApiSource === 'supabase' 
  ? supabaseOrderDetailsApi 
  : localStorageOrderDetailsApi;
