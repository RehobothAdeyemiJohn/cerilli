
import { supabase } from './client';
import { Dealer } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => {
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .order('companyname', { ascending: true });
    
    if (error) {
      console.error('Errore nel recupero dei dealer:', error);
      throw error;
    }
    
    return data.map(dealer => ({
      id: dealer.id,
      companyName: dealer.companyname,
      address: dealer.address,
      city: dealer.city,
      province: dealer.province,
      zipCode: dealer.zipcode,
      email: dealer.email,
      password: dealer.password,
      contactName: dealer.contactname,
      createdAt: dealer.created_at,
      isActive: dealer.isactive,
      logo: dealer.logo,
      creditLimit: dealer.credit_limit
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
      isActive: data.isactive,
      logo: data.logo,
      creditLimit: data.credit_limit
    } as Dealer;
  },

  uploadLogo: async (file: File, dealerId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${dealerId}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Uploading logo:', filePath);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('dealer_logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Errore nel caricamento del logo:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL');

      const { data: { publicUrl } } = supabase.storage
        .from('dealer_logos')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadLogo function:', error);
      throw error;
    }
  },

  create: async (dealer: Omit<Dealer, 'id' | 'createdAt'>): Promise<Dealer> => {
    const newId = uuidv4();
    
    console.log('Creating dealer with data:', dealer);
    
    const { data, error } = await supabase
      .from('dealers')
      .insert({
        id: newId,
        companyname: dealer.companyName,
        address: dealer.address,
        city: dealer.city,
        province: dealer.province,
        zipcode: dealer.zipCode,
        email: dealer.email,
        password: dealer.password,
        contactname: dealer.contactName,
        isactive: dealer.isActive,
        logo: dealer.logo,
        credit_limit: dealer.creditLimit || 0
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
      isActive: data.isactive,
      logo: data.logo,
      creditLimit: data.credit_limit
    } as Dealer;
  },
  
  update: async (dealer: Dealer): Promise<void> => {
    console.log('Updating dealer with data:', dealer);
    
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
        isactive: dealer.isActive,
        logo: dealer.logo,
        credit_limit: dealer.creditLimit || 0
      })
      .eq('id', dealer.id);
    
    if (error) {
      console.error('Errore nell\'aggiornamento del dealer:', error);
      throw error;
    }
    
    console.log('Dealer updated successfully');
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
