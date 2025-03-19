
import { Order } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
    vehicleId: order.vehicleid,
    dealerId: order.dealerid,
    customerName: order.customername,
    status: order.status,
    orderDate: order.orderdate,
    deliveryDate: order.deliverydate,
    progressiveNumber: order.progressive_number,
    price: order.price,
    contractId: order.contract_id,
    // Include related data
    vehicle: order.vehicles ? mapVehicleDbToFrontend(order.vehicles) : undefined,
    dealer: order.dealers ? mapDealerDbToFrontend(order.dealers) : undefined
  };
};

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    console.log("Fetching all orders from Supabase");
    
    // Get current user from localStorage since we can't use hooks in a regular function
    const userJson = localStorage.getItem('currentUser');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    
    try {
      let query = supabase
        .from('orders')
        .select('*, vehicles(*), dealers(*)')
        .order('orderdate', { ascending: false });
      
      // If user is a dealer, only show their orders
      if (currentUser?.type === 'dealer') {
        console.log("Filtering orders for dealer:", currentUser.dealerId);
        query = query.eq('dealerid', currentUser.dealerId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No orders found in database");
        return [];
      }

      console.log("Raw orders data from database:", data);

      // Map database response to frontend types
      const formattedOrders = data.map(mapOrderDbToFrontend);

      console.log("Orders fetched successfully:", formattedOrders);
      return formattedOrders;
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Order> => {
    console.log("Fetching order by ID:", id);
    const { data, error } = await supabase
      .from('orders')
      .select('*, vehicles(*), dealers(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching order:', error);
      throw error || new Error('Order not found');
    }

    return mapOrderDbToFrontend(data);
  },

  create: async (order: Omit<Order, 'id'>): Promise<Order> => {
    console.log("Creating new order in Supabase:", order);
    
    // Map frontend field names to database column names
    const newOrder = {
      vehicleid: order.vehicleId,
      dealerid: order.dealerId,
      customername: order.customerName,
      status: order.status,
      orderdate: order.orderDate || new Date().toISOString(),
      deliverydate: order.deliveryDate,
      price: order.price || 0,
      contract_id: order.contractId
    };
    
    console.log("Formatted order for Supabase insert:", newOrder);
    
    try {
      // First try to use the RPC function which has security definer
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'insert_order',
        {
          p_vehicleid: order.vehicleId,
          p_dealerid: order.dealerId,
          p_customername: order.customerName,
          p_status: order.status || 'processing'
        }
      );
      
      if (rpcError) {
        console.error('Error creating order via RPC:', rpcError);
        // Fall back to direct insert
        const { data, error } = await supabase
          .from('orders')
          .insert(newOrder)
          .select('*, vehicles(*), dealers(*)')
          .single();

        if (error) {
          console.error('Error creating order via direct insert:', error);
          throw error;
        }
        
        console.log("Order created successfully via direct insert:", data);
        return mapOrderDbToFrontend(data);
      }
      
      console.log("Order created successfully via RPC with ID:", rpcData);
      
      // Fetch the created order since RPC just returns the ID
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('*, vehicles(*), dealers(*)')
        .eq('id', rpcData)
        .single();
      
      if (fetchError) {
        console.error('Error fetching created order:', fetchError);
        throw fetchError;
      }
      
      console.log("Fetched created order:", orderData);
      return mapOrderDbToFrontend(orderData);
    } catch (error) {
      console.error('Unexpected error creating order:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    console.log("Updating order in Supabase:", id, updates);
    
    // Map frontend field names to database column names
    const dbUpdates = {
      vehicleid: updates.vehicleId,
      dealerid: updates.dealerId,
      customername: updates.customerName,
      status: updates.status,
      orderdate: updates.orderDate,
      deliverydate: updates.deliveryDate,
      price: updates.price,
      contract_id: updates.contractId
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
        delete dbUpdates[key as keyof typeof dbUpdates];
      }
    });
    
    const { data, error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', id)
      .select('*, vehicles(*), dealers(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error updating order:', error);
      throw error || new Error('Order not found');
    }
    
    return mapOrderDbToFrontend(data);
  },

  delete: async (id: string): Promise<void> => {
    console.log("Deleting order from Supabase:", id);
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
