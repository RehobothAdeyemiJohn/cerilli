
import { DealerContract } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const dealerContractsApi = {
  getAll: async (): Promise<DealerContract[]> => {
    console.log("Fetching all dealer contracts from Supabase");
    
    // Get current user from localStorage since we can't use hooks in a regular function
    const userJson = localStorage.getItem('currentUser');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    
    let query = supabase
      .from('dealer_contracts')
      .select('*, dealers(*), vehicles:car_id(*)') // Usiamo alias per il foreign key
      .order('contract_date', { ascending: false });
    
    // Se l'utente è un dealer, mostra solo i suoi contratti
    if (currentUser?.type === 'dealer') {
      console.log("Filtering contracts for dealer:", currentUser.dealerId);
      query = query.eq('dealer_id', currentUser.dealerId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching dealer contracts:', error);
      throw error;
    }

    // Formatta la risposta per rispettare l'interfaccia DealerContract
    const formattedContracts = data.map(contract => ({
      id: contract.id,
      dealerId: contract.dealer_id,
      carId: contract.car_id,
      contractDate: contract.contract_date,
      contractDetails: contract.contract_details,
      status: contract.status,
      createdAt: contract.created_at,
      updatedAt: contract.updated_at,
      dealer: contract.dealers,
      vehicle: contract.vehicles
    }));

    console.log("Dealer contracts fetched successfully:", formattedContracts);
    return formattedContracts as DealerContract[];
  },

  getById: async (id: string): Promise<DealerContract> => {
    console.log("Fetching dealer contract by ID:", id);
    const { data, error } = await supabase
      .from('dealer_contracts')
      .select('*, dealers(*), vehicles:car_id(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching dealer contract:', error);
      throw error || new Error('Dealer contract not found');
    }

    // Formatta la risposta per rispettare l'interfaccia DealerContract
    const formattedContract = {
      id: data.id,
      dealerId: data.dealer_id,
      carId: data.car_id,
      contractDate: data.contract_date,
      contractDetails: data.contract_details,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dealer: data.dealers,
      vehicle: data.vehicles
    };

    return formattedContract as DealerContract;
  },

  create: async (contract: Omit<DealerContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<DealerContract> => {
    console.log("Creating new dealer contract in Supabase:", contract);
    
    // Mappa i nomi dei campi frontend ai nomi delle colonne del database
    const newContract = {
      dealer_id: contract.dealerId,
      car_id: contract.carId,
      contract_date: contract.contractDate,
      contract_details: contract.contractDetails,
      status: contract.status
    };
    
    console.log("Formatted contract for Supabase insert:", newContract);
    
    const { data, error } = await supabase
      .from('dealer_contracts')
      .insert(newContract)
      .select('*, dealers(*), vehicles:car_id(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error creating dealer contract:', error);
      throw error || new Error('Failed to create dealer contract');
    }
    
    console.log("Dealer contract created successfully:", data);
    
    // Formatta la risposta per rispettare l'interfaccia DealerContract
    const formattedContract = {
      id: data.id,
      dealerId: data.dealer_id,
      carId: data.car_id,
      contractDate: data.contract_date,
      contractDetails: data.contract_details,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dealer: data.dealers,
      vehicle: data.vehicles
    };

    return formattedContract as DealerContract;
  },

  update: async (id: string, updates: Partial<DealerContract>): Promise<DealerContract> => {
    console.log("Updating dealer contract in Supabase:", id, updates);
    
    // Mappa i nomi dei campi frontend ai nomi delle colonne del database
    const dbUpdates = {
      dealer_id: updates.dealerId,
      car_id: updates.carId,
      contract_date: updates.contractDate,
      contract_details: updates.contractDetails,
      status: updates.status
    };
    
    // Rimuovi i campi undefined
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    const { data, error } = await supabase
      .from('dealer_contracts')
      .update(dbUpdates)
      .eq('id', id)
      .select('*, dealers(*), vehicles:car_id(*)')
      .maybeSingle();

    if (error || !data) {
      console.error('Error updating dealer contract:', error);
      throw error || new Error('Dealer contract not found');
    }
    
    // Formatta la risposta per rispettare l'interfaccia DealerContract
    const formattedContract = {
      id: data.id,
      dealerId: data.dealer_id,
      carId: data.car_id,
      contractDate: data.contract_date,
      contractDetails: data.contract_details,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dealer: data.dealers,
      vehicle: data.vehicles
    };

    return formattedContract as DealerContract;
  },

  delete: async (id: string): Promise<void> => {
    console.log("Deleting dealer contract from Supabase:", id);
    const { error } = await supabase
      .from('dealer_contracts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dealer contract:', error);
      throw error;
    }
    
    console.log("Dealer contract deleted successfully");
  },

  // Metodo per creare un contratto da un ordine
  createFromOrder: async (orderId: string, contractDetails?: any): Promise<DealerContract> => {
    console.log(`Creating contract from order ${orderId}`);
    
    // Ottieni i dettagli dell'ordine
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*, vehicles(*), dealers(*)')
      .eq('id', orderId)
      .maybeSingle();
      
    if (orderError || !orderData) {
      console.error('Error fetching order for contract creation:', orderError);
      throw orderError || new Error('Order not found');
    }
    
    // Crea il nuovo contratto
    const newContract = {
      dealer_id: orderData.dealerid,
      car_id: orderData.vehicleid,
      contract_date: new Date().toISOString(),
      contract_details: contractDetails || {},
      status: 'attivo'
    };
    
    // Inserisci il contratto
    const { data, error } = await supabase
      .from('dealer_contracts')
      .insert(newContract)
      .select('*, dealers(*), vehicles:car_id(*)')
      .maybeSingle();
      
    if (error || !data) {
      console.error('Error creating contract from order:', error);
      throw error || new Error('Failed to create contract from order');
    }
    
    // Aggiorna l'ordine con il riferimento al contratto
    const { error: updateError } = await supabase
      .from('orders')
      .update({ contract_id: data.id })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('Error updating order with contract reference:', updateError);
      // Non blocchiamo l'operazione se l'aggiornamento fallisce, ma logghiamo l'errore
    }
    
    // Formatta la risposta
    const formattedContract = {
      id: data.id,
      dealerId: data.dealer_id,
      carId: data.car_id,
      contractDate: data.contract_date,
      contractDetails: data.contract_details,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      dealer: data.dealers,
      vehicle: data.vehicles
    };
    
    return formattedContract as DealerContract;
  }
};
