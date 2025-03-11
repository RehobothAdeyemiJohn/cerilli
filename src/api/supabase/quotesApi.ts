
import { Quote } from '@/types';
import { supabase } from './client';

export const quotesApi = {
  getAll: async (): Promise<Quote[]> => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Errore nel recupero dei preventivi:', error);
      throw error;
    }

    return data as Quote[];
  },

  getById: async (id: string): Promise<Quote> => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore nel recupero del preventivo:', error);
      throw error;
    }

    return data as Quote;
  },

  create: async (quote: Omit<Quote, 'id'>): Promise<Quote> => {
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        ...quote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Errore nella creazione del preventivo:', error);
      throw error;
    }

    return data as Quote;
  },

  update: async (id: string, updates: Partial<Quote>): Promise<Quote> => {
    const { data, error } = await supabase
      .from('quotes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiornamento del preventivo:', error);
      throw error;
    }

    return data as Quote;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Errore nell\'eliminazione del preventivo:', error);
      throw error;
    }
  }
};
