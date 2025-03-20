
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/apiClient';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useOrdersActions = (refreshAllOrderData: () => void) => {
  const queryClient = useQueryClient();

  const markAsDeliveredMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const order = await ordersApi.getById(orderId);
        
        // Check if ODL is generated before allowing delivery
        if (!order.odlGenerated) {
          throw new Error("È necessario generare l'ODL prima di poter consegnare l'ordine");
        }
        
        // Update vehicle status if exists
        if (order.vehicleId && order.dealerId) {
          await vehiclesApi.update(order.vehicleId, {
            status: 'delivered',
            location: 'Stock Dealer'
          });
        }
        
        return ordersApi.update(orderId, {
          ...order,
          status: 'delivered',
          deliveryDate: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error in mark as delivered process:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      refreshAllOrderData();
      toast({
        title: "Ordine consegnato",
        description: "L'ordine è stato marcato come consegnato con successo",
      });
    },
    onError: (error: any) => {
      console.error('Error marking order as delivered:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento dell'ordine",
        variant: "destructive"
      });
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const order = await ordersApi.getById(orderId);
      return ordersApi.update(orderId, {
        ...order,
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      refreshAllOrderData();
      toast({
        title: "Ordine cancellato",
        description: "L'ordine è stato cancellato con successo",
      });
    },
    onError: (error) => {
      console.error('Error cancelling order:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la cancellazione dell'ordine",
        variant: "destructive"
      });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.delete(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      refreshAllOrderData();
      toast({
        title: "Ordine eliminato",
        description: "L'ordine è stato eliminato definitivamente",
      });
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'ordine",
        variant: "destructive"
      });
    }
  });

  const generateODLMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.generateODL(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      refreshAllOrderData();
      toast({
        title: "ODL generato",
        description: "L'ODL è stato generato con successo per questo ordine",
      });
    },
    onError: (error) => {
      console.error('Error generating ODL:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione dell'ODL",
        variant: "destructive"
      });
    }
  });

  // Aggiungiamo una nuova mutation per trasformare un veicolo in ordine
  const transformVehicleToOrderMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      console.log("Starting transformation of vehicle to order:", vehicleId);
      try {
        // 1. Recupera i dati del veicolo
        const vehicle = await vehiclesApi.getById(vehicleId);
        
        if (!vehicle || !vehicle.id) {
          throw new Error("Veicolo non trovato");
        }
        
        if (vehicle.status !== 'reserved') {
          throw new Error("Solo i veicoli con stato 'reserved' possono essere trasformati in ordini");
        }
        
        // 2. Aggiorna lo stato del veicolo a 'ordered'
        await vehiclesApi.update(vehicle.id, {
          status: 'ordered',
          updated_at: new Date().toISOString()
        });
        
        // 3. Trova il dealer ID se disponibile
        let dealerId = '00000000-0000-0000-0000-000000000000'; // ID di default se non c'è dealer
        let dealerPlafond = null;
        
        if (vehicle.reservedBy) {
          // Cerca il dealer per nome
          const { data: dealerData, error: dealerError } = await supabase
            .from('dealers')
            .select('*')
            .eq('companyname', vehicle.reservedBy)
            .maybeSingle();
          
          if (!dealerError && dealerData) {
            dealerId = dealerData.id;
            dealerPlafond = dealerData.nuovo_plafond || dealerData.credit_limit || 0;
            console.log("Found dealer ID for reservation:", dealerId, "with plafond:", dealerPlafond);
          } else {
            console.log("Could not find dealer ID for name:", vehicle.reservedBy);
          }
        }
        
        // 4. Crea l'ordine usando le esatte colonne del database
        const orderRecord = {
          vehicleid: vehicle.id,
          dealerid: dealerId,
          customername: vehicle.reservedBy || 'Cliente sconosciuto',
          status: 'processing',
          orderdate: new Date().toISOString(),
          model_name: vehicle.model,
          price: vehicle.price || 0,
          plafond_dealer: dealerPlafond,
          is_licensable: false,
          has_proforma: false,
          is_paid: false,
          is_invoiced: false,
          has_conformity: false, 
          odl_generated: false,
          transport_costs: 0,
          restoration_costs: 0
        };
        
        console.log("Creating order with data:", orderRecord);
        
        // 5. Inserisci l'ordine nel database
        const { data, error } = await supabase
          .from('orders')
          .insert(orderRecord)
          .select()
          .single();
        
        if (error) {
          console.error("Error creating order:", error);
          throw error;
        }
        
        console.log("Order created successfully:", data);
        return data;
      } catch (error) {
        console.error("Error in transformVehicleToOrder:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Vehicle successfully transformed to order:", data);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      refreshAllOrderData();
      
      toast({
        title: "Veicolo trasformato in ordine",
        description: "Il veicolo è stato convertito in ordine con successo",
      });
    },
    onError: (error: any) => {
      console.error('Error transforming vehicle to order:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la trasformazione del veicolo in ordine",
        variant: "destructive"
      });
    }
  });

  return {
    markAsDeliveredMutation,
    cancelOrderMutation,
    deleteOrderMutation,
    generateODLMutation,
    transformVehicleToOrderMutation,
    handleMarkAsDelivered: (orderId: string) => markAsDeliveredMutation.mutate(orderId),
    handleCancelOrder: (orderId: string) => cancelOrderMutation.mutate(orderId),
    handleDeleteOrder: (orderId: string | null) => {
      if (orderId) {
        deleteOrderMutation.mutate(orderId);
      }
    },
    handleGenerateODL: (orderId: string) => generateODLMutation.mutate(orderId),
    handleTransformVehicleToOrder: (vehicleId: string) => transformVehicleToOrderMutation.mutate(vehicleId)
  };
};
