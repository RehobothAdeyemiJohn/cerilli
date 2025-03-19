export const initLocalStorage = () => {
  if (typeof localStorage === 'undefined') {
    return;
  }
  
  if (!localStorage.getItem('initialized')) {
    localStorage.setItem('vehicles', JSON.stringify([]));
    localStorage.setItem('quotes', JSON.stringify([]));
    localStorage.setItem('orders', JSON.stringify([]));
    localStorage.setItem('adminUsers', JSON.stringify([]));
    localStorage.setItem('models', JSON.stringify([]));
    localStorage.setItem('trims', JSON.stringify([]));
    localStorage.setItem('fuelTypes', JSON.stringify([]));
    localStorage.setItem('colors', JSON.stringify([]));
    localStorage.setItem('transmissions', JSON.stringify([]));
    localStorage.setItem('accessories', JSON.stringify([]));
    localStorage.setItem('dealers', JSON.stringify([]));  // Initialize dealers storage
    localStorage.setItem('initialized', 'true');
  }
};

export const KEYS = {
  VEHICLES: 'vehicles',
  QUOTES: 'quotes',
  ORDERS: 'orders',
  ORDER_DETAILS: 'orderDetails',
  ADMIN_USERS: 'adminUsers',
  MODELS: 'models',
  TRIMS: 'trims',
  FUEL_TYPES: 'fuelTypes',
  COLORS: 'colors',
  TRANSMISSIONS: 'transmissions',
  ACCESSORIES: 'accessories',
  DEALERS: 'dealers',
};

export const getStorageItem = <T>(key: string): T | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing item from localStorage (${key}):`, error);
    return null;
  }
};

export const setStorageItem = <T>(key: string, data: T): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing item in localStorage (${key}):`, error);
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
