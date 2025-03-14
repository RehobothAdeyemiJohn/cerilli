
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
  customImageUrl?: string; // New field for custom vehicle image
  status: 'available' | 'reserved' | 'sold' | 'ordered' | 'delivered';
  dateAdded: string;
  transmission?: string;
  telaio: string;
  previousChassis?: string; // New field for RIF (previous chassis) in virtual stock
  originalStock?: 'Cina' | 'Germania'; // New field for stock origin in virtual stock
  year?: string;
  reservedBy?: string;
  reservedAccessories?: string[];
  reservationDestination?: string;
  reservationTimestamp?: string; // Timestamp when reservation was made
  estimatedArrivalDays?: number; // New field for fixed estimated arrival days
  virtualConfig?: {
    trim: string;
    fuelType: string;
    exteriorColor: string;
    transmission: string;
    accessories: string[];
    price: number;
  };
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
  rejectionReason?: string;
  tradeInBrand?: string;
  tradeInModel?: string;
  tradeInYear?: string;
  tradeInKm?: number;
  tradeInValue?: number;
  hasTradeIn?: boolean;
  reducedVAT?: boolean;
  vatRate?: number;
  accessories?: string[];
  accessoryPrice?: number;
  notes?: string;
  manualEntry?: boolean; // Added the manualEntry property
  licensePlateBonus?: number; // New field for Premio Targa
  tradeInBonus?: number; // New field for Premio Permuta
  safetyKit?: number; // New field for Kit Sicurezza
  tradeInHandlingFee?: number; // New field for Gestione Usato
  roadPreparationFee?: number; // Made this explicit in the type
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
  vehicle?: Vehicle;
  dealer?: any; // Using any temporarily as we don't have a complete Dealer type defined
  details?: OrderDetails; // New field for order administrative details
};

export type OrderDetails = {
  id: string;
  orderId: string;
  previousChassis?: string;
  chassis?: string;
  isLicensable: boolean;
  hasProforma: boolean;
  isPaid: boolean;
  paymentDate?: string;
  isInvoiced: boolean;
  invoiceNumber?: string;
  invoiceDate?: string;
  hasConformity: boolean;
  fundingType?: 'Factor' | 'Captive' | 'Acquisto Diretto';
  transportCosts: number;
  restorationCosts: number;
  odlGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string; // Add notes field to OrderDetails
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

export type Dealer = {
  id: string;
  companyName: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  createdAt: string;
  isActive?: boolean;
  email: string;
  password: string;
  contactName: string;
  logo?: string;
  creditLimit?: number; // Added the creditLimit property
};

export type Vendor = {
  id: string;
  dealerId: string;
  name: string;
  email: string;
  password: string;
  role: 'vendor';
  createdAt: string;
};

export interface VehicleModel {
  id: string;
  name: string;
  basePrice: number;
  imageUrl?: string; // Add this property
}

export type VehicleTrim = {
  id: string;
  name: string;
  basePrice: number;
  compatibleModels: string[]; // Array of model IDs, empty means all models
};

export type FuelType = {
  id: string;
  name: string;
  priceAdjustment: number;
  compatibleModels: string[]; // Array of model IDs, empty means all models
};

export type ExteriorColor = {
  id: string;
  name: string;
  type: string;
  priceAdjustment: number;
  compatibleModels: string[]; // Array of model IDs, empty means all models
};

export type Transmission = {
  id: string;
  name: string;
  priceAdjustment: number;
  compatibleModels: string[]; // Array of model IDs, empty means all models
};

export type Accessory = {
  id: string;
  name: string;
  priceWithVAT: number;
  priceWithoutVAT: number;
  compatibleModels: string[]; // Array of model IDs, empty means all models
  compatibleTrims: string[]; // Array of trim IDs, empty means all trims
};
