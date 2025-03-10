
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

// Initialize data
initLocalStorage();
initSettingsData();

export {
  vehiclesApi,
  quotesApi,
  ordersApi,
  // Settings APIs
  modelsApi,
  trimsApi,
  fuelTypesApi,
  colorsApi,
  transmissionsApi,
  accessoriesApi,
  calculateVehiclePrice
};
