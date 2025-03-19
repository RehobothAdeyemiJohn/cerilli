
import { DealerContract } from '@/types';
import { supabase } from './client';

export const dealerContractsApi = {
  getAll: async (): Promise<DealerContract[]> => {
    const { data, error } = await supabase
      .from('dealer_contracts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching dealer contracts:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getById: async (id: string): Promise<DealerContract> => {
    const { data, error } = await supabase
      .from('dealer_contracts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching dealer contract:', error);
      throw error;
    }
    
    return data;
  },
  
  create: async (contractData: Omit<DealerContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<DealerContract> => {
    const { data, error } = await supabase
      .from('dealer_contracts')
      .insert(contractData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating dealer contract:', error);
      throw error;
    }
    
    return data;
  },
  
  update: async (id: string, updates: Partial<DealerContract>): Promise<DealerContract> => {
    const { data, error } = await supabase
      .from('dealer_contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating dealer contract:', error);
      throw error;
    }
    
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('dealer_contracts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting dealer contract:', error);
      throw error;
    }
  }
};
