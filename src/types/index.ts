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
  previousChassis?: string;
  originalStock?: 'Cina' | 'Germania';
  year?: string;
  reservedBy?: string;
  reservedAccessories?: string[];
  reservationDestination?: string;
  reservationTimestamp?: string;
  estimatedArrivalDays?: number;
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
  manualEntry?: boolean;
  licensePlateBonus?: number;
  tradeInBonus?: number;
  safetyKit?: number;
  tradeInHandlingFee?: number;
  roadPreparationFee?: number;
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
  dealer?: any;
  details?: OrderDetails;
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
  notes?: string;
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
  createdAt?: string;
  isActive: boolean;
  logo?: string;
  creditLimit?: number;
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
  compatibleModels: string[];
}

export type FuelType = {
  id: string;
  name: string;
  priceAdjustment: number;
  compatibleModels: string[];
}

export type ExteriorColor = {
  id: string;
  name: string;
  type: string;
  priceAdjustment: number;
  compatibleModels: string[];
}

export type Transmission = {
  id: string;
  name: string;
  priceAdjustment: number;
  compatibleModels: string[];
}

export type Accessory = {
  id: string;
  name: string;
  priceWithVAT: number;
  priceWithoutVAT: number;
  compatibleModels: string[];
  compatibleTrims: string[];
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
