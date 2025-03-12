
import { supabase } from './client';
import { Dealer } from '@/types';

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => {
    // Use companyname, not companyName - the Supabase column name is lowercase
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .order('companyname', { ascending: true });
    
    if (error) {
      console.error('Errore nel recupero dei dealer:', error);
      throw error;
    }
    
    // Map the Supabase column names to our frontend model property names
    return data.map(dealer => ({
      id: dealer.id,
      companyName: dealer.companyname, // Map from DB companyname to frontend companyName
      address: dealer.address,
      city: dealer.city,
      province: dealer.province,
      zipCode: dealer.zipcode, // Map from DB zipcode to frontend zipCode
      email: dealer.email,
      password: dealer.password,
      contactName: dealer.contactname, // Map from DB contactname to frontend contactName
      createdAt: dealer.created_at,
      isActive: dealer.isactive
    })) as Dealer[];
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
    
    return {
      id: data.id,
      companyName: data.companyname,
      address: data.address,
      city: data.city,
      province: data.province,
      zipCode: data.zipcode,
      email: data.email,
      password: data.password,
      contactName: data.contactname,
      createdAt: data.created_at,
      isActive: data.isactive
    } as Dealer;
  },

  create: async (dealer: Omit<Dealer, 'id' | 'createdAt'>): Promise<Dealer> => {
    // Map from frontend model property names to DB column names
    const { data, error } = await supabase
      .from('dealers')
      .insert({
        companyname: dealer.companyName,
        address: dealer.address,
        city: dealer.city,
        province: dealer.province,
        zipcode: dealer.zipCode,
        email: dealer.email,
        password: dealer.password,
        contactname: dealer.contactName,
        isactive: dealer.isActive
      })
      .select()
      .single();
    
    if (error) {
      console.error('Errore nella creazione del dealer:', error);
      throw error;
    }
    
    return {
      id: data.id,
      companyName: data.companyname,
      address: data.address,
      city: data.city,
      province: data.province,
      zipCode: data.zipcode,
      email: data.email,
      password: data.password,
      contactName: data.contactname,
      createdAt: data.created_at,
      isActive: data.isactive
    } as Dealer;
  },
  
  update: async (dealer: Dealer): Promise<void> => {
    const { error } = await supabase
      .from('dealers')
      .update({
        companyname: dealer.companyName,
        address: dealer.address,
        city: dealer.city,
        province: dealer.province,
        zipcode: dealer.zipCode,
        email: dealer.email,
        password: dealer.password,
        contactname: dealer.contactName,
        isactive: dealer.isActive
      })
      .eq('id', dealer.id);
    
    if (error) {
      console.error('Errore nell\'aggiornamento del dealer:', error);
      throw error;
    }
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

  toggleStatus: async (id: string, isActive: boolean): Promise<void> => {
    const { error } = await supabase
      .from('dealers')
      .update({ isactive: isActive })
      .eq('id', id);
    
    if (error) {
      console.error('Errore nel cambiamento di stato del dealer:', error);
      throw error;
    }
  }
};
