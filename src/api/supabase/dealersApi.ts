import { Dealer, Order } from '@/types';
import { supabase } from './client';
import {v4} from 'uuid'

// Helper function to map database dealer to frontend type
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

// Helper function to map DB order to frontend Order type
const mapOrderToFrontend = (order: any): Order => {
  return {
    id: order.id,
    vehicleId: order.vehicleId || order.vehicle_id,
    dealerId: order.dealerId || order.dealer_id,
    customerName: order.customerName || order.customer_name,
    status: order.status,
    orderDate: order.orderDate || order.order_date,
    deliveryDate: order.deliveryDate || order.delivery_date,
    progressiveNumber: order.progressive_number,
    price: order.price,
    dealerName: order.dealerName || order.dealer_name,
    modelName: order.modelName || order.model_name,
    plafondDealer: order.plafondDealer || order.plafond_dealer,
    
    // Required properties with default values
    isLicensable: order.isLicensable || order.is_licensable || false,
    hasProforma: order.hasProforma || order.has_proforma || false,
    isPaid: order.isPaid || order.is_paid || false,
    isInvoiced: order.isInvoiced || order.is_invoiced || false,
    hasConformity: order.hasConformity || order.has_conformity || false,
    odlGenerated: order.odlGenerated || order.odl_generated || false,
    transportCosts: order.transportCosts || order.transport_costs || 0,
    restorationCosts: order.restorationCosts || order.restoration_costs || 0,
    
    // Optional properties
    paymentDate: order.paymentDate || order.payment_date,
    invoiceNumber: order.invoiceNumber || order.invoice_number,
    invoiceDate: order.invoiceDate || order.invoice_date,
    previousChassis: order.previousChassis || order.previous_chassis,
    chassis: order.chassis,
    fundingType: order.fundingType || order.funding_type,
    notes: order.notes,
    
    // Relations
    vehicle: order.vehicle,
    dealer: order.dealer
  };
};

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => {
    // console.log("Fetching all dealers from Supabase");
    
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*');
      
      if (error) {
        console.error('Error fetching dealers:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log("No dealers found in database");
        return [];
      }
      
      console.log(`Retrieved ${data.length} dealers from database`);
      
      // Map each database record to our frontend Dealer type
      const dealers = data.map(dealer => mapDealerDbToFrontend(dealer));
      return dealers;
    } catch (error) {
      console.error('Unexpected error fetching dealers:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Dealer | null> => {
    console.log("Fetching dealer by ID:", id);
    
    try {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching dealer:', error);
        return null;
      }
      
      if (!data) {
        console.log("Dealer not found in database");
        return null;
      }
      
      console.log("Dealer found:", data);
      return mapDealerDbToFrontend(data);
    } catch (error) {
      console.error('Unexpected error fetching dealer:', error);
      return null;
    }
  },
  
  getOrdersByDealer: async (dealerId: string): Promise<Order[]> => {
    console.log("Fetching orders for dealer:", dealerId);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vehicles:vehicle_id (*)
        `)
        .eq('dealer_id', dealerId);
      
      if (error) {
        console.error('Error fetching dealer orders:', error);
        return [];
      }
      
      console.log(`Found ${data.length} orders for dealer ${dealerId}`);
      
      // Map the database records to our frontend Order type
      const orders = data.map(order => mapOrderToFrontend(order));
      
      return orders;
    } catch (error) {
      console.error('Unexpected error fetching dealer orders:', error);
      return [];
    }
  },
  
  getDealerWithOrders: async (dealerId: string): Promise<Dealer | null> => {
    console.log("Fetching dealer with orders:", dealerId);
    
    try {
      // First get the dealer
      const { data: dealer, error: dealerError } = await supabase
        .from('dealers')
        .select('*')
        .eq('id', dealerId)
        .maybeSingle();
      
      if (dealerError || !dealer) {
        console.error('Error fetching dealer:', dealerError);
        return null;
      }
      
      // Then get the dealer's orders
      const { data: orderData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          vehicles:vehicle_id (*)
        `)
        .eq('dealer_id', dealerId);
      
      if (ordersError) {
        console.error('Error fetching dealer orders:', ordersError);
        return mapDealerDbToFrontend(dealer);
      }
      
      console.log(`Found ${orderData.length} orders for dealer ${dealerId}`);
      
      // Map the database records to our frontend Order type
      const orders = orderData.map(order => mapOrderToFrontend(order));
      
      // Add orders to dealer object
      const dealerWithOrders = {
        ...mapDealerDbToFrontend(dealer),
        orders
      };
      
      return dealerWithOrders;
    } catch (error) {
      console.error('Unexpected error fetching dealer with orders:', error);
      return null;
    }
  },
  
  update: async (id: string, updates: Partial<Dealer>): Promise<Dealer | null> => {
    console.log("Updating dealer in Supabase:", id, updates);
    
    // Map frontend field names to database column names
    const dbUpdates: any = {
      companyname: updates.companyName,
      address: updates.address,
      city: updates.city,
      province: updates.province,
      zipcode: updates.zipCode,
      email: updates.email,
      password: updates.password,
      contactname: updates.contactName,
      isactive: updates.isActive,
      logo: updates.logo,
      credit_limit: updates.creditLimit,
      nuovo_plafond: updates.nuovoPlafond,
      esposizione: updates.esposizione
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    const { data, error } = await supabase
      .from('dealers')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating dealer:', error);
      throw error;
    }
    
    console.log("Dealer updated successfully:", data);
    return mapDealerDbToFrontend(data);
  },
  
  create: async (dealer: Omit<Dealer, 'id' | 'createdAt'>): Promise<Dealer | null> => {
    console.log("Creating new dealer in Supabase:", dealer);
    
    // Map frontend field names to database column names
    const newDealer = {
      id:v4(),
      companyname: dealer.companyName,
      address: dealer.address,
      city: dealer.city,
      province: dealer.province,
      zipcode: dealer.zipCode,
      email: dealer.email,
      password: dealer.password,
      contactname: dealer.contactName,
      isactive: dealer.isActive,
      logo: dealer.logo,
      credit_limit: dealer.creditLimit,
      nuovo_plafond: dealer.nuovoPlafond,
      esposizione: dealer.esposizione
    };
    
    const { data, error } = await supabase
      .from('dealers')
      .insert(newDealer)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating dealer:', error);
      throw error;
    }
    
    console.log("Dealer created successfully:", data);
    return mapDealerDbToFrontend(data);
  },
  
  delete: async (id: string): Promise<void> => {
    console.log("Deleting dealer:", id);
    
    const { error } = await supabase
      .from('dealers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting dealer:', error);
      throw error;
    }
    
    console.log("Dealer deleted successfully");
  }
};
