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
  console.log("Mapping order to frontend:", order);
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
    vehicle: order.vehicles ? mapVehicleDbToFrontend(order.vehicles) : null,
    dealer: order.dealers ? mapDealerDbToFrontend(order.dealers) : null
  };
};

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    console.log("Fetching all orders from Supabase");

    // Let's verify if the orders table exists and what columns it has
    try {
      console.log("Checking database tables...");
      const { data: tables, error: tablesError } = await supabase.rpc('list_tables');
      
      if (tablesError) {
        console.error('Error listing tables:', tablesError);
      } else {
        console.log("Available tables:", tables);
        
        // If we have orders table, let's check its columns
        if (tables && tables.some((t: any) => t.table_name === 'orders')) {
          console.log("Orders table exists, checking its columns...");
          
          // Get information about the orders table columns
          const { data: columns, error: columnsError } = await supabase.from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', 'orders');
          
          if (columnsError) {
            console.error('Error fetching columns:', columnsError);
          } else {
            console.log("Orders table columns:", columns);
          }
        }
      }
    } catch (e) {
      console.error("Error checking database structure:", e);
    }
    
    // First try: Fetch orders directly
    try {
      console.log("Attempting to fetch orders with simple query...");
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      
      if (error) {
        console.error('Error with simple query:', error);
      } else {
        console.log("Simple query result:", data);
        
        if (data && data.length > 0) {
          // We have orders! Now try to fetch related data separately
          console.log(`Found ${data.length} orders. Fetching related data...`);
          
          const ordersWithRelations = await Promise.all(
            data.map(async (order) => {
              let vehicleData = null;
              let dealerData = null;
              
              // Try to fetch the vehicle
              if (order.vehicleid) {
                const { data: vehicle } = await supabase
                  .from('vehicles')
                  .select('*')
                  .eq('id', order.vehicleid)
                  .maybeSingle();
                
                vehicleData = vehicle;
              }
              
              // Try to fetch the dealer
              if (order.dealerid) {
                const { data: dealer } = await supabase
                  .from('dealers')
                  .select('*')
                  .eq('id', order.dealerid)
                  .maybeSingle();
                
                dealerData = dealer;
              }
              
              // Return the order with manually fetched relations
              return {
                ...order,
                vehicles: vehicleData,
                dealers: dealerData
              };
            })
          );
          
          console.log("Orders with manually fetched relations:", ordersWithRelations);
          
          // Map to frontend format
          const formattedOrders = ordersWithRelations.map(mapOrderDbToFrontend);
          console.log("Formatted orders:", formattedOrders);
          return formattedOrders;
        }
      }
    } catch (e) {
      console.error("Error with simple fetch approach:", e);
    }
    
    // Second try: Fetch with join
    try {
      console.log("Attempting to fetch orders with join query...");
      const { data, error } = await supabase
        .from('orders')
        .select('*, vehicles(*), dealers(*)');
      
      if (error) {
        console.error('Error with joined query:', error);
      } else {
        console.log("Joined query result:", data);
        
        if (data && data.length > 0) {
          // Map the orders from the joined query
          const formattedOrders = data.map(mapOrderDbToFrontend);
          console.log("Formatted orders from join:", formattedOrders);
          return formattedOrders;
        }
      }
    } catch (e) {
      console.error("Error with join fetch approach:", e);
    }
    
    // Final attempt: Use RPC function
    try {
      console.log("Attempting to use RPC function as last resort...");
      
      // Try to call a custom function to get orders if it exists
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_orders');
      
      if (rpcError) {
        console.error('RPC function error or not available:', rpcError);
      } else if (rpcData && rpcData.length > 0) {
        console.log("RPC function result:", rpcData);
        
        // Map the orders 
        const formattedOrders = rpcData.map(mapOrderDbToFrontend);
        console.log("Formatted orders from RPC:", formattedOrders);
        return formattedOrders;
      }
    } catch (e) {
      console.error("Error with RPC approach:", e);
    }
    
    console.log("Could not fetch orders through any method. Returning empty array.");
    return [];
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
