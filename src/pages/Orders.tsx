import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase';
import { Order, OrderFilters } from '@/types';
import { DataTableViewOptions } from '@/components/orders/data-table-view-options';
import { DataTable } from '@/components/ui/data-table';
import { ordersColumns } from '@/components/orders/orders-columns';
import { Button } from '@/components/ui/button';
import { PlusIcon, FilePlus2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { OrderFiltersDialog } from '@/components/orders/OrderFiltersDialog';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import { useOrdersActions } from '@/hooks/orders/useOrdersActions';
import { generateOrdersPdf } from '@/lib/pdf-generator';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import OrderDetailsForm from '@/components/orders/OrderDetailsForm';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { addDays } from 'date-fns';
import { PdfPreviewDialog } from '@/components/orders/PdfPreviewDialog';

const Orders = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  
  const [filters, setFilters] = useState<OrderFilters>({
    searchText: '',
    dateRange: undefined,
    models: [],
    dealers: [],
    status: [],
    isLicensable: null,
    hasProforma: null,
    isPaid: null,
    isInvoiced: null,
    hasConformity: null,
    dealerId: null,
    model: null
  });
  
  const debouncedSearchText = useDebounce(filters.searchText, 500);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  const { 
    data: orders = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    staleTime: 0,
  });
  
  const { 
    markAsDeliveredMutation,
    cancelOrderMutation,
    deleteOrderMutation,
    generateODLMutation,
    handleMarkAsDelivered,
    handleCancelOrder,
    handleDeleteOrder,
    handleGenerateODL
  } = useOrdersActions(refetch);
  
  const isDelivering = markAsDeliveredMutation.isPending;
  const isCancelling = cancelOrderMutation.isPending;
  const isDeleting = deleteOrderMutation.isPending;
  const isGeneratingODL = generateODLMutation.isPending;
  
  const filteredOrders = React.useMemo(() => {
    let filtered = [...orders];
    
    if (debouncedSearchText) {
      filtered = filtered.filter(order =>
        order.customerName.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        order.modelName?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        order.dealerName?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        order.id.toLowerCase().includes(debouncedSearchText.toLowerCase())
      );
    }
    
    if (filters.dateRange?.from && filters.dateRange?.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const fromDate = filters.dateRange?.from;
        const toDate = addDays(filters.dateRange?.to, 1);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }
    
    if (filters.models && filters.models.length > 0) {
      filtered = filtered.filter(order => filters.models.includes(order.modelName || ''));
    }
    
    if (filters.dealers && filters.dealers.length > 0) {
      filtered = filtered.filter(order => filters.dealers.includes(order.dealerName || ''));
    }
    
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(order => filters.status.includes(order.status));
    }
    
    if (filters.isLicensable !== null) {
      filtered = filtered.filter(order => order.isLicensable === filters.isLicensable);
    }
    
    if (filters.hasProforma !== null) {
      filtered = filtered.filter(order => order.hasProforma === filters.hasProforma);
    }
    
    if (filters.isPaid !== null) {
      filtered = filtered.filter(order => order.isPaid === filters.isPaid);
    }
    
    if (filters.isInvoiced !== null) {
      filtered = filtered.filter(order => order.isInvoiced === filters.isInvoiced);
    }
    
    if (filters.hasConformity !== null) {
      filtered = filtered.filter(order => order.hasConformity === filters.hasConformity);
    }
    
    return filtered;
  }, [orders, filters, debouncedSearchText]);
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsDialogOpen(true);
  };
  
  const handleCloseOrderDetails = () => {
    setIsOrderDetailsDialogOpen(false);
    setSelectedOrder(null);
  };
  
  const handleEditOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedOrder(null);
    refetch();
  };
  
  const handleDeleteButtonClick = (orderId: string) => {
    setDeleteOrderId(orderId);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteOrderId(null);
  };
  
  const handleDeleteOrderConfirmed = () => {
    if (deleteOrderId) {
      handleDeleteOrder(deleteOrderId);
      setIsDeleteDialogOpen(false);
      setDeleteOrderId(null);
    }
  };
  
  const handleGeneratePdf = async (order: Order) => {
    try {
      const pdfBlob = await generateOrdersPdf([order]);
      setPdfData(pdfBlob);
      setIsPdfPreviewOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione del PDF",
        variant: "destructive"
      });
    }
  };
  
  const handlePreviewPdf = async () => {
    try {
      const pdfBlob = await generateOrdersPdf(filteredOrders);
      setPdfData(pdfBlob);
      setIsPdfPreviewOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione del PDF",
        variant: "destructive"
      });
    }
  };
  
  const closePdfPreview = () => {
    setIsPdfPreviewOpen(false);
    setPdfData(null);
  };
  
  const columns = React.useMemo(
    () => ordersColumns({
      isAdmin,
      isDelivering,
      isCancelling,
      isGeneratingODL,
      handleMarkAsDelivered,
      handleCancelOrder,
      handleEditOrderDetails,
      handleGeneratePdf,
      handleGenerateODL,
      onDeleteButtonClick: handleDeleteButtonClick
    }),
    [isAdmin, isDelivering, isCancelling, isGeneratingODL, handleMarkAsDelivered, handleCancelOrder, handleEditOrderDetails, handleGeneratePdf, handleGenerateODL, handleDeleteButtonClick]
  );
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ordini</h1>
        <div className="flex space-x-2">
          <Button onClick={handlePreviewPdf}>
            <FilePlus2 className="mr-2 h-4 w-4" />
            Anteprima PDF
          </Button>
          <Button onClick={() => setIsFiltersDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Filtri
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="w-full md:w-1/3 mb-2 md:mb-0">
          <Input
            placeholder="Cerca ordini..."
            value={filters.searchText}
            onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !filters.dateRange?.from || !filters.dateRange?.to ? "text-muted-foreground" : undefined
              )}
            >
              {filters.dateRange?.from && filters.dateRange?.to ? (
                format(filters.dateRange.from, "LLL dd, yyyy") + " - " + format(filters.dateRange.to, "LLL dd, yyyy")
              ) : (
                <span>Seleziona intervallo date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange}
              onSelect={(dateRange: DateRange | undefined) => {
                setFilters({ ...filters, dateRange });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <DataTableViewOptions
        table={{
          getColumnVisibility: () => columnVisibility,
          setColumnVisibility,
        }}
      />
      
      {filteredOrders.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          error={error}
          isAdmin={isAdmin}
          showAdminColumns={true}
          onViewDetails={handleViewOrder}
          onMarkAsDelivered={handleMarkAsDelivered}
          onCancelOrder={handleCancelOrder}
          onEditDetails={handleEditOrderDetails}
          onGeneratePdf={handleGeneratePdf}
          onGenerateODL={handleGenerateODL}
          onDeleteButtonClick={handleDeleteButtonClick}
          deleteOrderId={deleteOrderId}
          deleteOrderPending={isDeleting}
          onDeleteConfirm={handleDeleteOrder}
          onPreviewPDF={handlePreviewPdf}
        />
      ) : (
        <div className="text-center py-4">
          {isLoading ? (
            <p>Caricamento ordini...</p>
          ) : error ? (
            <p className="text-red-500">Errore nel caricamento degli ordini.</p>
          ) : (
            <p>Nessun ordine trovato.</p>
          )}
        </div>
      )}
      
      <OrderFiltersDialog
        open={isFiltersDialogOpen}
        onOpenChange={setIsFiltersDialogOpen}
        filters={filters}
        setFilters={setFilters}
      />
      
      <OrderDetailsDialog
        isOpen={isOrderDetailsDialogOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
      />
      
      <OrderDetailsForm
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        order={selectedOrder}
      />
      
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteOrderConfirmed}
        itemName="ordine"
        pending={isDeleting}
      />
      
      <PdfPreviewDialog
        isOpen={isPdfPreviewOpen}
        onClose={closePdfPreview}
        pdfData={pdfData}
      />
    </div>
  );
};

export default Orders;
