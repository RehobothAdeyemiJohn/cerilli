
import { DealerContract, Order } from '@/types';
import { supabase } from './client';
import { generateUUID } from '@/lib/utils';

const getAll = async (): Promise<DealerContract[]> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .select('*, vehicle:car_id(*), dealer:dealer_id(*)');
  
  if (error) throw error;
  return data as DealerContract[];
};

const getById = async (id: string): Promise<DealerContract> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .select('*, vehicle:car_id(*), dealer:dealer_id(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as DealerContract;
};

const create = async (contractData: Omit<DealerContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<DealerContract> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .insert([{
      ...contractData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as DealerContract;
};

const createFromOrder = async (order: Order, contractDetails: any): Promise<DealerContract> => {
  // Create contract from order data
  const contractData: Omit<DealerContract, 'id' | 'createdAt' | 'updatedAt'> = {
    dealer_id: order.dealerId,
    car_id: order.vehicleId,
    contract_date: new Date().toISOString(),
    status: 'attivo',
    contract_details: {
      ...contractDetails,
      orderRef: order.id,
      customerName: order.customerName,
    }
  };
  
  return create(contractData);
};

const update = async (id: string, updates: Partial<DealerContract>): Promise<DealerContract> => {
  const { data, error } = await supabase
    .from('dealer_contracts')
    .update({
      ...updates,
      updatedAt: new Date().toISOString()
    })
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
  createFromOrder,
  update,
  delete: remove
};
