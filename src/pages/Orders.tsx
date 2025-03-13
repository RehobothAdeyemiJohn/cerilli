import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase/ordersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { Order, OrderDetails, Vehicle } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrdersTable from '@/components/orders/OrdersTable';
import OrdersFilters from '@/components/orders/OrdersFilters';
import { useOrdersData } from '@/hooks/useOrdersData';
import { useQuery } from '@tanstack/react-query';

const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isAdmin = user?.type === 'admin';
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    isLicensable: null as boolean | null,
    hasProforma: null as boolean | null,
    isPaid: null as boolean | null,
    isInvoiced: null as boolean | null,
    hasConformity: null as boolean | null,
    dealerId: null as string | null,
    model: null as string | null,
  });

  const {
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrders,
    isLoading,
    error,
    refreshAllOrderData,
    setIsDetailsDialogOpen,
    ordersData,
  } = useOrdersData(filters);

  useEffect(() => {
    setIsDetailsDialogOpen(orderDetailsOpen);
  }, [orderDetailsOpen, setIsDetailsDialogOpen]);

  const { data: dealersData = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    staleTime: 0,
    enabled: isAdmin,
  });

  const markAsDeliveredMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const order = await ordersApi.getById(orderId);
        
        if (!order.details?.odlGenerated) {
          throw new Error("L'ODL deve essere generato prima di poter consegnare l'ordine");
        }
        
        if (order.vehicle && order.dealerId) {
          await vehiclesApi.update(order.vehicleId, {
            status: 'delivered' as Vehicle['status'],
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

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleGenerateODL = (details: OrderDetails) => {
    refreshAllOrderData();
  };

  const handleOrderDetailsSuccess = () => {
    console.log('Order details saved successfully, refreshing data');
    refreshAllOrderData();
  };

  const uniqueModels = React.useMemo(() => {
    const models = new Set<string>();
    ordersData.forEach(order => {
      if (order.vehicle?.model) {
        models.add(order.vehicle.model);
      }
    });
    return Array.from(models);
  }, [ordersData]);

  const updateFilter = (key: string, value: boolean | null | string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      isLicensable: null,
      hasProforma: null,
      isPaid: null,
      isInvoiced: null,
      hasConformity: null,
      dealerId: null,
      model: null,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== null).length;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Ordini</h1>
        
        <OrdersFilters
          isAdmin={isAdmin}
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          dealersData={dealersData}
          uniqueModels={uniqueModels}
          onRefresh={refreshAllOrderData}
        />
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
          <OrdersTable
            orders={processingOrders}
            isLoading={isLoading}
            error={error}
            isAdmin={isAdmin}
            showAdminColumns={isAdmin}
            tabName="processing"
            processingOrders={processingOrders}
            deliveredOrders={deliveredOrders}
            cancelledOrders={cancelledOrders}
            onViewDetails={handleViewOrderDetails}
            onMarkAsDelivered={handleMarkAsDelivered}
            onCancelOrder={handleCancelOrder}
            onDeleteClick={setSelectedOrderId}
            onDeleteConfirm={handleDeleteOrder}
            isDealer={isDealer}
            markAsDeliveredPending={markAsDeliveredMutation.isPending}
            cancelOrderPending={cancelOrderMutation.isPending}
            deleteOrderPending={deleteOrderMutation.isPending}
          />
        </TabsContent>
        
        <TabsContent value="delivered">
          <OrdersTable
            orders={deliveredOrders}
            isLoading={isLoading}
            error={error}
            isAdmin={isAdmin}
            showAdminColumns={isAdmin}
            tabName="delivered"
            processingOrders={processingOrders}
            deliveredOrders={deliveredOrders}
            cancelledOrders={cancelledOrders}
            onViewDetails={handleViewOrderDetails}
            onMarkAsDelivered={handleMarkAsDelivered}
            onCancelOrder={handleCancelOrder}
            onDeleteClick={setSelectedOrderId}
            onDeleteConfirm={handleDeleteOrder}
            isDealer={isDealer}
            markAsDeliveredPending={markAsDeliveredMutation.isPending}
            cancelOrderPending={cancelOrderMutation.isPending}
            deleteOrderPending={deleteOrderMutation.isPending}
          />
        </TabsContent>
        
        <TabsContent value="cancelled">
          <OrdersTable
            orders={cancelledOrders}
            isLoading={isLoading}
            error={error}
            isAdmin={isAdmin}
            showAdminColumns={isAdmin}
            tabName="cancelled"
            processingOrders={processingOrders}
            deliveredOrders={deliveredOrders}
            cancelledOrders={cancelledOrders}
            onViewDetails={handleViewOrderDetails}
            onMarkAsDelivered={handleMarkAsDelivered}
            onCancelOrder={handleCancelOrder}
            onDeleteClick={setSelectedOrderId}
            onDeleteConfirm={handleDeleteOrder}
            isDealer={isDealer}
            markAsDeliveredPending={markAsDeliveredMutation.isPending}
            cancelOrderPending={cancelOrderMutation.isPending}
            deleteOrderPending={deleteOrderMutation.isPending}
          />
        </TabsContent>
        
        <TabsContent value="all">
          <OrdersTable
            orders={allOrders}
            isLoading={isLoading}
            error={error}
            isAdmin={isAdmin}
            showAdminColumns={isAdmin}
            tabName="all"
            processingOrders={processingOrders}
            deliveredOrders={deliveredOrders}
            cancelledOrders={cancelledOrders}
            onViewDetails={handleViewOrderDetails}
            onMarkAsDelivered={handleMarkAsDelivered}
            onCancelOrder={handleCancelOrder}
            onDeleteClick={setSelectedOrderId}
            onDeleteConfirm={handleDeleteOrder}
            isDealer={isDealer}
            markAsDeliveredPending={markAsDeliveredMutation.isPending}
            cancelOrderPending={cancelOrderMutation.isPending}
            deleteOrderPending={deleteOrderMutation.isPending}
          />
        </TabsContent>
      </Tabs>
      
      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={orderDetailsOpen}
          onOpenChange={setOrderDetailsOpen}
          onSuccess={handleOrderDetailsSuccess}
          onGenerateODL={handleGenerateODL}
        />
      )}
    </div>
  );
};

export default Orders;
