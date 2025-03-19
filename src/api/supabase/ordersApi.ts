
import { Order } from '@/types';
import { supabase } from './client';

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

// Helper function to map database order to frontend type
const mapOrderDbToFrontend = (order: any): Order => {
  return {
    id: order.id,
    vehicleId: order.vehicle_id || '',
    dealerId: order.dealer_id || '',
    customerName: order.customer_name,
    status: order.status as 'processing' | 'delivered' | 'cancelled',
    orderDate: order.order_date,
    deliveryDate: order.delivery_date,
    progressiveNumber: order.progressive_number,
    price: order.price,
    dealerName: order.dealer_name,
    modelName: order.model_name,
    plafondDealer: order.plafond_dealer,
    
    // Campi precedentemente in order_details
    isLicensable: order.is_licensable === true,
    hasProforma: order.has_proforma === true,
    isPaid: order.is_paid === true,
    paymentDate: order.payment_date,
    isInvoiced: order.is_invoiced === true,
    invoiceNumber: order.invoice_number,
    invoiceDate: order.invoice_date,
    hasConformity: order.has_conformity === true,
    previousChassis: order.previous_chassis,
    chassis: order.chassis,
    transportCosts: order.transport_costs || 0,
    restorationCosts: order.restoration_costs || 0,
    fundingType: order.funding_type,
    odlGenerated: order.odl_generated === true,
    
    // Relazioni (aggiunta se presenti nei dati)
    vehicle: order.vehicles ? mapVehicleDbToFrontend(order.vehicles) : null,
    dealer: order.dealers ? mapDealerDbToFrontend(order.dealers) : null
  };
};

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    console.log("Fetching all orders from Supabase");
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vehicles:vehicle_id (*),
          dealers:dealer_id (*)
        `);
      
      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log("No orders found in database");
        return [];
      }
      
      console.log(`Retrieved ${data.length} orders from database`);
      
      // Map each database record to our frontend Order type
      const orders = data.map(order => mapOrderDbToFrontend(order));
      return orders;
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Order> => {
    console.log("Fetching order by ID:", id);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vehicles:vehicle_id (*),
        dealers:dealer_id (*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching order:', error);
      throw error || new Error('Order not found');
    }
    
    return mapOrderDbToFrontend(data);
  },
  
  create: async (order: Omit<Order, 'id' | 'isLicensable' | 'hasProforma' | 'isPaid' | 'isInvoiced' | 'hasConformity' | 'odlGenerated' | 'transportCosts' | 'restorationCosts'>): Promise<Order> => {
    console.log("Creating new order in Supabase:", order);
    
    // Get dealer info to store plafond_dealer at order creation time
    let dealerPlafond = null;
    let dealerName = null;
    let modelName = null;
    
    if (order.dealerId) {
      try {
        const { data: dealer } = await supabase
          .from('dealers')
          .select('*')
          .eq('id', order.dealerId)
          .maybeSingle();
          
        if (dealer) {
          dealerPlafond = dealer.nuovo_plafond || dealer.credit_limit || 0;
          dealerName = dealer.companyname;
        }
      } catch (e) {
        console.error('Error fetching dealer for plafond:', e);
      }
    }
    
    // Get vehicle model if available
    if (order.vehicleId) {
      try {
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('model')
          .eq('id', order.vehicleId)
          .maybeSingle();
          
        if (vehicle) {
          modelName = vehicle.model;
        }
      } catch (e) {
        console.error('Error fetching vehicle model:', e);
      }
    }
    
    // Map frontend field names to database column names
    const newOrder = {
      vehicle_id: order.vehicleId,
      dealer_id: order.dealerId,
      customer_name: order.customerName,
      status: order.status,
      order_date: order.orderDate || new Date().toISOString(),
      delivery_date: order.deliveryDate,
      price: order.price || 0,
      dealer_name: dealerName || order.dealerName || order.customerName,
      model_name: modelName || order.modelName,
      plafond_dealer: dealerPlafond,
      
      // Campi di order_details con valori predefiniti
      is_licensable: false,
      has_proforma: false,
      is_paid: false,
      is_invoiced: false,
      has_conformity: false,
      odl_generated: false,
      transport_costs: 0,
      restoration_costs: 0
    };
    
    console.log("Formatted order for Supabase insert:", newOrder);
    
    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    console.log("Order created successfully:", data);
    return mapOrderDbToFrontend(data);
  },
  
  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    console.log("Updating order in Supabase:", id, updates);
    
    // Map frontend field names to database column names
    const dbUpdates: any = {
      vehicle_id: updates.vehicleId,
      dealer_id: updates.dealerId,
      customer_name: updates.customerName,
      status: updates.status,
      order_date: updates.orderDate,
      delivery_date: updates.deliveryDate,
      price: updates.price,
      dealer_name: updates.dealerName,
      model_name: updates.modelName,
      plafond_dealer: updates.plafondDealer,
      
      // Campi precedentemente in order_details
      is_licensable: updates.isLicensable,
      has_proforma: updates.hasProforma,
      is_paid: updates.isPaid,
      payment_date: updates.paymentDate,
      is_invoiced: updates.isInvoiced,
      invoice_number: updates.invoiceNumber,
      invoice_date: updates.invoiceDate,
      has_conformity: updates.hasConformity,
      previous_chassis: updates.previousChassis,
      chassis: updates.chassis,
      transport_costs: updates.transportCosts,
      restoration_costs: updates.restorationCosts,
      funding_type: updates.fundingType,
      odl_generated: updates.odlGenerated
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    const { data, error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order:', error);
      throw error;
    }
    
    console.log("Order updated successfully:", data);
    return mapOrderDbToFrontend(data);
  },
  
  generateODL: async (id: string): Promise<Order> => {
    console.log("Generating ODL for order:", id);
    
    const { data, error } = await supabase
      .from('orders')
      .update({ odl_generated: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error generating ODL for order:', error);
      throw error;
    }
    
    console.log("ODL generated successfully for order:", data);
    return mapOrderDbToFrontend(data);
  },
  
  delete: async (id: string): Promise<void> => {
    console.log("Deleting order:", id);
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
    
    console.log("Order deleted successfully");
  }
};
