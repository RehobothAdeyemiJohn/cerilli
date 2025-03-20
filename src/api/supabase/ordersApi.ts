
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
    vehicleId: order.vehicleid || order.vehicle_id || '',
    dealerId: order.dealerid || order.dealer_id || '',
    // CRITICAL FIX: Only use customername (the actual DB column) and fallback to others
    customerName: order.customername || '',
    status: order.status as 'processing' | 'delivered' | 'cancelled',
    orderDate: order.orderdate || order.order_date,
    deliveryDate: order.deliverydate || order.delivery_date,
    progressiveNumber: order.progressivenumber || order.progressive_number,
    price: order.price,
    // Set dealerName from customername for frontend display
    dealerName: order.customername || '',
    modelName: order.modelname || order.model_name,
    plafondDealer: order.plafonddealer || order.plafond_dealer,
    
    // Map fields with camelCase frontend names to database column names
    isLicensable: order.islicensable === true || order.is_licensable === true,
    hasProforma: order.hasproforma === true || order.has_proforma === true,
    isPaid: order.ispaid === true || order.is_paid === true,
    paymentDate: order.paymentdate || order.payment_date,
    isInvoiced: order.isinvoiced === true || order.is_invoiced === true,
    invoiceNumber: order.invoicenumber || order.invoice_number,
    invoiceDate: order.invoicedate || order.invoice_date,
    hasConformity: order.hasconformity === true || order.has_conformity === true,
    previousChassis: order.previouschassis || order.previous_chassis,
    chassis: order.chassis,
    transportCosts: order.transportcosts || order.transport_costs || 0,
    restorationCosts: order.restorationcosts || order.restoration_costs || 0,
    fundingType: order.fundingtype || order.funding_type,
    odlGenerated: order.odlgenerated === true || order.odl_generated === true,
    
    // Relazioni (aggiunta se presenti nei dati)
    vehicle: order.vehicles ? mapVehicleDbToFrontend(order.vehicles) : null,
    dealer: order.dealers ? mapDealerDbToFrontend(order.dealers) : null
  };
};

// Helper function to map frontend order to database format
const mapOrderFrontendToDb = (order: Partial<Order>) => {
  // CRITICAL FIX: ONLY use the exact column names from the database schema
  return {
    vehicleid: order.vehicleId,
    dealerid: order.dealerId,
    // Use customername for dealerName/customerName - this is the key fix
    customername: order.customerName || order.dealerName,
    status: order.status,
    orderdate: order.orderDate,
    deliverydate: order.deliveryDate,
    price: order.price, 
    model_name: order.modelName,
    plafond_dealer: order.plafondDealer,
    
    // Use snake_case column names as seen in the database schema
    is_licensable: order.isLicensable,
    has_proforma: order.hasProforma,
    is_paid: order.isPaid,
    payment_date: order.paymentDate,
    is_invoiced: order.isInvoiced,
    invoice_number: order.invoiceNumber,
    invoice_date: order.invoiceDate,
    has_conformity: order.hasConformity,
    previous_chassis: order.previousChassis,
    chassis: order.chassis,
    transport_costs: order.transportCosts,
    restoration_costs: order.restorationCosts,
    funding_type: order.fundingType,
    odl_generated: order.odlGenerated
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
          vehicles:vehicleid (*),
          dealers:dealerid (*)
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
        vehicles:vehicleid (*),
        dealers:dealerid (*)
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
    
    if (order.dealerId) {
      try {
        const { data: dealer } = await supabase
          .from('dealers')
          .select('*')
          .eq('id', order.dealerId)
          .maybeSingle();
          
        if (dealer) {
          dealerPlafond = dealer.nuovo_plafond || dealer.credit_limit || 0;
        }
      } catch (e) {
        console.error('Error fetching dealer for plafond:', e);
      }
    }
    
    // Get vehicle model if available
    let modelName = order.modelName;
    if (order.vehicleId && !modelName) {
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
    
    // Prepare order data with the correct column names
    const orderData = {
      ...order,
      modelName: modelName,
      plafondDealer: dealerPlafond,
      // Make sure customerName is set (use dealerName as fallback if needed)
      customerName: order.customerName || order.dealerName
    };
    
    // Map frontend field names to database column names
    const dbOrder = mapOrderFrontendToDb({
      ...orderData,
      // Set default values for non-nullable fields
      orderDate: orderData.orderDate || new Date().toISOString(),
      // Default values for boolean fields
      isLicensable: false,
      hasProforma: false,
      isPaid: false,
      isInvoiced: false,
      hasConformity: false,
      odlGenerated: false,
      transportCosts: 0,
      restorationCosts: 0
    });
    
    console.log("Formatted order for Supabase insert:", dbOrder);
    
    const { data, error } = await supabase
      .from('orders')
      .insert(dbOrder)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned from order creation');
      throw new Error('Failed to create order - no data returned');
    }
    
    console.log("Order created successfully:", data);
    return mapOrderDbToFrontend(data);
  },
  
  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    console.log("Updating order in Supabase:", id, updates);
    
    // Map frontend field names to database column names
    const dbUpdates = mapOrderFrontendToDb(updates);
    
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
      .update({ odlgenerated: true })
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
