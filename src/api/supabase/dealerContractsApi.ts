
import { DealerContract } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Helper function to map database fields to our frontend types
const mapDealerDbToFrontend = (dealer: any) => {
  if (!dealer) return null;
  return {
    id: dealer.id,
    companyName: dealer.companyname,
    address: dealer.address,
    city: dealer.city,
    province: dealer.province,
    zipCode: dealer.zipcode,
    email: dealer.email,
    password: dealer.password,
    contactName: dealer.contactname,
    createdAt: dealer.created_at,
    isActive: dealer.isactive,
    logo: dealer.logo,
    creditLimit: dealer.credit_limit,
    esposizione: dealer.esposizione,
    nuovoPlafond: dealer.nuovo_plafond
  };
};

// Helper function to map database vehicle to frontend type
const mapVehicleDbToFrontend = (vehicle: any) => {
  if (!vehicle) return null;
  return {
    id: vehicle.id,
    model: vehicle.model,
    trim: vehicle.trim,
    fuelType: vehicle.fueltype,
    exteriorColor: vehicle.exteriorcolor,
    accessories: vehicle.accessories || [],
    price: vehicle.price,
    location: vehicle.location,
    imageUrl: vehicle.imageurl,
    customImageUrl: vehicle.custom_image_url,
    status: vehicle.status,
    dateAdded: vehicle.dateadded,
    transmission: vehicle.transmission,
    telaio: vehicle.telaio,
    previousChassis: vehicle.previous_chassis,
    originalStock: vehicle.original_stock,
    year: vehicle.year,
    reservedBy: vehicle.reservedby,
    reservedAccessories: vehicle.reservedaccessories,
    reservationDestination: vehicle.reservation_destination,
    reservationTimestamp: vehicle.reservation_timestamp,
    estimatedArrivalDays: vehicle.estimated_arrival_days,
    virtualConfig: vehicle.virtualconfig
  };
};

// Helper function to map database contract to frontend type
const mapContractDbToFrontend = (contract: any): DealerContract => {
  return {
    id: contract.id,
    dealer_id: contract.dealer_id,
    car_id: contract.car_id,
    contract_date: contract.contract_date,
    contract_details: contract.contract_details,
    status: contract.status,
    createdAt: contract.created_at,
    updatedAt: contract.updated_at,
    dealer: contract.dealers ? mapDealerDbToFrontend(contract.dealers) : undefined,
    vehicle: contract.vehicles ? mapVehicleDbToFrontend(contract.vehicles) : undefined
  };
};

export const dealerContractsApi = {
  getAll: async (): Promise<DealerContract[]> => {
    console.log("Fetching all dealer contracts from Supabase");
    
    // Get current user from localStorage since we can't use hooks in a regular function
    const userJson = localStorage.getItem('currentUser');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    
    let query = supabase
      .from('dealer_contracts')
      .select('*, dealers(*), vehicles:car_id(*)') // Usiamo alias per il foreign key
      .order('contract_date', { ascending: false });
    
    // Se l'utente è un dealer, mostra solo i suoi contratti
    if (currentUser?.type === 'dealer') {
      console.log("Filtering contracts for dealer:", currentUser.dealerId);
      query = query.eq('dealer_id', currentUser.dealerId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching dealer contracts:', error);
      throw error;
    }

    // Map database response to frontend types
    const formattedContracts = data.map(mapContractDbToFrontend);

    console.log("Dealer contracts fetched successfully:", formattedContracts);
    return formattedContracts;
  },

  getById: async (id: string): Promise<DealerContract> => {
    console.log("Fetching dealer contract by ID:", id);
    const { data, error } = await supabase
      .from('dealer_contracts')
      .select('*, dealers(*), vehicles:car_id(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching dealer contract:', error);
      throw error || new Error('Dealer contract not found');
    }

    return mapContractDbToFrontend(data);
  },

  create: async (contract: Omit<DealerContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<DealerContract> => {
    console.log("Creating new dealer contract in Supabase:", contract);
    
    // Map frontend field names to database column names
    const newContract = {
      dealer_id: contract.dealer_id,
      car_id: contract.car_id,
      contract_date: contract.contract_date,
      contract_details: contract.contract_details,
      status: contract.status
    };
    
    console.log("Formatted contract for Supabase insert:", newContract);
    
    const { data, error } = await supabase
      .from('dealer_contracts')
      .insert(newContract)
      .select('*, dealers(*), vehicles:car_id(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error creating dealer contract:', error);
      throw error || new Error('Failed to create dealer contract');
    }
    
    console.log("Dealer contract created successfully:", data);
    
    return mapContractDbToFrontend(data);
  },

  update: async (id: string, updates: Partial<DealerContract>): Promise<DealerContract> => {
    console.log("Updating dealer contract in Supabase:", id, updates);
    
    // Map frontend field names to database column names
    const dbUpdates = {
      dealer_id: updates.dealer_id,
      car_id: updates.car_id,
      contract_date: updates.contract_date,
      contract_details: updates.contract_details,
      status: updates.status
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    const { data, error } = await supabase
      .from('dealer_contracts')
      .update(dbUpdates)
      .eq('id', id)
      .select('*, dealers(*), vehicles:car_id(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error updating dealer contract:', error);
      throw error || new Error('Dealer contract not found');
    }
    
    return mapContractDbToFrontend(data);
  },

  delete: async (id: string): Promise<void> => {
    console.log("Deleting dealer contract from Supabase:", id);
    const { error } = await supabase
      .from('dealer_contracts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dealer contract:', error);
      throw error;
    }
    
    console.log("Dealer contract deleted successfully");
  },

  // Method to create a contract from an order
  createFromOrder: async (orderId: string, contractDetails?: any): Promise<DealerContract> => {
    console.log(`Creating contract from order ${orderId}`);
    
    // Get order details
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*, vehicles(*), dealers(*)')
      .eq('id', orderId)
      .maybeSingle();
      
    if (orderError || !orderData) {
      console.error('Error fetching order for contract creation:', orderError);
      throw orderError || new Error('Order not found');
    }
    
    // Create new contract
    const newContract = {
      dealer_id: orderData.dealer_id,
      car_id: orderData.vehicle_id,
      contract_date: new Date().toISOString(),
      contract_details: contractDetails || {},
      status: 'attivo'
    };
    
    // Insert contract
    const { data, error } = await supabase
      .from('dealer_contracts')
      .insert(newContract)
      .select('*, dealers(*), vehicles:car_id(*)')
      .maybeSingle();
      
    if (error || !data) {
      console.error('Error creating contract from order:', error);
      throw error || new Error('Failed to create contract from order');
    }
    
    return mapContractDbToFrontend(data);
  }
};
