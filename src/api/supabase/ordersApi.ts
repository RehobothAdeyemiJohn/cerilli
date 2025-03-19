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
    vehicleId: order.vehicleid,
    dealerId: order.dealerid,
    customerName: order.customername,
    status: order.status,
    orderDate: order.orderdate,
    deliveryDate: order.deliverydate,
    progressiveNumber: order.progressive_number,
    price: order.price,
    contractId: order.contract_id,
    dealerName: order.dealer_name,
    modelName: order.model_name,
    orderNumber: order.order_number,
    plafondDealer: order.plafond_dealer,
    vehicle: order.vehicles ? mapVehicleDbToFrontend(order.vehicles) : null,
    dealer: order.dealers ? mapDealerDbToFrontend(order.dealers) : null
  };
};

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    console.log("Fetching all orders from Supabase");
    
    // First approach: most straightforward direct query with minimal logging
    try {
      console.log("Attempting simple orders query...");
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      
      if (error) {
        console.error('Error with simple orders query:', error);
      } else {
        console.log(`Found ${data?.length || 0} orders with simple query`);
        
        if (data && data.length > 0) {
          // If we have orders but without relation data, fetch relations manually
          const ordersWithRelations = await Promise.all(
            data.map(async (order) => {
              let vehicleData = null;
              let dealerData = null;
              
              // Try to fetch the vehicle
              if (order.vehicleid) {
                try {
                  const { data: vehicle } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('id', order.vehicleid)
                    .maybeSingle();
                  
                  vehicleData = vehicle;
                } catch (e) {
                  console.error(`Error fetching vehicle for order ${order.id}:`, e);
                }
              }
              
              // Try to fetch the dealer
              if (order.dealerid) {
                try {
                  const { data: dealer } = await supabase
                    .from('dealers')
                    .select('*')
                    .eq('id', order.dealerid)
                    .maybeSingle();
                  
                  dealerData = dealer;
                } catch (e) {
                  console.error(`Error fetching dealer for order ${order.id}:`, e);
                }
              }
              
              // Return the order with manually fetched relations
              return {
                ...order,
                vehicles: vehicleData,
                dealers: dealerData
              };
            })
          );
          
          console.log("Successfully built orders with relations manually");
          
          // Map to frontend format
          const formattedOrders = ordersWithRelations.map(mapOrderDbToFrontend);
          console.log("Returning formatted orders:", formattedOrders);
          return formattedOrders;
        }
      }
    } catch (e) {
      console.error("Error with direct query approach:", e);
    }
    
    // Second approach: Try with explicit join
    try {
      console.log("Attempting orders query with explicit joins...");
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vehicles:vehicleid (*),
          dealers:dealerid (*)
        `);
      
      if (error) {
        console.error('Error with joined query:', error);
      } else {
        console.log(`Found ${data?.length || 0} orders with join query`);
        
        if (data && data.length > 0) {
          // Map the orders from the joined query
          const formattedOrders = data.map(mapOrderDbToFrontend);
          console.log("Returning formatted orders from join:", formattedOrders);
          return formattedOrders;
        }
      }
    } catch (e) {
      console.error("Error with join query approach:", e);
    }
    
    // Third approach: Alternative join syntax
    try {
      console.log("Attempting alternative join syntax...");
      const { data, error } = await supabase
        .from('orders')
        .select('*, vehicles(*), dealers(*)');
      
      if (error) {
        console.error('Error with alternative join syntax:', error);
      } else {
        console.log(`Found ${data?.length || 0} orders with alternative join`);
        
        if (data && data.length > 0) {
          const formattedOrders = data.map(mapOrderDbToFrontend);
          console.log("Returning formatted orders from alternative join:", formattedOrders);
          return formattedOrders;
        }
      }
    } catch (e) {
      console.error("Error with alternative join approach:", e);
    }

    // Last resort: Check if there's any data in the table with minimal fields
    try {
      console.log("Last attempt: checking orders table with minimal fields...");
      const { data, error } = await supabase
        .from('orders')
        .select('id, customername')
        .limit(10);
      
      if (error) {
        console.error('Error with minimal fields query:', error);
      } else {
        console.log(`Found ${data?.length || 0} orders with minimal fields query:`, data);
        
        if (data && data.length > 0) {
          console.log("Orders exist but couldn't be properly fetched with relations");
          
          // Try to fetch full data for each order individually
          const ordersWithData = await Promise.all(
            data.map(async (orderMinimal) => {
              try {
                const { data: fullOrder } = await supabase
                  .from('orders')
                  .select('*')
                  .eq('id', orderMinimal.id)
                  .maybeSingle();
                
                if (!fullOrder) return null;
                
                let vehicleData = null;
                let dealerData = null;
                
                // Try to fetch the vehicle
                if (fullOrder.vehicleid) {
                  const { data: vehicle } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('id', fullOrder.vehicleid)
                    .maybeSingle();
                  
                  vehicleData = vehicle;
                }
                
                // Try to fetch the dealer
                if (fullOrder.dealerid) {
                  const { data: dealer } = await supabase
                    .from('dealers')
                    .select('*')
                    .eq('id', fullOrder.dealerid)
                    .maybeSingle();
                  
                  dealerData = dealer;
                }
                
                return {
                  ...fullOrder,
                  vehicles: vehicleData,
                  dealers: dealerData
                };
              } catch (e) {
                console.error(`Error fetching full data for order ${orderMinimal.id}:`, e);
                return null;
              }
            })
          );
          
          // Filter out any null results and map to frontend format
          const validOrders = ordersWithData.filter(order => order !== null);
          const formattedOrders = validOrders.map(order => mapOrderDbToFrontend(order!));
          
          console.log("Returning formatted orders from individual fetches:", formattedOrders);
          return formattedOrders;
        }
      }
    } catch (e) {
      console.error("Error with minimal fields approach:", e);
    }
    
    console.log("No orders could be fetched through any method. Returning empty array.");
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
      vehicleid: order.vehicleId,
      dealerid: order.dealerId,
      customername: order.customerName,
      status: order.status,
      orderdate: order.orderDate || new Date().toISOString(),
      deliverydate: order.deliveryDate,
      price: order.price || 0,
      contract_id: order.contractId,
      dealer_name: dealerName || order.dealerName || order.customerName,
      model_name: modelName || order.modelName,
      order_number: order.orderNumber,
      plafond_dealer: dealerPlafond
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
      
      // Since RPC doesn't support the new columns, update the order with the additional data
      if (rpcData) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            dealer_name: newOrder.dealer_name,
            model_name: newOrder.model_name,
            order_number: newOrder.order_number,
            plafond_dealer: newOrder.plafond_dealer
          })
          .eq('id', rpcData);
          
        if (updateError) {
          console.error('Error updating order with additional fields:', updateError);
        }
      }
      
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
      contract_id: updates.contractId,
      dealer_name: updates.dealerName,
      model_name: updates.modelName,
      order_number: updates.orderNumber,
      plafond_dealer: updates.plafondDealer
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
