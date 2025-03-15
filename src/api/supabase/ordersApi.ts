
import { Order } from '@/types';
import { supabase } from './client';

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    console.log("Fetching all orders from Supabase");
    
    // Get current user from localStorage since we can't use hooks in a regular function
    const userJson = localStorage.getItem('currentUser');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    
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

    // Format response to match expected Order interface
    const formattedOrders = data.map(order => ({
      id: order.id,
      vehicleId: order.vehicleid,
      dealerId: order.dealerid,
      customerName: order.customername,
      status: order.status,
      orderDate: order.orderdate,
      deliveryDate: order.deliverydate,
      progressiveNumber: order.progressive_number, // Add the progressive number from the database
      // Include related data
      vehicle: order.vehicles,
      dealer: order.dealers
    }));

    console.log("Orders fetched successfully:", formattedOrders);
    return formattedOrders as Order[];
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

    // Format response to match expected Order interface
    const formattedOrder = {
      id: data.id,
      vehicleId: data.vehicleid,
      dealerId: data.dealerid,
      customerName: data.customername,
      status: data.status,
      orderDate: data.orderdate,
      deliveryDate: data.deliverydate,
      // Include related data
      vehicle: data.vehicles,
      dealer: data.dealers
    };

    return formattedOrder as Order;
  },

  create: async (order: Omit<Order, 'id'>): Promise<Order> => {
    console.log("Creating new order in Supabase:", order);
    
    // Map frontend field names to database column names
    const newOrder = {
      vehicleid: order.vehicleId,
      dealerid: order.dealerId,
      customername: order.customerName,
      status: order.status,
      orderdate: order.orderDate,
      deliverydate: order.deliveryDate
    };
    
    console.log("Formatted order for Supabase insert:", newOrder);
    
    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select('*, vehicles(*), dealers(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error creating order:', error);
      throw error || new Error('Failed to create order');
    }
    
    console.log("Order created successfully:", data);
    
    // Format response to match expected Order interface
    const formattedOrder = {
      id: data.id,
      vehicleId: data.vehicleid,
      dealerId: data.dealerid,
      customerName: data.customername,
      status: data.status,
      orderDate: data.orderdate,
      deliveryDate: data.deliverydate,
      // Include related data
      vehicle: data.vehicles,
      dealer: data.dealers
    };

    return formattedOrder as Order;
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
      deliverydate: updates.deliveryDate
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
      .select('*, vehicles(*), dealers(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error updating order:', error);
      throw error || new Error('Order not found');
    }
    
    // Format response to match expected Order interface
    const formattedOrder = {
      id: data.id,
      vehicleId: data.vehicleid,
      dealerId: data.dealerid,
      customerName: data.customername,
      status: data.status,
      orderDate: data.orderdate,
      deliveryDate: data.deliverydate,
      // Include related data
      vehicle: data.vehicles,
      dealer: data.dealers
    };

    return formattedOrder as Order;
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
