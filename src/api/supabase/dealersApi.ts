
import { supabase } from './client';
import { Dealer } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => {
    console.log("Fetching all dealers from Supabase");
    
    const { data, error } = await supabase
      .from('dealers')
      .select('*')
      .order('companyname', { ascending: true });
    
    if (error) {
      console.error('Errore nel recupero dei dealer:', error);
      throw error;
    }
    
    // Add console logs to check what data is coming from Supabase
    console.log('Raw dealers data from Supabase:', data);
    
    const formattedDealers = data.map(dealer => ({
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
      creditLimit: dealer.credit_limit,
      nuovoPlafond: dealer.nuovo_plafond // Make sure this is correctly mapped
    })) as Dealer[];
    
    console.log('Mapped dealers with nuovo_plafond:', formattedDealers.map(d => ({
      id: d.id,
      companyName: d.companyName,
      nuovoPlafond: d.nuovoPlafond,
      creditLimit: d.creditLimit
    })));
    
    // Fetch all orders for each dealer (especially important for delivered ones)
    for (const dealer of formattedDealers) {
      try {
        console.log(`Fetching orders for dealer ${dealer.id} (${dealer.companyName})`);
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, vehicles(*)')
          .eq('dealerid', dealer.id);
          
        if (!ordersError && ordersData) {
          dealer.orders = ordersData.map(order => ({
            id: order.id,
            vehicleId: order.vehicleid,
            dealerId: order.dealerid,
            customerName: order.customername,
            status: order.status,
            orderDate: order.orderdate,
            deliveryDate: order.deliverydate,
            vehicle: order.vehicles
          }));
          
          console.log(`Found ${dealer.orders.length} orders for dealer ${dealer.companyName}`);
          console.log(`Delivered orders: ${dealer.orders.filter(o => o.status === 'delivered').length}`);
        }
      } catch (err) {
        console.error(`Error fetching orders for dealer ${dealer.id}:`, err);
      }
    }
    
    return formattedDealers;
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
    
    console.log('Raw dealer data by ID from Supabase:', data);
    
    const formattedDealer = {
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
      creditLimit: data.credit_limit,
      nuovoPlafond: data.nuovo_plafond // Make sure this field is correctly mapped
    } as Dealer;
    
    console.log('Mapped dealer with nuovo_plafond:', {
      id: formattedDealer.id,
      companyName: formattedDealer.companyName,
      nuovoPlafond: formattedDealer.nuovoPlafond,
      creditLimit: formattedDealer.creditLimit
    });
    
    // Fetch all orders for this dealer to calculate plafond correctly
    try {
      console.log(`Fetching orders for dealer ${id} (${formattedDealer.companyName})`);
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, vehicles(*)')
        .eq('dealerid', id);
        
      if (!ordersError && ordersData) {
        formattedDealer.orders = ordersData.map(order => ({
          id: order.id,
          vehicleId: order.vehicleid,
          dealerId: order.dealerid,
          customerName: order.customername,
          status: order.status,
          orderDate: order.orderdate,
          deliveryDate: order.deliverydate,
          vehicle: order.vehicles
        }));
        
        console.log(`Found ${formattedDealer.orders.length} orders for dealer ${formattedDealer.companyName}`);
        console.log(`Delivered orders: ${formattedDealer.orders.filter(o => o.status === 'delivered').length}`);
      }
    } catch (err) {
      console.error(`Error fetching orders for dealer ${id}:`, err);
    }
    
    return formattedDealer;
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
    
    const formattedDealer = {
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
      creditLimit: data.credit_limit,
      orders: []
    } as Dealer;
    
    return formattedDealer;
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
