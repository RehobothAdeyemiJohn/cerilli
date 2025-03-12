import { supabase } from './client';
import { Quote } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';

export const quotesApi = {
  getAll: async (options?: { limit?: number; page?: number }): Promise<Quote[]> => {
    console.log("Supabase API: getAll - Recupero preventivi", options);
    
    // Setup pagination
    const limit = options?.limit || 50; // Default to 50 items per page
    const page = options?.page || 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('quotes')
      .select('*, vehicles(model, trim, imageurl, location)')
      .order('createdat', { ascending: false });
      
    // Add pagination if specified
    if (options?.limit) {
      query = query.range(from, to);
    }

    const { data, error } = await query;

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

    console.log("Supabase API: getAll - Dati preventivi recuperati:", formattedQuotes.length);
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
    console.log("Creating quote with data:", quote);
    
    // Map frontend field names to database column names
    const newQuote = {
      vehicleid: quote.vehicleId,
      dealerid: quote.dealerId,
      customername: quote.customerName,
      customeremail: quote.customerEmail || null,
      customerphone: quote.customerPhone || null,
      price: quote.price,
      discount: quote.discount || 0,
      finalprice: quote.finalPrice,
      status: quote.status || 'pending',
      createdat: quote.createdAt || new Date().toISOString(),
      notes: quote.notes || null,
      rejectionreason: quote.rejectionReason || null,
      manualentry: quote.manualEntry || false
    };
    
    console.log("Supabase API: create - Richiesta insert:", newQuote);
    
    const { data, error } = await supabase
      .from('quotes')
      .insert(newQuote)
      .select()
      .single();

    if (error) {
      console.error('Error creating quote:', error);
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
      rejectionReason: data.rejectionreason || '',
      manualEntry: data.manualentry || false
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
      rejectionreason: updates.rejectionReason,
      manualentry: updates.manualEntry
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
      console.error('Error updating quote:', error);
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
      rejectionReason: data.rejectionreason || '',
      manualEntry: data.manualentry || false
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
  },
  
  getCountByStatus: async (): Promise<Record<string, number>> => {
    console.log("Supabase API: getCountByStatus - Conteggio preventivi per stato");
    
    const statuses = ['pending', 'approved', 'rejected', 'converted'];
    const counts: Record<string, number> = {
      all: 0,
      pending: 0,
      approved: 0, 
      rejected: 0,
      converted: 0
    };
    
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Errore nel conteggio totale dei preventivi:', totalError);
      throw totalError;
    }
    
    counts.all = totalCount || 0;
    
    // Get counts by status
    for (const status of statuses) {
      const { count, error } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      if (error) {
        console.error(`Errore nel conteggio dei preventivi con stato ${status}:`, error);
        throw error;
      }
      
      counts[status] = count || 0;
    }
    
    console.log("Supabase API: getCountByStatus - Conteggi ottenuti:", counts);
    return counts;
  }
};
