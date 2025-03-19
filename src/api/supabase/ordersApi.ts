
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
    vehicleId: order.vehicle_id || order.vehicleid || '',
    dealerId: order.dealer_id || order.dealerid || '',
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

// Helper function to map frontend order to database format
const mapOrderFrontendToDb = (order: Partial<Order>) => {
  return {
    vehicle_id: order.vehicleId,
    vehicleid: order.vehicleId, // Add compatibility field
    dealer_id: order.dealerId,
    dealerid: order.dealerId, // Add compatibility field
    customer_name: order.customerName,
    status: order.status,
    order_date: order.orderDate,
    delivery_date: order.deliveryDate,
    price: order.price, 
    dealer_name: order.dealerName,
    model_name: order.modelName,
    plafond_dealer: order.plafondDealer,
    
    // Map camelCase fields to snake_case database columns
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
    
    // Prepare order data with default values for required fields
    const orderData = {
      ...order,
      dealerName: dealerName || order.dealerName || order.customerName,
      modelName: modelName || order.modelName,
      plafondDealer: dealerPlafond
    };
    
    // Map frontend field names to database column names with both naming conventions
    const dbOrder = {
      ...mapOrderFrontendToDb({
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
      }),
      // Ensure both camelCase and snake_case fields are populated
      vehicleid: order.vehicleId,
      dealerid: order.dealerId
    };
    
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
