
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './client';
import { Dealer } from '@/types';
import { dealers as mockDealers } from '@/data/mockData';

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => {
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .order('companyName');

    if (error) {
      console.error('Errore nel recupero dei dealer:', error);
      throw error;
    }

    return data as Dealer[];
  },
  
  getById: async (id: string): Promise<Dealer> => {
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore nel recupero del dealer:', error);
      throw error;
    }

    return data as Dealer;
  },
  
  create: async (dealer: Omit<Dealer, 'id'>): Promise<Dealer> => {
    const newDealer = {
      ...dealer,
      id: uuidv4(),
      isActive: dealer.isActive !== undefined ? dealer.isActive : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('dealers')
      .insert(newDealer)
      .select()
      .single();

    if (error) {
      console.error('Errore nella creazione del dealer:', error);
      throw error;
    }
    
    return data as Dealer;
  },
  
  update: async (id: string, updates: Partial<Dealer>): Promise<Dealer> => {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('dealers')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiornamento del dealer:', error);
      throw error;
    }
    
    return data as Dealer;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('dealers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Errore nell\'eliminazione del dealer:', error);
      throw error;
    }
  },

  // Funzione per migrare i dati dal mock a Supabase
  migrateFromMockData: async (): Promise<void> => {
    try {
      // Check if we already have dealers in Supabase to avoid duplicates
      const { data: existingDealers } = await supabase
        .from('dealers')
        .select('id');
      
      if (existingDealers && existingDealers.length > 0) {
        console.log('Dealer già presenti in Supabase, migrazione saltata');
        return;
      }
      
      // Prepare dealers for insertion
      const dealersToInsert = mockDealers.map(dealer => ({
        ...dealer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Insert all dealers in a single batch
      if (dealersToInsert.length > 0) {
        const { error } = await supabase
          .from('dealers')
          .insert(dealersToInsert);
        
        if (error) {
          console.error('Errore durante la migrazione dei dealer:', error);
          throw error;
        }
        
        console.log(`${dealersToInsert.length} dealer migrati con successo`);
      } else {
        console.log('Nessun dealer da migrare');
      }
    } catch (error) {
      console.error('Errore durante la migrazione dei dealer:', error);
      throw error;
    }
  }
};
