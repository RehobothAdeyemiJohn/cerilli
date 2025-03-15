import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase/ordersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { OrderDetails } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useOrdersActions = (refreshAllOrderData: () => void) => {
  const queryClient = useQueryClient();

  const markAsDeliveredMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const order = await ordersApi.getById(orderId);
        
        console.log("Order details for delivery check:", order.details);
        
        // Instead of checking if details are malformed, just check if ODL is generated
        let odlGenerated = false;
        
        if (order.details) {
          // Try to extract the odlGenerated flag regardless of the structure
          const detailsObj = order.details as any; // Use any to bypass TypeScript checks
          
          if (typeof detailsObj === 'object') {
            // Case 1: direct property
            if ('odlGenerated' in detailsObj) {
              odlGenerated = Boolean(detailsObj.odlGenerated);
            } 
            // Case 2: property nested in value object
            else if (detailsObj.value && 
                    typeof detailsObj.value === 'object' && 
                    'odlGenerated' in detailsObj.value) {
              odlGenerated = Boolean(detailsObj.value.odlGenerated);
            }
          }
        }
        
        if (!odlGenerated) {
          console.log('Cannot deliver order - ODL not generated:', order.details);
          throw new Error("È necessario generare l'ODL prima di poter consegnare l'ordine");
        }
        
        if (order.vehicle && order.dealerId) {
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
      // Invalidate all related queries to ensure data is fresh
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

  const handleGenerateODL = (details: OrderDetails) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
    refreshAllOrderData();
  };

  return {
    markAsDeliveredMutation,
    cancelOrderMutation,
    deleteOrderMutation,
    handleMarkAsDelivered: (orderId: string) => markAsDeliveredMutation.mutate(orderId),
    handleCancelOrder: (orderId: string) => cancelOrderMutation.mutate(orderId),
    handleDeleteOrder: (orderId: string | null) => {
      if (orderId) {
        deleteOrderMutation.mutate(orderId);
      }
    },
    handleGenerateODL
  };
};
