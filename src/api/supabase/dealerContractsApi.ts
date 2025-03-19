
import { DealerContract } from '@/types';
import { supabase } from './client';
import { ordersApi } from './ordersApi';

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
  
  createFromOrder: async (orderId: string, contractDetails: any): Promise<DealerContract> => {
    try {
      // Get the order details first
      const order = await ordersApi.getById(orderId);
      
      // Create a contract using the order data
      const contractData = {
        dealer_id: order.dealerId,
        car_id: order.vehicleId,
        contract_date: new Date().toISOString(),
        status: 'attivo',
        contract_details: {
          ...contractDetails,
          orderId: order.id,
          customerName: order.customerName,
          finalPrice: order.price,
          createdAt: new Date().toISOString()
        }
      };
      
      // Create the contract
      const { data, error } = await supabase
        .from('dealer_contracts')
        .insert(contractData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating dealer contract from order:', error);
        throw error;
      }
      
      // Update the order to mark it as associated with a contract
      await ordersApi.update(orderId, {
        status: 'delivered'
      });
      
      return data;
    } catch (error) {
      console.error('Error in createFromOrder:', error);
      throw error;
    }
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
