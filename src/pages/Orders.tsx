
import React, { useState, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useOrdersData } from '@/hooks/useOrdersData';
import { useOrdersActions } from '@/hooks/orders/useOrdersActions';
import OrdersHeader from '@/components/orders/OrdersHeader';
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { useReactToPrint } from 'react-to-print';
import OrderPrintTemplate from '@/components/orders/OrderPrintTemplate';

const Orders = () => {
  const { isAdmin } = useAuth();
  const { 
    filters, 
    handleFilterChange, 
    resetFilters, 
    showFilters, 
    setShowFilters, 
    activeFiltersCount 
  } = useOrderFilters();
  
  const {
    ordersData,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrders,
    isLoading,
    error,
    refreshAllOrderData,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    refetchOrders,
    getOrderNumber
  } = useOrdersData(filters);
  
  const {
    markAsDeliveredMutation,
    cancelOrderMutation,
    deleteOrderMutation,
    handleMarkAsDelivered,
    handleCancelOrder,
    handleDeleteOrder: deleteOrderAction,
    handleGenerateODL
  } = useOrdersActions(refreshAllOrderData);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handlePrint = useCallback(async (order: Order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      if (printRef.current) {
        triggerPrint();
      }
    }, 100);
  }, []);

  const handleOpenDetailsDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setTimeout(() => {
      setSelectedOrder(null);
    }, 100);
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrderAction(orderToDelete);
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  
  const triggerPrint = useReactToPrint({
    documentTitle: selectedOrder ? `Order-${selectedOrder.id}` : 'Order',
    onAfterPrint: () => console.log('Print completed'),
    contentRef: printRef,
  });

  return (
    <>
      <Helmet>
        <title>Ordini - Cirelli Motor Company</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <OrdersHeader 
          isAdmin={isAdmin}
          filters={filters}
          updateFilter={handleFilterChange}
          resetFilters={resetFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
          dealersData={[]} 
          uniqueModels={[]} 
          onRefresh={refreshAllOrderData}
        />

        <Tabs defaultValue="processing" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
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
              Tutti ({allOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="processing" className="mt-6">
            <OrdersTable
              orders={processingOrders}
              isLoading={isLoading}
              error={error}
              isAdmin={isAdmin}
              showAdminColumns={true}
              onViewDetails={handleOpenDetailsDialog}
              onMarkAsDelivered={handleMarkAsDelivered}
              onCancelOrder={handleCancelOrder}
              onDeleteClick={handleDeleteClick}
              onDeleteConfirm={confirmDeleteOrder}
              onPrintOrder={handlePrint}
              tabName="processing"
              processingOrders={processingOrders}
              deliveredOrders={deliveredOrders}
              cancelledOrders={cancelledOrders}
              isDealer={!isAdmin}
              markAsDeliveredPending={markAsDeliveredMutation.isPending}
              cancelOrderPending={cancelOrderMutation.isPending}
              deleteOrderPending={deleteOrderMutation.isPending}
            />
          </TabsContent>
          
          <TabsContent value="delivered" className="mt-6">
            <OrdersTable
              orders={deliveredOrders}
              isLoading={isLoading}
              error={error}
              isAdmin={isAdmin}
              showAdminColumns={true}
              onViewDetails={handleOpenDetailsDialog}
              onMarkAsDelivered={handleMarkAsDelivered}
              onCancelOrder={handleCancelOrder}
              onDeleteClick={handleDeleteClick}
              onDeleteConfirm={confirmDeleteOrder}
              onPrintOrder={handlePrint}
              tabName="delivered"
              processingOrders={processingOrders}
              deliveredOrders={deliveredOrders}
              cancelledOrders={cancelledOrders}
              isDealer={!isAdmin}
              markAsDeliveredPending={markAsDeliveredMutation.isPending}
              cancelOrderPending={cancelOrderMutation.isPending}
              deleteOrderPending={deleteOrderMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <OrdersTable
              orders={cancelledOrders}
              isLoading={isLoading}
              error={error}
              isAdmin={isAdmin}
              showAdminColumns={true}
              onViewDetails={handleOpenDetailsDialog}
              onMarkAsDelivered={handleMarkAsDelivered}
              onCancelOrder={handleCancelOrder}
              onDeleteClick={handleDeleteClick}
              onDeleteConfirm={confirmDeleteOrder}
              onPrintOrder={handlePrint}
              tabName="cancelled"
              processingOrders={processingOrders}
              deliveredOrders={deliveredOrders}
              cancelledOrders={cancelledOrders}
              isDealer={!isAdmin}
              markAsDeliveredPending={markAsDeliveredMutation.isPending}
              cancelOrderPending={cancelOrderMutation.isPending}
              deleteOrderPending={deleteOrderMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <OrdersTable
              orders={allOrders}
              isLoading={isLoading}
              error={error}
              isAdmin={isAdmin}
              showAdminColumns={true}
              onViewDetails={handleOpenDetailsDialog}
              onMarkAsDelivered={handleMarkAsDelivered}
              onCancelOrder={handleCancelOrder}
              onDeleteClick={handleDeleteClick}
              onDeleteConfirm={confirmDeleteOrder}
              onPrintOrder={handlePrint}
              tabName="all"
              processingOrders={processingOrders}
              deliveredOrders={deliveredOrders}
              cancelledOrders={cancelledOrders}
              isDealer={!isAdmin}
              markAsDeliveredPending={markAsDeliveredMutation.isPending}
              cancelOrderPending={cancelOrderMutation.isPending}
              deleteOrderPending={deleteOrderMutation.isPending}
            />
          </TabsContent>
        </Tabs>

        {selectedOrder && (
          <OrderDetailsDialog
            open={isDetailsDialogOpen}
            onOpenChange={handleCloseDetailsDialog}
            order={selectedOrder}
            onGenerateODL={handleGenerateODL}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non può essere annullata. L'ordine verrà eliminato permanentemente dal database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDeleteOrder()} disabled={deleteOrderMutation.isPending}>
                {deleteOrderMutation.isPending ? 'Eliminazione...' : 'Elimina'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {selectedOrder && (
          <div style={{ display: "none" }}>
            <OrderPrintTemplate ref={printRef} order={selectedOrder} getOrderNumber={getOrderNumber} />
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
