
import { Order } from '@/types';
import { supabase } from './client';

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('orderDate', { ascending: false });

    if (error) {
      console.error('Errore nel recupero degli ordini:', error);
      throw error;
    }

    return data as Order[];
  },

  getById: async (id: string): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore nel recupero dell\'ordine:', error);
      throw error;
    }

    return data as Order;
  },

  create: async (order: Omit<Order, 'id'>): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Errore nella creazione dell\'ordine:', error);
      throw error;
    }

    return data as Order;
  },

  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiornamento dell\'ordine:', error);
      throw error;
    }

    return data as Order;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Errore nell\'eliminazione dell\'ordine:', error);
      throw error;
    }
  }
};
