
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase';
import { Button } from '@/components/ui/button';
import { PlusIcon, FilePlus2 } from 'lucide-react';
import { useOrdersActions } from '@/hooks/orders/useOrdersActions';
import { useAuth } from '@/context/AuthContext';
import { generateOrdersPdf } from '@/lib/pdf-generator';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { toast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { PdfPreviewDialog } from '@/components/orders/PdfPreviewDialog';
import { OrderFiltersDialog } from '@/components/orders/OrderFiltersDialog';
import { DateRange } from '@/types/date-range';
import { OrderDetailsDialogAdapter, OrderDetailsFormAdapter } from '@/components/orders/OrderDialogAdapters';
import { Order } from '@/types';

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
  const [pdfData, setPdfData] = useState<Blob | null>(null);
  const [filters, setFilters] = useState({
    searchText: '',
    dateRange: undefined as DateRange | undefined,
    models: [] as string[],
    dealers: [] as string[],
    status: [] as string[],
    isLicensable: null as boolean | null,
    hasProforma: null as boolean | null,
    isPaid: null as boolean | null,
    isInvoiced: null as boolean | null,
    hasConformity: null as boolean | null,
    dealerId: null as string | null,
    model: null as string | null
  });
  
  const debouncedSearchText = useDebounce(filters.searchText, 500);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    staleTime: 0
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
        const toDate = filters.dateRange?.to ? addDays(filters.dateRange.to, 1) : undefined;
        
        if (fromDate && toDate) {
          return orderDate >= fromDate && orderDate <= toDate;
        }
        return true;
      });
    }
    
    if (filters.models && filters.models.length > 0) {
      filtered = filtered.filter(order => 
        filters.models.includes(order.modelName || '')
      );
    }
    
    if (filters.dealers && filters.dealers.length > 0) {
      filtered = filtered.filter(order => 
        filters.dealers.includes(order.dealerName || '')
      );
    }
    
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(order => 
        filters.status.includes(order.status)
      );
    }
    
    if (filters.isLicensable !== null) {
      filtered = filtered.filter(order => 
        order.isLicensable === filters.isLicensable
      );
    }
    
    if (filters.hasProforma !== null) {
      filtered = filtered.filter(order => 
        order.hasProforma === filters.hasProforma
      );
    }
    
    if (filters.isPaid !== null) {
      filtered = filtered.filter(order => 
        order.isPaid === filters.isPaid
      );
    }
    
    if (filters.isInvoiced !== null) {
      filtered = filtered.filter(order => 
        order.isInvoiced === filters.isInvoiced
      );
    }
    
    if (filters.hasConformity !== null) {
      filtered = filtered.filter(order => 
        order.hasConformity === filters.hasConformity
      );
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
      // Convert the result to Blob if it's not already
      const blob = pdfBlob instanceof Blob ? pdfBlob : new Blob([pdfBlob], { type: 'application/pdf' });
      setPdfData(blob);
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
      // Convert the result to Blob if it's not already
      const blob = pdfBlob instanceof Blob ? pdfBlob : new Blob([pdfBlob], { type: 'application/pdf' });
      setPdfData(blob);
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
  
  // Render the main content
  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Ordini - Cirelli Motor Company</title>
      </Helmet>
      
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
            onChange={(e) => setFilters({
              ...filters,
              searchText: e.target.value
            })}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
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
              onSelect={(dateRange) => {
                setFilters({
                  ...filters,
                  dateRange
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Placeholder for data table content - consider creating a custom orders table component */}
      <div className="border rounded-md p-4">
        {isLoading ? (
          <p className="text-center py-8">Caricamento ordini...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-500">Errore nel caricamento degli ordini.</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center py-8">Nessun ordine trovato.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Cliente</th>
                  <th className="p-2 text-left">Veicolo</th>
                  <th className="p-2 text-left">Data</th>
                  <th className="p-2 text-left">Stato</th>
                  <th className="p-2 text-left">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-t">
                    <td className="p-2">{order.id.substring(0, 8)}...</td>
                    <td className="p-2">{order.customerName}</td>
                    <td className="p-2">{order.modelName || "N/A"}</td>
                    <td className="p-2">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="p-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'processing' ? 'In Lavorazione' :
                          order.status === 'delivered' ? 'Consegnato' : 'Cancellato'}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                          Dettagli
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditOrderDetails(order)}>
                          Modifica
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Dialog components */}
      <OrderFiltersDialog
        open={isFiltersDialogOpen}
        onOpenChange={setIsFiltersDialogOpen}
        filters={filters as any} // Type cast to satisfy the component
        setFilters={(newFilters) => setFilters(newFilters as any)} // Type cast to satisfy the component
      />
      
      <OrderDetailsDialogAdapter
        isOpen={isOrderDetailsDialogOpen}
        onClose={handleCloseOrderDetails}
        order={selectedOrder}
      />
      
      <OrderDetailsFormAdapter
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
