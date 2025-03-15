import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { useOrdersData } from '@/hooks/useOrdersData';
import { useOrdersActions } from '@/hooks/orders/useOrdersActions';
import OrdersHeader from '@/components/orders/OrdersHeader';
import OrdersTable from '@/components/orders/OrdersTable';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Order } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from '@/hooks/use-toast';
import { useReactToPrint } from 'react-to-print';
import OrderPrintTemplate from '@/components/orders/OrderPrintTemplate';
import { useRef } from 'react';
import ContractFormDialog from '@/components/contracts/ContractFormDialog';

const Orders = () => {
  const { isAdmin } = useAuth();
  const { filters, handleFilterChange, resetFilters } = useOrderFilters();
  const {
    ordersData,
    ordersWithDetails,
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
    refetchOrdersWithDetails,
    getOrderNumber
  } = useOrdersData(filters);
  const {
    markAsDeliveredMutation,
    cancelOrderMutation,
    deleteOrderMutation,
    handleMarkAsDelivered,
    handleCancelOrder,
    handleDeleteOrder,
    handleGenerateODL
  } = useOrdersActions(refreshAllOrderData);
  const [isContractFormOpen, setIsContractFormOpen] = useState(false);
  const [selectedOrderForContract, setSelectedOrderForContract] = useState<Order | null>(null);

  // Gestisce la creazione di un contratto da un ordine
  const handleCreateContract = (order: Order) => {
    setSelectedOrderForContract(order);
    setIsContractFormOpen(true);
  };

  // Gestisce la sottomissione del form di creazione contratto
  const handleContractFormSubmit = async (formData: any) => {
    if (selectedOrderForContract) {
      try {
        // Importa l'API dei contratti direttamente qui per evitare dipendenze circolari
        const { dealerContractsApi } = await import('@/api/supabase/dealerContractsApi');
        
        await dealerContractsApi.createFromOrder(selectedOrderForContract.id, formData);
        
        // Aggiorna i dati degli ordini dopo la creazione del contratto
        refreshAllOrderData();
        
        // Chiudi il dialog
        setIsContractFormOpen(false);
        setSelectedOrderForContract(null);
        
        // Mostra toast di successo
        toast({
          title: "Contratto creato",
          description: "Il contratto è stato creato con successo",
        });
      } catch (error: any) {
        console.error('Error creating contract:', error);
        toast({
          title: "Errore",
          description: error.message || "Si è verificato un errore durante la creazione del contratto",
          variant: "destructive"
        });
      }
    }
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handlePrint = useCallback(async (order: Order) => {
    setSelectedOrder(order);
    triggerPrint();
  }, []);

  const handleOpenDetailsDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const filteredOrders = (status?: string) => {
    let filtered = ordersWithDetails;

    if (status && status !== 'all') {
      filtered = filtered.filter(o => o.status === status);
    }

    return filtered;
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOrder = () => {
    if (orderToDelete) {
      handleDeleteOrder(orderToDelete);
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const componentRef = useRef(null);
  const triggerPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Order-${selectedOrder?.id}`,
  });

  return (
    <>
      <Helmet>
        <title>Ordini - Cirelli Motor Company</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <OrdersHeader 
          filters={filters}
          onFilterChange={handleFilterChange}
          resetFilters={resetFilters}
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
              onDeleteConfirm={handleDeleteOrder}
              onPrintOrder={handlePrint}
              onCreateContract={handleCreateContract} // Passa la funzione per creare contratti
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
              onDeleteConfirm={handleDeleteOrder}
              onPrintOrder={handlePrint}
              onCreateContract={handleCreateContract} // Passa la funzione per creare contratti
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
              onDeleteConfirm={handleDeleteOrder}
              onPrintOrder={handlePrint}
              onCreateContract={handleCreateContract} // Passa la funzione per creare contratti
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
              onDeleteConfirm={handleDeleteOrder}
              onPrintOrder={handlePrint}
              onCreateContract={handleCreateContract} // Passa la funzione per creare contratti
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

        <OrderDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          order={selectedOrder}
          onGenerateODL={handleGenerateODL}
        />

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
              <AlertDialogAction onClick={handleDeleteOrder} disabled={deleteOrderMutation.isPending}>
                {deleteOrderMutation.isPending ? 'Eliminazione...' : 'Elimina'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {selectedOrder && (
          <div style={{ display: "none" }}>
            <OrderPrintTemplate ref={componentRef} order={selectedOrder} getOrderNumber={getOrderNumber} />
          </div>
        )}

        {/* Aggiungi il dialog per la creazione del contratto */}
        <ContractFormDialog
          isOpen={isContractFormOpen}
          onClose={() => setIsContractFormOpen(false)}
          onSubmit={handleContractFormSubmit}
          order={selectedOrderForContract}
          isSubmitting={false}
        />
      </div>
    </>
  );
};

export default Orders;
