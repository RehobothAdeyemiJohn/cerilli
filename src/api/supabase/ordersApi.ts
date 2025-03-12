
import { Order } from '@/types';
import { supabase } from './client';

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    console.log("Fetching all orders from Supabase");
    const { data, error } = await supabase
      .from('orders')
      .select('*, vehicles(*), dealers(*)')
      .order('orderdate', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data as Order[];
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

    return data as Order;
  },

  create: async (order: Omit<Order, 'id'>): Promise<Order> => {
    console.log("Creating new order:", order);
    const { data, error } = await supabase
      .from('orders')
      .insert({
        vehicleid: order.vehicleId,
        dealerid: order.dealerId,
        customername: order.customerName,
        status: order.status,
        orderdate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*, vehicles(*), dealers(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error creating order:', error);
      throw error || new Error('Failed to create order');
    }

    return data as Order;
  },

  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    console.log("Updating order:", id, updates);
    const { data, error } = await supabase
      .from('orders')
      .update({
        vehicleid: updates.vehicleId,
        dealerid: updates.dealerId,
        customername: updates.customerName,
        status: updates.status,
        deliverydate: updates.deliveryDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, vehicles(*), dealers(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error updating order:', error);
      throw error || new Error('Order not found');
    }

    return data as Order;
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
  }
};
