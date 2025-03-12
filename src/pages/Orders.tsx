
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase/ordersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { Order, Vehicle } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';

const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  
  // Fetch all orders from Supabase
  const { 
    data: ordersData = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    staleTime: 0, // Set to 0 to always consider data stale
  });
  
  // Filter orders by status
  const processingOrders = ordersData.filter(o => o.status === 'processing');
  const deliveredOrders = ordersData.filter(o => o.status === 'delivered');
  const cancelledOrders = ordersData.filter(o => o.status === 'cancelled');
  
  // Mutation for marking an order as delivered
  const markAsDeliveredMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        // 1. Get current order
        const order = await ordersApi.getById(orderId);
        
        // 2. Update vehicle status to 'dealer-stock'
        if (order.vehicle && order.dealerId) {
          await vehiclesApi.update(order.vehicleId, {
            status: 'delivered',
            location: 'Stock Dealer'
          });
        }
        
        // 3. Update order with delivered status
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
      queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Ordine consegnato",
        description: "L'ordine è stato marcato come consegnato con successo",
      });
    },
    onError: (error) => {
      console.error('Error marking order as delivered:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'ordine",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for cancelling an order
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Get current order first
      const order = await ordersApi.getById(orderId);
      // Update with cancelled status
      return ordersApi.update(orderId, {
        ...order,
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
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
  
  // Mutation for deleting an order
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.delete(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
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
  
  const handleMarkAsDelivered = (orderId: string) => {
    markAsDeliveredMutation.mutate(orderId);
  };
  
  const handleCancelOrder = (orderId: string) => {
    cancelOrderMutation.mutate(orderId);
  };
  
  const handleDeleteOrder = () => {
    if (selectedOrderId) {
      deleteOrderMutation.mutate(selectedOrderId);
      setSelectedOrderId(null);
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Create a function to generate order numbers - simple index + 1
  const getOrderNumber = (index: number): string => {
    return `#${(index + 1).toString().padStart(3, '0')}`;
  };
  
  const renderOrderTable = (filteredOrders: Order[], tabName: string) => (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Ordine</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veicolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Data Ordine</TableHead>
              <TableHead>Data Consegna</TableHead>
              {!isDealer && <TableHead>Azioni</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isDealer ? 6 : 7} className="text-center py-10">
                  Caricamento ordini...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={isDealer ? 6 : 7} className="text-center py-10 text-red-500">
                  Errore durante il caricamento degli ordini.
                </TableCell>
              </TableRow>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => {
                const vehicleInfo = order.vehicle ? 
                  `${order.vehicle.model} ${order.vehicle.trim || ''}` : 
                  'Veicolo non disponibile';
                
                // Calculate order number based on the tab and index
                const orderNumber = getOrderNumber(
                  tabName === 'all' ? index : 
                  tabName === 'processing' ? processingOrders.indexOf(order) :
                  tabName === 'delivered' ? deliveredOrders.indexOf(order) :
                  cancelledOrders.indexOf(order)
                );
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{vehicleInfo}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                        {order.status === 'processing' ? 'In Lavorazione' : 
                         order.status === 'delivered' ? 'Consegnato' : 
                         order.status === 'cancelled' ? 'Cancellato' : order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
                    </TableCell>
                    
                    {!isDealer && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                          >
                            Visualizza
                          </Button>
                          
                          {order.status === 'processing' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
                                onClick={() => handleMarkAsDelivered(order.id)}
                                disabled={markAsDeliveredMutation.isPending}
                              >
                                Consegnato
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancelOrderMutation.isPending}
                              >
                                Cancella
                              </Button>
                            </>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 bg-gray-100 hover:bg-gray-200"
                                onClick={() => setSelectedOrderId(order.id)}
                              >
                                Elimina
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata. L'ordine verrà eliminato permanentemente dal database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDeleteOrder}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={deleteOrderMutation.isPending}
                                >
                                  {deleteOrderMutation.isPending ? 'Eliminazione...' : 'Elimina'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={isDealer ? 6 : 7} className="text-center py-10 text-gray-500">
                  Nessun ordine trovato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Ordini</h1>
      </div>
      
      <Tabs defaultValue="processing">
        <TabsList className="mb-6">
          <TabsTrigger value="processing">
            In Lavorazione ({processingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Consegnati ({deliveredOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancellati ({cancelledOrders.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Tutti gli Ordini ({ordersData.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="processing">
          {renderOrderTable(processingOrders, 'processing')}
        </TabsContent>
        
        <TabsContent value="delivered">
          {renderOrderTable(deliveredOrders, 'delivered')}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {renderOrderTable(cancelledOrders, 'cancelled')}
        </TabsContent>
        
        <TabsContent value="all">
          {renderOrderTable(ordersData, 'all')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Orders;
