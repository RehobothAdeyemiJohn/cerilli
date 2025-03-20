
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
    vehicleId: order.vehicleid || '',
    dealerId: order.dealerid || '',
    // Use customername for both dealerName and customerName
    customerName: order.customername,
    status: order.status as 'processing' | 'delivered' | 'cancelled',
    orderDate: order.orderdate,
    deliveryDate: order.deliverydate,
    progressiveNumber: order.progressivenumber,
    price: order.price,
    // Use customername for dealerName for consistency with database
    dealerName: order.customername,
    modelName: order.modelname,
    plafondDealer: order.plafonddealer,
    
    // Map fields with camelCase frontend names to database column names
    isLicensable: order.islicensable === true,
    hasProforma: order.hasproforma === true,
    isPaid: order.ispaid === true,
    paymentDate: order.paymentdate,
    isInvoiced: order.isinvoiced === true,
    invoiceNumber: order.invoicenumber,
    invoiceDate: order.invoicedate,
    hasConformity: order.hasconformity === true,
    previousChassis: order.previouschassis,
    chassis: order.chassis,
    transportCosts: order.transportcosts || 0,
    restorationCosts: order.restorationcosts || 0,
    fundingType: order.fundingtype,
    odlGenerated: order.odlgenerated === true,
    
    // Relazioni (aggiunta se presenti nei dati)
    vehicle: order.vehicles ? mapVehicleDbToFrontend(order.vehicles) : null,
    dealer: order.dealers ? mapDealerDbToFrontend(order.dealers) : null
  };
};

// Helper function to map frontend order to database format
const mapOrderFrontendToDb = (order: Partial<Order>) => {
  return {
    vehicleid: order.vehicleId,
    dealerid: order.dealerId,
    // Use customerName for customername column, with dealerName as fallback
    customername: order.customerName || order.dealerName,
    status: order.status,
    orderdate: order.orderDate,
    deliverydate: order.deliveryDate,
    price: order.price, 
    modelname: order.modelName,
    plafonddealer: order.plafondDealer,
    
    // Map camelCase fields to database columns
    islicensable: order.isLicensable,
    hasproforma: order.hasProforma,
    ispaid: order.isPaid,
    paymentdate: order.paymentDate,
    isinvoiced: order.isInvoiced,
    invoicenumber: order.invoiceNumber,
    invoicedate: order.invoiceDate,
    hasconformity: order.hasConformity,
    previouschassis: order.previousChassis,
    chassis: order.chassis,
    transportcosts: order.transportCosts,
    restorationcosts: order.restorationCosts,
    fundingtype: order.fundingType,
    odlgenerated: order.odlGenerated
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
