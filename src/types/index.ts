
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
  customImageUrl?: string;
  status: 'available' | 'reserved' | 'sold' | 'ordered' | 'delivered';
  dateAdded: string;
  transmission?: string;
  telaio: string;
  chassis?: string; // Added chassis property
  previousChassis?: string;
  originalStock?: 'Cina' | 'Germania';
  year?: string;
  reservedBy?: string;
  reservedAccessories?: string[];
  reservationDestination?: string;
  reservationTimestamp?: string;
  estimatedArrivalDays?: number;
  estimated_arrival_days?:any,
  created_at?:any,
  virtualConfig?: {
    trim: string;
    fuelType: string;
    exteriorColor: string;
    transmission: string;
    accessories: string[];
    price: number;
  };
  _action?: string;
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
  customerEmail?: string;
  customerPhone?: string;
  price: number;
  discount: number;
  finalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  createdAt: string;
  notes?: string;
  rejectionReason?: string;
  manualEntry?: boolean;
  vehicleInfo?: {
    model: string;
    trim?: string;
    imageUrl?: string;
    location: string;
  };
  reducedVAT?: boolean;
  vatRate?: number;
  hasTradeIn?: boolean;
  tradeInBrand?: string;
  tradeInModel?: string;
  tradeInPlate?: string;
  tradeInYear?: string;
  tradeInKm?: number;
  tradeInValue?: number;
  licensePlateBonus?: number;
  tradeInBonus?: number;
  safetyKit?: number;
  tradeInHandlingFee?: number;
  roadPreparationFee?: number;
  tradeInMake?: string;
  accessories?: string[];
  accessoryPrice?: number;
  vehicleData?: {
    model: string;
    trim?: string;
    exteriorColor?: string;
    fuelType?: string;
    price?: number;
  };
};

export interface Order {
  id: string;
  vehicleId: string;
  dealerId: string;
  customerName: string;
  status: 'processing' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  progressiveNumber?: number;
  price?: number;
  dealerName?: string;
  modelName?: string;
  plafondDealer?: number;
  
  isLicensable: boolean;
  hasProforma: boolean;
  isPaid: boolean;
  paymentDate?: string;
  isInvoiced: boolean;
  invoiceNumber?: string;
  invoiceDate?: string;
  hasConformity: boolean;
  previousChassis?: string;
  chassis?: string;
  transportCosts: number;
  restorationCosts: number;
  fundingType?: string;
  odlGenerated: boolean;
  notes?: string;
  
  // New fields for proforma details
  proformaNumber?: string;
  proformaDate?: string;
  
  vehicle?: Vehicle | null;
  dealer?: Dealer | null;
}

export type Filter = {
  models: string[];
  trims: string[];
  fuelTypes: string[];
  colors: string[];
  locations: string[];
  priceRange: [number, number];
  status: string[];
  searchText?: string;
  dealers?: string[];
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

export interface Dealer {
  id: string;
  companyName: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  email: string;
  password: string;
  contactName: string;
  createdAt: string;
  isActive: boolean;
  logo?: string;
  creditLimit?: number;
  nuovoPlafond?: number;
  nuovo_plafond?: number;
  esposizione?: number;
  orders?: Order[];
}

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
  imageUrl?: string;
}

export type VehicleTrim = {
  id: string;
  name: string;
  basePrice: number;
  compatible_models: string[];
}

export type FuelType = {
  id: string;
  name: string;
  price_adjustment: number;
  compatible_models: string[];
}

export type ExteriorColor = {
  id: string;
  name: string;
  type: string;
  price_adjustment: number;
  compatible_models: string[];
}

export type Transmission = {
  id: string;
  name: string;
  price_adjustment: number;
  compatible_models: string[];
}

export type Accessory = {
  id: string;
  name: string;
  price: number;
  compatible_models: string[];
  compatible_trims: string[];
}

export type DefectReport = {
  id: string;
  caseNumber: number;
  dealerId: string;
  dealerName: string;
  vehicleId?: string;
  email?: string;
  status: 'Aperta' | 'Approvata' | 'Approvata Parzialmente' | 'Respinta';
  reason: 'Danni da trasporto' | 'Difformità Pre-Garanzia Tecnica' | 'Carrozzeria';
  description: string;
  vehicleReceiptDate: string;
  repairCost: number;
  approvedRepairValue?: number;
  sparePartsRequest?: string;
  transportDocumentUrl?: string;
  photoReportUrls?: string[];
  repairQuoteUrl?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  paymentDate?: string;
}

export type DefectReportStats = {
  openReports: number;
  closedReports: number;
  approvedReports: number;
  totalPaid: number;
}

export interface OrderFilters {
  searchText?: string;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  models?: string[];
  dealers?: string[];
  status?: string[];
  isLicensable: boolean | null;
  hasProforma: boolean | null;
  isPaid: boolean | null;
  isInvoiced: boolean | null;
  hasConformity: boolean | null;
  dealerId: string | null;
  model: string | null;
}

export interface DealerContract {
  id: string;
  dealer_id: string;
  car_id: string;
  contract_date: string;
  status: string;
  contract_details?: any;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  dealer?: Dealer;
}
