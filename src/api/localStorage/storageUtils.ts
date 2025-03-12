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
};
