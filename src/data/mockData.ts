import { Vehicle, User, Quote, Order, Stat, ChartData, Dealer, Vendor } from '@/types';

// Utilizziamo let invece di const per permettere la modifica dell'array
export let vehicles: Vehicle[] = [
  {
    id: '1',
    model: 'Cirelli 500',
    trim: 'Sport',
    fuelType: 'Hybrid',
    exteriorColor: 'Rosso Racing',
    accessories: ['Navigation System', 'Premium Audio', 'Leather Seats'],
    price: 28500,
    location: 'Stock CMC',
    imageUrl: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=2148&auto=format&fit=crop',
    status: 'available',
    dateAdded: '2023-11-15',
    telaio: 'WBA12345678901234',
  },
  {
    id: '2',
    model: 'Cirelli SUV',
    trim: 'Elegance',
    fuelType: 'Diesel',
    exteriorColor: 'Nero Intenso',
    accessories: ['Panoramic Roof', 'All-wheel Drive', 'Heated Seats'],
    price: 42000,
    location: 'North Branch',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
    status: 'available',
    dateAdded: '2023-12-01',
    telaio: 'WBA98765432109876',
  },
  {
    id: '3',
    model: 'Cirelli Berlina',
    trim: 'Executive',
    fuelType: 'Electric',
    exteriorColor: 'Azzurro Marino',
    accessories: ['Driver Assistance Package', 'Premium Interior', 'Fast Charging'],
    price: 56000,
    location: 'Stock CMC',
    imageUrl: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop',
    status: 'reserved',
    dateAdded: '2024-01-05',
    telaio: 'WBA23456789012345',
  },
  {
    id: '4',
    model: 'Cirelli Spyder',
    trim: 'Sport+',
    fuelType: 'Gasoline',
    exteriorColor: 'Bianco Perla',
    accessories: ['Carbon Package', 'Racing Seats', 'Sport Suspension'],
    price: 78000,
    location: 'South Branch',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
    status: 'available',
    dateAdded: '2024-02-10',
    telaio: 'WBA34567890123456',
  },
  {
    id: '5',
    model: 'Cirelli 500',
    trim: 'Base',
    fuelType: 'Hybrid',
    exteriorColor: 'Grigio Metallico',
    accessories: ['Basic Package', 'Air Conditioning'],
    price: 24000,
    location: 'East Branch',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop',
    status: 'sold',
    dateAdded: '2023-10-20',
    telaio: 'WBA45678901234567',
  },
  {
    id: '6',
    model: 'Cirelli SUV',
    trim: 'Adventure',
    fuelType: 'Diesel',
    exteriorColor: 'Verde Natura',
    accessories: ['Off-road Package', 'Roof Rails', 'Tow Hook'],
    price: 46000,
    location: 'North Branch',
    imageUrl: 'https://images.unsplash.com/photo-1567343483496-bdf93e63ab81?q=80&w=2062&auto=format&fit=crop',
    status: 'available',
    dateAdded: '2024-01-25',
    telaio: 'WBA56789012345678',
  },
];

// Funzioni per manipolare l'array vehicles
export const addVehicle = (newVehicle: Vehicle): void => {
  // Aggiungiamo l'immagine di default se manca
  const vehicleWithImage = {
    ...newVehicle,
    imageUrl: newVehicle.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
  };
  vehicles.push(vehicleWithImage);
};

export const updateVehicle = (updatedVehicle: Vehicle): void => {
  const index = vehicles.findIndex(v => v.id === updatedVehicle.id);
  if (index !== -1) {
    // Mantieni l'imageUrl originale se non viene fornita
    vehicles[index] = {
      ...updatedVehicle,
      imageUrl: updatedVehicle.imageUrl || vehicles[index].imageUrl,
    };
  }
};

export const deleteVehicle = (vehicleId: string): void => {
  vehicles = vehicles.filter(v => v.id !== vehicleId);
};

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@cirelli.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Marco Rossi',
    email: 'marco@autogalleriarossi.it',
    role: 'dealer',
    dealerName: 'Auto Galleria Rossi',
  },
  {
    id: '3',
    name: 'Giulia Bianchi',
    email: 'giulia@motovallebianchi.it',
    role: 'dealer',
    dealerName: 'MotorValle Bianchi',
  },
];

export const quotes: Quote[] = [
  {
    id: '1',
    vehicleId: '1',
    dealerId: '2',
    customerName: 'Luca Ferrari',
    customerEmail: 'luca.f@example.com',
    customerPhone: '+39 333 1234567',
    price: 28500,
    discount: 1500,
    finalPrice: 27000,
    status: 'pending',
    createdAt: '2024-02-20',
  },
  {
    id: '2',
    vehicleId: '3',
    dealerId: '3',
    customerName: 'Maria Verdi',
    customerEmail: 'maria.v@example.com',
    customerPhone: '+39 333 7654321',
    price: 56000,
    discount: 2000,
    finalPrice: 54000,
    status: 'approved',
    createdAt: '2024-03-05',
  },
  {
    id: '3',
    vehicleId: '4',
    dealerId: '2',
    customerName: 'Giovanni Neri',
    customerEmail: 'g.neri@example.com',
    customerPhone: '+39 333 9876543',
    price: 78000,
    discount: 3000,
    finalPrice: 75000,
    status: 'converted',
    createdAt: '2024-01-15',
  },
];

export const mockOrders: Order[] = [
  {
    id: '1',
    vehicleId: '4',
    dealerId: '2',
    customerName: 'Giovanni Neri',
    status: 'delivered',
    orderDate: '2024-01-20',
    deliveryDate: '2024-02-10',
    dealerName: 'Auto Galleria Rossi',
    modelName: 'Cirelli Spyder',
    price: 78000,
    
    // Required properties for Order type
    isLicensable: false,
    hasProforma: true,
    isPaid: true,
    isInvoiced: true,
    hasConformity: true,
    odlGenerated: true,
    transportCosts: 0,
    restorationCosts: 0
  },
  {
    id: '2',
    vehicleId: '5',
    dealerId: '3',
    customerName: 'Antonio Russo',
    status: 'delivered',
    orderDate: '2023-11-10',
    deliveryDate: '2023-12-01',
    dealerName: 'MotorValle Bianchi',
    modelName: 'Cirelli 500',
    price: 24000,
    
    // Required properties for Order type
    isLicensable: false,
    hasProforma: true,
    isPaid: true,
    isInvoiced: true,
    hasConformity: true,
    odlGenerated: true,
    transportCosts: 0,
    restorationCosts: 0
  },
  {
    id: '3',
    vehicleId: '2',
    dealerId: '2',
    customerName: 'Elena Conti',
    status: 'processing',
    orderDate: '2024-03-01',
    dealerName: 'Auto Galleria Rossi',
    modelName: 'Cirelli SUV',
    price: 42000,
    
    // Required properties for Order type
    isLicensable: false,
    hasProforma: false,
    isPaid: false,
    isInvoiced: false,
    hasConformity: false,
    odlGenerated: false,
    transportCosts: 0,
    restorationCosts: 0
  }
];

export const orders: Order[] = [
  {
    id: "1",
    vehicleId: "1",
    dealerId: "1",
    customerName: "Mario Rossi",
    status: "delivered",
    orderDate: "2023-03-15",
    deliveryDate: "2023-03-25",
    isLicensable: true,
    hasProforma: true,
    isPaid: true,
    isInvoiced: true,
    hasConformity: true,
    odlGenerated: true,
    transportCosts: 500,
    restorationCosts: 0,
    chassis: "WBA12345678901234",
  },
  {
    id: "2",
    vehicleId: "2",
    dealerId: "2",
    customerName: "Giuseppe Verdi",
    status: "delivered",
    orderDate: "2023-04-01",
    deliveryDate: "2023-04-10",
    isLicensable: true,
    hasProforma: true,
    isPaid: true,
    isInvoiced: true,
    hasConformity: true,
    odlGenerated: true,
    transportCosts: 650,
    restorationCosts: 200,
    chassis: "WBA98765432109876",
  },
  {
    id: "3",
    vehicleId: "3",
    dealerId: "3",
    customerName: "Luca Bianchi",
    status: "processing",
    orderDate: "2023-04-15",
    isLicensable: false,
    hasProforma: true,
    isPaid: false,
    isInvoiced: false,
    hasConformity: false,
    odlGenerated: false,
    transportCosts: 700,
    restorationCosts: 0,
    chassis: "",
  }
];

export const dashboardStats: Stat[] = [
  {
    label: 'Available Vehicles',
    value: 42,
    change: 8,
    changeType: 'increase',
  },
  {
    label: 'Pending Orders',
    value: 12,
    change: 3,
    changeType: 'increase',
  },
  {
    label: 'Completed Sales',
    value: '€1.2M',
    change: 12,
    changeType: 'increase',
  },
  {
    label: 'Dealer Requests',
    value: 8,
    change: 2,
    changeType: 'decrease',
  },
];

export const inventoryByModel: ChartData = [
  { name: 'Cirelli 500', value: 18 },
  { name: 'Cirelli SUV', value: 14 },
  { name: 'Cirelli Berlina', value: 10 },
  { name: 'Cirelli Spyder', value: 6 },
];

export const salesByDealer: ChartData = [
  { name: 'Auto Galleria Rossi', value: 24 },
  { name: 'MotorValle Bianchi', value: 18 },
  { name: 'Centro Auto Milano', value: 12 },
  { name: 'Torino Motors', value: 9 },
  { name: 'Roma Auto Prestige', value: 15 },
];

export const salesByMonth: ChartData = [
  { name: 'Jan', value: 12 },
  { name: 'Feb', value: 15 },
  { name: 'Mar', value: 18 },
  { name: 'Apr', value: 14 },
  { name: 'May', value: 22 },
  { name: 'Jun', value: 19 },
];

// Initialize mock dealers data
export let dealers: Dealer[] = [
  {
    id: '1',
    companyName: 'Auto Galleria Rossi',
    address: 'Via Roma 123',
    city: 'Milano',
    province: 'MI',
    zipCode: '20100',
    createdAt: '2023-01-15',
    isActive: true,
    // Added properties for authentication
    email: 'info@autogalleriarossi.it',
    password: 'password123',
    contactName: 'Marco Rossi'
  },
  {
    id: '2',
    companyName: 'MotorValle Bianchi',
    address: 'Corso Italia 45',
    city: 'Roma',
    province: 'RM',
    zipCode: '00100',
    createdAt: '2023-03-20',
    isActive: true,
    // Added properties for authentication
    email: 'info@motovallebianchi.it',
    password: 'password123',
    contactName: 'Giulia Bianchi'
  },
  {
    id: '3',
    companyName: 'Centro Auto Milano',
    address: 'Via Torino 67',
    city: 'Milano',
    province: 'MI',
    zipCode: '20123',
    createdAt: '2023-05-10',
    isActive: true,
    // Added properties for authentication
    email: 'info@centroautomilano.it',
    password: 'password123',
    contactName: 'Luigi Verdi'
  },
];

// Initialize mock vendors data
export let vendors: Vendor[] = [
  {
    id: '1',
    dealerId: '1',
    name: 'Marco Rossi',
    email: 'marco@autogalleriarossi.it',
    password: 'password123',
    role: 'vendor',
    createdAt: '2023-01-20',
  },
  {
    id: '2',
    dealerId: '2',
    name: 'Giulia Bianchi',
    email: 'giulia@motovallebianchi.it',
    password: 'password123',
    role: 'vendor',
    createdAt: '2023-03-25',
  },
];

// CRUD operations for dealers
export const addDealer = (newDealer: Omit<Dealer, 'id' | 'createdAt'>): Dealer => {
  const dealer: Dealer = {
    id: `${dealers.length + 1}`,
    ...newDealer,
    isActive: newDealer.isActive !== undefined ? newDealer.isActive : true,
    createdAt: new Date().toISOString().split('T')[0],
  };
  dealers.push(dealer);
  return dealer;
};

export const updateDealer = (updatedDealer: Dealer): Dealer => {
  const index = dealers.findIndex(d => d.id === updatedDealer.id);
  if (index !== -1) {
    dealers[index] = updatedDealer;
    return updatedDealer;
  }
  throw new Error('Dealer not found');
};

export const deleteDealer = (dealerId: string): void => {
  dealers = dealers.filter(d => d.id !== dealerId);
  // Also delete associated vendors
  vendors = vendors.filter(v => v.dealerId !== dealerId);
};

// CRUD operations for vendors
export const getVendorsByDealerId = (dealerId: string): Vendor[] => {
  return vendors.filter(v => v.dealerId === dealerId);
};

export const addVendor = (newVendor: Omit<Vendor, 'id' | 'createdAt'>): Vendor => {
  const vendor: Vendor = {
    id: `${vendors.length + 1}`,
    ...newVendor,
    createdAt: new Date().toISOString().split('T')[0],
  };
  vendors.push(vendor);
  return vendor;
};

export const updateVendor = (updatedVendor: Vendor): Vendor => {
  const index = vendors.findIndex(v => v.id === updatedVendor.id);
  if (index !== -1) {
    vendors[index] = updatedVendor;
    return updatedVendor;
  }
  throw new Error('Vendor not found');
};

export const deleteVendor = (vendorId: string): void => {
  vendors = vendors.filter(v => v.id !== vendorId);
};

export const getUniqueValues = (field: keyof Vehicle) => {
  const values = vehicles.map(vehicle => vehicle[field]);
  return [...new Set(values)];
};

export const getModels = () => getUniqueValues('model');
export const getTrims = () => getUniqueValues('trim');
export const getFuelTypes = () => getUniqueValues('fuelType');
export const getColors = () => getUniqueValues('exteriorColor');
export const getLocations = () => getUniqueValues('location');

export const getPriceRange = (): [number, number] => {
  const prices = vehicles.map(vehicle => vehicle.price);
  return [Math.min(...prices), Math.max(...prices)];
};

export const getCurrentUser = (): User => {
  // In a real app, this would be fetched from auth context
  return users[0]; // Default to admin for demo
};
