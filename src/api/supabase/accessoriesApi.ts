
import { Accessory } from '@/types';
import { supabase } from './client';

const getAll = async (): Promise<Accessory[]> => {
  const { data, error } = await supabase
    .from('accessories')
    .select('*');
  
  if (error) throw error;
  return data as Accessory[];
};

const getById = async (id: string): Promise<Accessory> => {
  const { data, error } = await supabase
    .from('accessories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Accessory;
};

const getCompatible = async (modelId: string, trimId: string): Promise<Accessory[]> => {
  const { data, error } = await supabase
    .from('accessories')
    .select('*')
    .filter('compatibleModels', 'cs', `{${modelId}}`);
  
  if (error) throw error;
  
  // Further filter by trim compatibility if needed
  if (trimId) {
    return (data as Accessory[]).filter(accessory => 
      accessory.compatibleTrims.length === 0 || 
      accessory.compatibleTrims.includes(trimId)
    );
  }
  
  return data as Accessory[];
};

const create = async (accessory: Omit<Accessory, 'id'>): Promise<Accessory> => {
  const { data, error } = await supabase
    .from('accessories')
    .insert([accessory])
    .select()
    .single();
  
  if (error) throw error;
  return data as Accessory;
};

const update = async (id: string, updates: Partial<Accessory>): Promise<Accessory> => {
  const { data, error } = await supabase
    .from('accessories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Accessory;
};

const remove = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('accessories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

export const accessoriesApi = {
  getAll,
  getById,
  getCompatible,
  create,
  update,
  delete: remove
};
