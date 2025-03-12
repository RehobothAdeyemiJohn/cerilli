import { supabase } from './client';
import { Quote } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';

export const quotesApi = {
  getAll: async (): Promise<Quote[]> => {
    console.log("Supabase API: getAll - Recupero preventivi");
    const { data, error } = await supabase
      .from('quotes')
      .select('*, vehicles(model, trim, imageurl, location)')
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Errore nel recupero dei preventivi:', error);
      throw error;
    }

    // Format the data to match our frontend model
    const formattedQuotes = data.map(quote => ({
      id: quote.id,
      vehicleId: quote.vehicleid,
      dealerId: quote.dealerid,
      customerName: quote.customername,
      customerEmail: quote.customeremail || '',
      customerPhone: quote.customerphone || '',
      price: quote.price,
      discount: quote.discount,
      finalPrice: quote.finalprice,
      status: quote.status as Quote['status'],
      createdAt: quote.createdat,
      notes: quote.notes || '',
      rejectionReason: quote.rejectionreason || '',
      vehicleInfo: quote.vehicles ? {
        model: quote.vehicles.model,
        trim: quote.vehicles.trim || '',
        imageUrl: quote.vehicles.imageurl || '',
        location: quote.vehicles.location
      } : undefined
    }));

    console.log("Supabase API: getAll - Dati preventivi recuperati:", formattedQuotes);
    return formattedQuotes as Quote[];
  },
  
  getById: async (id: string): Promise<Quote> => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, vehicles(model, trim, imageurl, location)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Errore nel recupero del preventivo:', error);
      throw error;
    }

    // Format the data to match our frontend model
    const formattedQuote = {
      id: data.id,
      vehicleId: data.vehicleid,
      dealerId: data.dealerid,
      customerName: data.customername,
      customerEmail: data.customeremail || '',
      customerPhone: data.customerphone || '',
      price: data.price,
      discount: data.discount,
      finalPrice: data.finalprice,
      status: data.status as Quote['status'],
      createdAt: data.createdat,
      notes: data.notes || '',
      rejectionReason: data.rejectionreason || '',
      vehicleInfo: data.vehicles ? {
        model: data.vehicles.model,
        trim: data.vehicles.trim || '',
        imageUrl: data.vehicles.imageurl || '',
        location: data.vehicles.location
      } : undefined
    };

    console.log("Supabase API: getById - Preventivo recuperato:", formattedQuote);
    return formattedQuote as Quote;
  },
  
  create: async (quote: Omit<Quote, 'id'>): Promise<Quote> => {
    console.log("Supabase API: create - Creazione preventivo:", quote);
    
    // Generate a UUID for the quote instead of getting it from the dealer
    const quoteId = uuidv4();
    
    // Map frontend field names to database column names
    const newQuote = {
      id: quoteId,
      vehicleid: quote.vehicleId,
      dealerid: quote.dealerId, // Use the dealerId from the quote (which could be null)
      customername: quote.customerName,
      customeremail: quote.customerEmail || null,
      customerphone: quote.customerPhone || null,
      price: quote.price,
      discount: quote.discount || 0,
      finalprice: quote.finalPrice,
      status: quote.status || 'pending',
      createdat: quote.createdAt || new Date().toISOString(),
      notes: quote.notes || null,
      rejectionreason: quote.rejectionReason || null
    };
    
    console.log("Supabase API: create - Richiesta insert:", newQuote);
    
    const { data, error } = await supabase
      .from('quotes')
      .insert(newQuote)
      .select()
      .single();

    if (error) {
      console.error('Errore nella creazione del preventivo:', error);
      throw error;
    }
    
    console.log("Supabase API: create - Risposta:", data);
    
    // Convert database field names to match our frontend model
    const formattedQuote = {
      id: data.id,
      vehicleId: data.vehicleid,
      dealerId: data.dealerid,
      customerName: data.customername,
      customerEmail: data.customeremail || '',
      customerPhone: data.customerphone || '',
      price: data.price,
      discount: data.discount,
      finalPrice: data.finalprice,
      status: data.status as Quote['status'],
      createdAt: data.createdat,
      notes: data.notes || '',
      rejectionReason: data.rejectionreason || ''
    };
    
    return formattedQuote as Quote;
  },
  
  update: async (id: string, updates: Partial<Quote>): Promise<Quote> => {
    // Convert frontend field names to match database column names
    const dbUpdates: any = {
      vehicleid: updates.vehicleId,
      dealerid: updates.dealerId,
      customername: updates.customerName,
      customeremail: updates.customerEmail,
      customerphone: updates.customerPhone,
      price: updates.price,
      discount: updates.discount,
      finalprice: updates.finalPrice,
      status: updates.status,
      notes: updates.notes,
      rejectionreason: updates.rejectionReason
    };
    
    // Remove undefined fields
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    console.log("Supabase API: update - Richiesta update:", dbUpdates);
    
    const { data, error } = await supabase
      .from('quotes')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore nell\'aggiornamento del preventivo:', error);
      throw error;
    }
    
    console.log("Supabase API: update - Risposta:", data);
    
    // Convert database field names back to frontend model
    const formattedQuote = {
      id: data.id,
      vehicleId: data.vehicleid,
      dealerId: data.dealerid,
      customerName: data.customername,
      customerEmail: data.customeremail || '',
      customerPhone: data.customerphone || '',
      price: data.price,
      discount: data.discount,
      finalPrice: data.finalprice,
      status: data.status as Quote['status'],
      createdAt: data.createdat,
      notes: data.notes || '',
      rejectionReason: data.rejectionreason || ''
    };
    
    return formattedQuote as Quote;
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
