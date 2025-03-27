
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { DateRange } from '@/types/date-range';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, CheckCheck, ChevronsUpDown, Copy, File, FileText, Truck, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { ordersApi } from '@/api/apiClient';
import {  vehiclesApi } from '@/api/supabase/vehiclesApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PdfPreviewDialog } from '@/components/orders/PdfPreviewDialog';
import { OrderDetailsDialogAdapter } from '@/components/orders/OrderDialogAdapters';
import { useOrdersData } from '@/hooks/orders/useOrdersData';
import { useOrdersActions } from '@/hooks/orders/useOrdersActions';
import { Check } from 'lucide-react';

const Orders = () => {
  const { user, isAdmin } = useAuth();
  const dealerId = user?.dealerId;

  // Filters state
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [isLicensable, setIsLicensable] = useState<boolean | null>(null);
  const [hasProforma, setHasProforma] = useState<boolean | null>(null);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [isInvoiced, setIsInvoiced] = useState<boolean | null>(null);
  const [hasConformity, setHasConformity] = useState<boolean | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  
  // Table state
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // Dialog states
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // PDF preview states
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  
  // Copy to clipboard state
  const [copied, setCopied] = useCopyToClipboard();

  // Get orders using our custom hooks
  const {
    ordersData,
    allOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    isLoading,
    error,
    refreshAllOrderData,
    getOrderNumber
  } = useOrdersData({
    isLicensable,
    hasProforma,
    isPaid,
    isInvoiced,
    hasConformity,
    dealerId,
    model: selectedModel
  });
  const filterOder=searchText===''?allOrders:allOrders.filter((order)=>order.customerName.includes(searchText))

  // Get order actions
  const {
    handleMarkAsDelivered,
    handleCancelOrder,
    handleDeleteOrder,
    handleGenerateODL
  } = useOrdersActions(refreshAllOrderData);

  // Models list for filter
  const [models, setModels] = useState<string[]>([]);
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const vehicles = await vehiclesApi.getAll();
        console.log(vehicles)
        const uniqueModels = [...new Set(vehicles.map(vehicle => vehicle.model))];
        setModels(uniqueModels);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  // Dealers list for filter
  const [dealers, setDealers] = useState<any[]>([]);
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const { data, error } = await ordersApi.getDealers();
        if (!error && data) {
          console.log("dealers")
          console.log(data)
          setDealers(data);
        }
      } catch (error) {
        console.error('Error fetching dealers:', error);
      }
    };

    fetchDealers();
  }, []);

  // Handle select all checkbox
  const handleSelectAll = () => {
    setIsAllSelected(!isAllSelected);
    setSelectedOrders(isAllSelected ? [] : allOrders.map(order => order.id));
  };

  // Handle row checkbox
  const handleRowSelect = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Handle open order details dialog
  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Handle delete order
  const handleOpenDeleteDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      handleDeleteOrder(orderToDelete);
      setIsDeleteAlertOpen(false);
      setOrderToDelete(null);
    }
  };

  // Handle PDF preview
  const handlePdfPreview = async (order: Order) => {
    try {
      const response = await ordersApi.generatePdf(order.id);
      setPdfData(response);
      setPdfPreviewOpen(true);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante la generazione dell\'anteprima PDF',
        variant: 'destructive'
      });
    }
  };

  // Function to render boolean values as check icons or X icons
  const renderBooleanStatus = (value: boolean | undefined) => {
    if (value === true) {
      return <Check className="h-4 w-4 text-green-600 mx-auto" />;
    }
    return <X className="h-4 w-4 text-red-500 mx-auto" />;
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>Si è verificato un errore: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Ordini</h1>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCopied(allOrders.map(order => order.id).join(', '))}>
            <Copy className="mr-2 h-4 w-4" />
            Copia ID Ordini
          </Button>
          {copied ? <Badge variant="secondary">Copiato!</Badge> : null}
          
          <Button variant="default" size="sm" onClick={refreshAllOrderData}>
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder="Cerca per nome cliente, telaio..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={
                "justify-start text-left font-normal" +
                (dateRange?.from ? " !font-medium" : "")
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
                ) : (
                  formatDate(dateRange.from)
                )
              ) : (
                <span>Seleziona un intervallo...</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={selectedModels.length > 0} className="justify-between">
              Modello
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Cerca modello..." />
              <CommandList>
                <CommandEmpty>Nessun modello trovato.</CommandEmpty>
                <CommandGroup>
                  {models.map((model) => (
                    <CommandItem
                      key={model}
                      onSelect={() => {
                        if (selectedModels.includes(model)) {
                          setSelectedModels(selectedModels.filter((m) => m !== model));
                        } else {
                          setSelectedModels([...selectedModels, model]);
                        }
                      }}
                    >
                      <CheckCheck
                        className={`mr-2 h-4 w-4 ${selectedModels.includes(model) ? "opacity-100" : "opacity-0"
                          }`}
                      />
                      {model}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={selectedDealers.length > 0} className="justify-between">
              Concessionario
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Cerca concessionario..." />
              <CommandList>
                <CommandEmpty>Nessun concessionario trovato.</CommandEmpty>
                <CommandGroup>
                  {dealers.map((dealer) => (
                    <CommandItem
                      key={dealer.id}
                      onSelect={() => {
                        if (selectedDealers.includes(dealer.id)) {
                          setSelectedDealers(selectedDealers.filter((d) => d !== dealer.id));
                        } else {
                          setSelectedDealers([...selectedDealers, dealer.id]);
                        }
                      }}
                    >
                      <CheckCheck
                        className={`mr-2 h-4 w-4 ${selectedDealers.includes(dealer.id) ? "opacity-100" : "opacity-0"
                          }`}
                      />
                      {dealer.companyName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={selectedStatus.length > 0} className="justify-between">
              Stato
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Cerca stato..." />
              <CommandList>
                <CommandEmpty>Nessuno stato trovato.</CommandEmpty>
                <CommandGroup>
                  {['processing', 'delivered', 'cancelled'].map((status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => {
                        if (selectedStatus.includes(status)) {
                          setSelectedStatus(selectedStatus.filter((s) => s !== status));
                        } else {
                          setSelectedStatus([...selectedStatus, status]);
                        }
                      }}
                    >
                      <CheckCheck
                        className={`mr-2 h-4 w-4 ${selectedStatus.includes(status) ? "opacity-100" : "opacity-0"
                          }`}
                      />
                      {status === 'processing' ? 'In Lavorazione' : 
                       status === 'delivered' ? 'Consegnato' : 'Annullato'}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Boolean Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Select 
          onValueChange={(value) => setIsLicensable(value === "true" ? true : value === "false" ? false : null)}
          defaultValue="null"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Targabile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="null">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          onValueChange={(value) => setHasProforma(value === "true" ? true : value === "false" ? false : null)}
          defaultValue="null"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Proforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="null">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          onValueChange={(value) => setIsPaid(value === "true" ? true : value === "false" ? false : null)}
          defaultValue="null"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pagato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="null">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          onValueChange={(value) => setIsInvoiced(value === "true" ? true : value === "false" ? false : null)}
          defaultValue="null"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Fatturato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="null">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          onValueChange={(value) => setHasConformity(value === "true" ? true : value === "false" ? false : null)}
          defaultValue="null"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Conformità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="null">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <Table>
          <TableCaption>Elenco degli ordini effettuati.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Progressivo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Plafond Dealer</TableHead>
              <TableHead>Modello</TableHead>
              <TableHead>Data Ordine</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-center">Targabile</TableHead>
              <TableHead className="text-center">Proforma</TableHead>
              <TableHead className="text-center">Pagato</TableHead>
              <TableHead className="text-center">Fatturato</TableHead>
              <TableHead className="text-center">Conformità</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center">Caricamento...</TableCell>
              </TableRow>
            ) : filterOder.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center">Nessun ordine trovato.</TableCell>
              </TableRow>
            ) : (
              filterOder.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleRowSelect(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {order.progressiveNumber 
                    }
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    {order.plafondDealer !== undefined ? 
                      <span className={
                        order.plafondDealer > 80000 ? "text-green-600 font-medium" :
                        order.plafondDealer < 20000 ? "text-red-600 font-medium" :
                        order.plafondDealer < 50000 ? "text-orange-500 font-medium" :
                        "text-gray-800"
                      }>
                        {formatCurrency(order.plafondDealer)}
                      </span> : 
                      "-"
                    }
                  </TableCell>
                  <TableCell>{order.modelName || (order.vehicle ? `${order.vehicle.model} ${order.vehicle.trim || ''}` : 'Non disponibile')}</TableCell>
                  <TableCell>{order.orderDate ? formatDate(new Date(order.orderDate)) : '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {order.status === 'processing' ? 'In Lavorazione' :
                       order.status === 'delivered' ? 'Consegnato' : 'Cancellato'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {renderBooleanStatus(order.isLicensable)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderBooleanStatus(order.hasProforma)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderBooleanStatus(order.isPaid)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderBooleanStatus(order.isInvoiced)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderBooleanStatus(order.hasConformity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePdfPreview(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Anteprima
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenOrderDetails(order)}>
                        <File className="mr-2 h-4 w-4" />
                        APRI ORDINE
                      </Button>
                      {order.status === 'processing' && order.odlGenerated && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleMarkAsDelivered(order.id)}
                          className="bg-green-100 hover:bg-green-200 text-green-800"
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Consegna
                        </Button>
                      )}
                      {isAdmin && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(order.id)}
                        >
                          Elimina
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order details dialog */}
      <OrderDetailsDialogAdapter
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
        order={selectedOrder || {} as Order}
        onGenerateODL={handleGenerateODL}
      />

      {/* PDF preview dialog */}
      {pdfData && (
        <PdfPreviewDialog
          isOpen={pdfPreviewOpen}
          onClose={() => setPdfPreviewOpen(false)}
          pdfData={pdfData}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Vuoi veramente eliminare l'ordine?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrder}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
