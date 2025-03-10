
export type Vehicle = {
  id: string;
  model: string;
  trim: string;
  fuelType: string;
  exteriorColor: string;
  accessories: string[];
  price: number;
  location: string;
  imageUrl?: string;
  status: 'available' | 'reserved' | 'sold';
  dateAdded: string;
  transmission?: string;
  telaio: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dealer';
  dealerName?: string;
};

export type Quote = {
  id: string;
  vehicleId: string;
  dealerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  price: number;
  discount: number;
  finalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  createdAt: string;
};

export type Order = {
  id: string;
  vehicleId: string;
  dealerId: string;
  quoteId?: string;
  customerName: string;
  status: 'processing' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
};

export type Filter = {
  models: string[];
  trims: string[];
  fuelTypes: string[];
  colors: string[];
  locations: string[];
  priceRange: [number, number];
  status: string[];
  searchText?: string;
};

export type Stat = {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
};

export type ChartData = {
  name: string;
  value: number;
}[];

// New types for Settings
export type VehicleModel = {
  id: string;
  name: string;
  basePrice: number;
};

export type VehicleTrim = {
  id: string;
  name: string;
  basePrice: number;
  compatibleModels?: string[]; // Array of model IDs
};

export type FuelType = {
  id: string;
  name: string;
  priceAdjustment: number; // Price adjustment relative to base price
};

export type ExteriorColor = {
  id: string;
  name: string;
  type: string; // e.g., "metallizzato", "pastello"
  priceAdjustment: number;
};

export type Transmission = {
  id: string;
  name: string;
  priceAdjustment: number;
};

export type Accessory = {
  id: string;
  name: string;
  priceWithVAT: number;
  priceWithoutVAT: number;
  compatibleModels: string[]; // Array of model IDs, empty means all models
  compatibleTrims: string[]; // Array of trim IDs, empty means all trims
};
