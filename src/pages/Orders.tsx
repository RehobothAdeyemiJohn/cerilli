
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { Order } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrdersTable from '@/components/orders/OrdersTable';
import { useOrdersData } from '@/hooks/useOrdersData';
import { useOrdersActions } from '@/hooks/orders/useOrdersActions';
import { useOrdersModels } from '@/hooks/orders/useOrdersModels';
import { useOrderFilters } from '@/hooks/orders/useOrderFilters';
import OrdersHeader from '@/components/orders/OrdersHeader';
import OrderPrintContent from '@/components/orders/OrderPrintContent';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isAdmin = user?.type === 'admin';
  
  const {
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    resetFilters,
    activeFiltersCount
  } = useOrderFilters();

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

  const {
    markAsDeliveredMutation,
    cancelOrderMutation,
    deleteOrderMutation,
    handleMarkAsDelivered,
    handleCancelOrder,
    handleDeleteOrder,
    handleGenerateODL
  } = useOrdersActions(refreshAllOrderData);

  const uniqueModels = useOrdersModels(ordersData);

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleOrderDetailsSuccess = () => {
    console.log('Order details saved successfully, refreshing data');
    refreshAllOrderData();
  };

  const handleDeleteOrderWithId = () => {
    handleDeleteOrder(selectedOrderId);
    setSelectedOrderId(null);
  };

  const getOrderNumber = (order: Order) => {
    const index = ordersData.findIndex(o => o.id === order.id);
    return `#${(index + 1).toString().padStart(3, '0')}`;
  };

  const handlePrintOrder = (order: Order) => {
    setOrderToPrint(order);
    setPrintDialogOpen(true);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Ordine_${getOrderNumber(orderToPrint!).replace('#', '')}`,
    onAfterPrint: () => {
      setPrintDialogOpen(false);
      setOrderToPrint(null);
    }
  });

  // Executes the print when dialog opens with content ready
  useEffect(() => {
    if (printDialogOpen && orderToPrint && printRef.current) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printDialogOpen, orderToPrint, handlePrint]);

  return (
    <div className="container mx-auto py-6 px-4">
      <OrdersHeader
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
            showAdminColumns={!isDealer}
            tabName="processing"
            processingOrders={processingOrders}
            deliveredOrders={deliveredOrders}
            cancelledOrders={cancelledOrders}
            onViewDetails={handleViewOrderDetails}
            onMarkAsDelivered={handleMarkAsDelivered}
            onCancelOrder={handleCancelOrder}
            onDeleteClick={setSelectedOrderId}
            onDeleteConfirm={handleDeleteOrderWithId}
            onPrintOrder={handlePrintOrder}
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
            onDeleteConfirm={handleDeleteOrderWithId}
            onPrintOrder={handlePrintOrder}
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
            onDeleteConfirm={handleDeleteOrderWithId}
            onPrintOrder={handlePrintOrder}
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
            onDeleteConfirm={handleDeleteOrderWithId}
            onPrintOrder={handlePrintOrder}
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

      {/* Hidden print dialog that opens when print is requested */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto hidden">
          <div ref={printRef}>
            {orderToPrint && (
              <OrderPrintContent 
                order={orderToPrint} 
                orderNumber={getOrderNumber(orderToPrint)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
