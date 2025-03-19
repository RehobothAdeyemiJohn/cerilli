
import { supabase } from './client';
import { DealerContract, Order } from '@/types';
import { generateUUID } from '@/lib/utils';

const getAll = async (): Promise<DealerContract[]> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .select(`
      *,
      vehicle:car_id(*),
      dealer:dealer_id(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as DealerContract[];
};

const getById = async (id: string): Promise<DealerContract> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .select(`
      *,
      vehicle:car_id(*),
      dealer:dealer_id(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as DealerContract;
};

const create = async (contractData: Omit<DealerContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<DealerContract> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .insert([contractData])
    .select()
    .single();
  
  if (error) throw error;
  return data as DealerContract;
};

// Add the missing createFromOrder method
const createFromOrder = async (order: Order): Promise<DealerContract> => {
  if (!order.id || !order.dealerId || !order.vehicleId) {
    throw new Error('Order must have id, dealerId, and vehicleId');
  }

  const contractData = {
    dealer_id: order.dealerId,
    car_id: order.vehicleId,
    contract_date: new Date().toISOString(),
    status: 'active',
    contract_details: {
      orderId: order.id,
      customerName: order.customerName,
      price: order.price || 0
    }
  };

  const { data, error } = await supabase
    .from('dealer_contracts')
    .insert([contractData])
    .select()
    .single();
  
  if (error) throw error;
  return data as DealerContract;
};

const update = async (id: string, updates: Partial<DealerContract>): Promise<DealerContract> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as DealerContract;
};

const remove = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('dealer_contracts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

export const dealerContractsApi = {
  getAll,
  getById,
  create,
  createFromOrder, // Add the new method to the export
  update,
  delete: remove
};
