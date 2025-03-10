import { v4 as uuidv4 } from 'uuid';
import { 
  VehicleModel, 
  VehicleTrim, 
  FuelType, 
  ExteriorColor, 
  Transmission, 
  Accessory 
} from '@/types';
import { KEYS } from './storageUtils';

// Settings keys
const SETTINGS_KEYS = {
  MODELS: 'cirelli_models',
  TRIMS: 'cirelli_trims',
  FUEL_TYPES: 'cirelli_fuel_types',
  COLORS: 'cirelli_colors',
  TRANSMISSIONS: 'cirelli_transmissions',
  ACCESSORIES: 'cirelli_accessories',
};

// Initialize settings data in localStorage if not exists
export const initSettingsData = () => {
  // Initialize models
  if (!localStorage.getItem(SETTINGS_KEYS.MODELS)) {
    const defaultModels: VehicleModel[] = [
      { id: '1', name: 'Cirelli 1', basePrice: 15000 },
      { id: '2', name: 'Cirelli 2', basePrice: 18000 },
      { id: '3', name: 'Cirelli 3', basePrice: 22000 },
      { id: '4', name: 'Cirelli 4', basePrice: 24000 },
      { id: '5', name: 'Cirelli 5', basePrice: 28000 },
      { id: '6', name: 'Cirelli 7', basePrice: 35000 },
      { id: '7', name: 'Cirelli 8', basePrice: 42000 },
      { id: '8', name: 'Cirelli Sport Coupè', basePrice: 65000 },
    ];
    localStorage.setItem(SETTINGS_KEYS.MODELS, JSON.stringify(defaultModels));
  }

  // Initialize trims
  if (!localStorage.getItem(SETTINGS_KEYS.TRIMS)) {
    const defaultTrims: VehicleTrim[] = [
      { id: '1', name: 'Plus', basePrice: 0, compatibleModels: [] },
      { id: '2', name: 'Premium', basePrice: 2500, compatibleModels: [] },
      { id: '3', name: 'Cross', basePrice: 3000, compatibleModels: [] },
      { id: '4', name: 'Sport', basePrice: 4000, compatibleModels: [] },
    ];
    localStorage.setItem(SETTINGS_KEYS.TRIMS, JSON.stringify(defaultTrims));
  }

  // Initialize fuel types
  if (!localStorage.getItem(SETTINGS_KEYS.FUEL_TYPES)) {
    const defaultFuelTypes: FuelType[] = [
      { id: '1', name: 'Benzina', priceAdjustment: 0, compatibleModels: [] },
      { id: '2', name: 'Gpl', priceAdjustment: 1500, compatibleModels: [] },
      { id: '3', name: 'Mhev', priceAdjustment: 2500, compatibleModels: [] },
      { id: '4', name: 'Mhev Gpl', priceAdjustment: 4000, compatibleModels: [] },
      { id: '5', name: 'Phev', priceAdjustment: 6000, compatibleModels: [] },
      { id: '6', name: 'EV', priceAdjustment: 8000, compatibleModels: [] },
    ];
    localStorage.setItem(SETTINGS_KEYS.FUEL_TYPES, JSON.stringify(defaultFuelTypes));
  }

  // Initialize colors
  if (!localStorage.getItem(SETTINGS_KEYS.COLORS)) {
    const defaultColors: ExteriorColor[] = [
      { id: '1', name: 'Pure Ice', type: 'metallizzato', priceAdjustment: 800, compatibleModels: [] },
      { id: '2', name: 'Obsydian Black', type: 'metallizzato', priceAdjustment: 800, compatibleModels: [] },
      { id: '3', name: 'Metallic Sky', type: 'metallizzato', priceAdjustment: 800, compatibleModels: [] },
      { id: '4', name: 'Red Flame', type: 'metallizzato', priceAdjustment: 1000, compatibleModels: [] },
      { id: '5', name: 'Petrol Green', type: 'metallizzato', priceAdjustment: 800, compatibleModels: [] },
      { id: '6', name: 'Solid Green', type: 'pastello', priceAdjustment: 0, compatibleModels: [] },
    ];
    localStorage.setItem(SETTINGS_KEYS.COLORS, JSON.stringify(defaultColors));
  }

  // Initialize transmissions
  if (!localStorage.getItem(SETTINGS_KEYS.TRANSMISSIONS)) {
    const defaultTransmissions: Transmission[] = [
      { id: '1', name: 'Manuale', priceAdjustment: 0, compatibleModels: [] },
      { id: '2', name: 'Automatico CVT 6', priceAdjustment: 1500, compatibleModels: [] },
      { id: '3', name: 'Automatico DCT 7', priceAdjustment: 2500, compatibleModels: [] },
      { id: '4', name: 'Automatico DCT 8', priceAdjustment: 3000, compatibleModels: [] },
    ];
    localStorage.setItem(SETTINGS_KEYS.TRANSMISSIONS, JSON.stringify(defaultTransmissions));
  }

  // Initialize accessories
  if (!localStorage.getItem(SETTINGS_KEYS.ACCESSORIES)) {
    const defaultAccessories: Accessory[] = [
      { 
        id: '1', 
        name: 'Vetri Privacy', 
        priceWithVAT: 200, 
        priceWithoutVAT: 164, 
        compatibleModels: [], 
        compatibleTrims: [] 
      },
      { 
        id: '2', 
        name: 'Sistema di Navigazione', 
        priceWithVAT: 1500, 
        priceWithoutVAT: 1230, 
        compatibleModels: [], 
        compatibleTrims: ['2', '3', '4'] 
      },
      { 
        id: '3', 
        name: 'Sedili in Pelle', 
        priceWithVAT: 2000, 
        priceWithoutVAT: 1640, 
        compatibleModels: [], 
        compatibleTrims: ['2', '4'] 
      },
      { 
        id: '4', 
        name: 'Audio Premium', 
        priceWithVAT: 1200, 
        priceWithoutVAT: 984, 
        compatibleModels: [], 
        compatibleTrims: ['2', '4'] 
      },
      { 
        id: '5', 
        name: 'Cerchi in lega da 22"', 
        priceWithVAT: 2500, 
        priceWithoutVAT: 2050, 
        compatibleModels: ['5'], 
        compatibleTrims: ['4'] 
      },
    ];
    localStorage.setItem(SETTINGS_KEYS.ACCESSORIES, JSON.stringify(defaultAccessories));
  }
};

// Generic CRUD functions for settings
const getItems = <T>(key: string): Promise<T[]> => {
  return new Promise((resolve) => {
    const items = localStorage.getItem(key);
    resolve(items ? JSON.parse(items) : []);
  });
};

const setItems = <T>(key: string, items: T[]): Promise<void> => {
  return new Promise((resolve) => {
    localStorage.setItem(key, JSON.stringify(items));
    resolve();
  });
};

const getItem = <T>(key: string, id: string): Promise<T | null> => {
  return new Promise((resolve) => {
    const items = localStorage.getItem(key);
    const parsed = items ? JSON.parse(items) : [];
    resolve(parsed.find((item: any) => item.id === id) || null);
  });
};

const createItem = <T extends { id?: string }>(key: string, item: Omit<T, 'id'>): Promise<T> => {
  return new Promise((resolve) => {
    const items = localStorage.getItem(key);
    const parsed = items ? JSON.parse(items) : [];
    const newItem = { ...item, id: uuidv4() } as T;
    parsed.push(newItem);
    localStorage.setItem(key, JSON.stringify(parsed));
    resolve(newItem);
  });
};

const updateItem = <T extends { id: string }>(key: string, id: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    const items = localStorage.getItem(key);
    const parsed = items ? JSON.parse(items) : [];
    const index = parsed.findIndex((i: any) => i.id === id);
    if (index !== -1) {
      parsed[index] = { ...item, id };
      localStorage.setItem(key, JSON.stringify(parsed));
      resolve(parsed[index]);
    } else {
      reject(new Error(`Item with id ${id} not found`));
    }
  });
};

const deleteItem = (key: string, id: string): Promise<void> => {
  return new Promise((resolve) => {
    const items = localStorage.getItem(key);
    const parsed = items ? JSON.parse(items) : [];
    const filteredItems = parsed.filter((item: any) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filteredItems));
    resolve();
  });
};

// Specific APIs for each setting type
export const modelsApi = {
  getAll: () => getItems<VehicleModel>(SETTINGS_KEYS.MODELS),
  getById: (id: string) => getItem<VehicleModel>(SETTINGS_KEYS.MODELS, id),
  create: (model: Omit<VehicleModel, 'id'>) => createItem<VehicleModel>(SETTINGS_KEYS.MODELS, model),
  update: (id: string, model: VehicleModel) => updateItem<VehicleModel>(SETTINGS_KEYS.MODELS, id, model),
  delete: (id: string) => deleteItem(SETTINGS_KEYS.MODELS, id),
};

export const trimsApi = {
  getAll: () => getItems<VehicleTrim>(SETTINGS_KEYS.TRIMS),
  getById: (id: string) => getItem<VehicleTrim>(SETTINGS_KEYS.TRIMS, id),
  create: (trim: Omit<VehicleTrim, 'id'>) => createItem<VehicleTrim>(SETTINGS_KEYS.TRIMS, trim),
  update: (id: string, trim: VehicleTrim) => updateItem<VehicleTrim>(SETTINGS_KEYS.TRIMS, id, trim),
  delete: (id: string) => deleteItem(SETTINGS_KEYS.TRIMS, id),
};

export const fuelTypesApi = {
  getAll: () => getItems<FuelType>(SETTINGS_KEYS.FUEL_TYPES),
  getById: (id: string) => getItem<FuelType>(SETTINGS_KEYS.FUEL_TYPES, id),
  create: (fuelType: Omit<FuelType, 'id'>) => createItem<FuelType>(SETTINGS_KEYS.FUEL_TYPES, fuelType),
  update: (id: string, fuelType: FuelType) => updateItem<FuelType>(SETTINGS_KEYS.FUEL_TYPES, id, fuelType),
  delete: (id: string) => deleteItem(SETTINGS_KEYS.FUEL_TYPES, id),
};

export const colorsApi = {
  getAll: () => getItems<ExteriorColor>(SETTINGS_KEYS.COLORS),
  getById: (id: string) => getItem<ExteriorColor>(SETTINGS_KEYS.COLORS, id),
  create: (color: Omit<ExteriorColor, 'id'>) => createItem<ExteriorColor>(SETTINGS_KEYS.COLORS, color),
  update: (id: string, color: ExteriorColor) => updateItem<ExteriorColor>(SETTINGS_KEYS.COLORS, id, color),
  delete: (id: string) => deleteItem(SETTINGS_KEYS.COLORS, id),
};

export const transmissionsApi = {
  getAll: () => getItems<Transmission>(SETTINGS_KEYS.TRANSMISSIONS),
  getById: (id: string) => getItem<Transmission>(SETTINGS_KEYS.TRANSMISSIONS, id),
  create: (transmission: Omit<Transmission, 'id'>) => createItem<Transmission>(SETTINGS_KEYS.TRANSMISSIONS, transmission),
  update: (id: string, transmission: Transmission) => updateItem<Transmission>(SETTINGS_KEYS.TRANSMISSIONS, id, transmission),
  delete: (id: string) => deleteItem(SETTINGS_KEYS.TRANSMISSIONS, id),
};

export const accessoriesApi = {
  getAll: () => getItems<Accessory>(SETTINGS_KEYS.ACCESSORIES),
  getById: (id: string) => getItem<Accessory>(SETTINGS_KEYS.ACCESSORIES, id),
  create: (accessory: Omit<Accessory, 'id'>) => {
    const priceWithoutVAT = Math.round(accessory.priceWithVAT / 1.22);
    return createItem<Accessory>(SETTINGS_KEYS.ACCESSORIES, {
      ...accessory,
      priceWithoutVAT
    });
  },
  update: (id: string, accessory: Accessory) => {
    const priceWithoutVAT = Math.round(accessory.priceWithVAT / 1.22);
    return updateItem<Accessory>(SETTINGS_KEYS.ACCESSORIES, id, {
      ...accessory,
      priceWithoutVAT
    });
  },
  delete: (id: string) => deleteItem(SETTINGS_KEYS.ACCESSORIES, id),
  getCompatible: (modelId: string, trimId: string) => {
    return getItems<Accessory>(SETTINGS_KEYS.ACCESSORIES).then(allAccessories => {
      return allAccessories.filter(acc => {
        const modelCompatible = acc.compatibleModels.length === 0 || acc.compatibleModels.includes(modelId);
        const trimCompatible = acc.compatibleTrims.length === 0 || acc.compatibleTrims.includes(trimId);
        return modelCompatible && trimCompatible;
      });
    });
  }
};

// Helper function to calculate the total price of a vehicle based on its configuration
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
    const model = await getItem<VehicleModel>(SETTINGS_KEYS.MODELS, modelId);
    if (model) {
      totalPrice += model.basePrice;
    }
    
    // Add trim price adjustment
    const trim = await getItem<VehicleTrim>(SETTINGS_KEYS.TRIMS, trimId);
    if (trim) {
      totalPrice += trim.basePrice;
    }
    
    // Add fuel type price adjustment
    const fuelType = await getItem<FuelType>(SETTINGS_KEYS.FUEL_TYPES, fuelTypeId);
    if (fuelType) {
      totalPrice += fuelType.priceAdjustment;
    }
    
    // Add color price adjustment
    const color = await getItem<ExteriorColor>(SETTINGS_KEYS.COLORS, colorId);
    if (color) {
      totalPrice += color.priceAdjustment;
    }
    
    // Add transmission price adjustment
    const transmission = await getItem<Transmission>(SETTINGS_KEYS.TRANSMISSIONS, transmissionId);
    if (transmission) {
      totalPrice += transmission.priceAdjustment;
    }
    
    // Add accessories prices
    const allAccessories = await getItems<Accessory>(SETTINGS_KEYS.ACCESSORIES);
    for (const accId of accessoryIds) {
      const accessory = allAccessories.find(a => a.id === accId);
      if (accessory) {
        totalPrice += accessory.priceWithVAT;
      }
    }
    
    return totalPrice;
  } catch (error) {
    console.error('Error calculating vehicle price:', error);
    return 0;
  }
};

// Update localStorage.js to initialize settings data
export const updateStorageUtils = () => {
  const originalInit = localStorage.getItem('initLocalStorage');
  if (originalInit) {
    initSettingsData();
  }
};

