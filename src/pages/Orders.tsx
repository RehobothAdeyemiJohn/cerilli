import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';
import { DateRange } from '@/types/date-range';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, CheckCheck, ChevronsUpDown, Copy, File, FileText, Filter, Search, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { ordersApi, vehiclesApi } from '@/api/apiClient';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PdfPreviewDialog } from '@/components/orders/PdfPreviewDialog';
import { OrderDetailsDialogAdapter } from '@/components/orders/OrderDialogAdapters';

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

  // PDF preview states
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  // Copy to clipboard state
  const [copied, setCopied] = useCopyToClipboard();

  // Fetch orders using the custom hook
  const {
    ordersList,
    isLoading,
    error,
    refetchOrders
  } = useOrders({
    searchText,
    dateRange,
    models: selectedModels,
    dealers: selectedDealers,
    status: selectedStatus,
    isLicensable,
    hasProforma,
    isPaid,
    isInvoiced,
    hasConformity,
    dealerId,
    model: selectedModel
  });

  // Models list for filter
  const [models, setModels] = useState<string[]>([]);
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const vehicles = await vehiclesApi.getAll();
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
        const dealers = await ordersApi.getDealers();
        setDealers(dealers);
      } catch (error) {
        console.error('Error fetching dealers:', error);
      }
    };

    fetchDealers();
  }, []);

  // Handle select all checkbox
  const handleSelectAll = () => {
    setIsAllSelected(!isAllSelected);
    setSelectedOrders(isAllSelected ? [] : ordersList.map(order => order.id));
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
  const handleDeleteOrder = async () => {
    if (selectedOrder) {
      try {
        await ordersApi.delete(selectedOrder.id);
        refetchOrders();
        setIsDeleteAlertOpen(false);
        toast({
          title: 'Ordine eliminato',
          description: 'L\'ordine è stato eliminato con successo',
        });
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: 'Errore',
          description: 'Si è verificato un errore durante l\'eliminazione dell\'ordine',
          variant: 'destructive'
        });
      }
    }
  };

  // Handle PDF preview
  const handlePdfPreview = async (order: Order) => {
    try {
      const response = await ordersApi.generatePdfPreview(order);
      // Convert Blob to Uint8Array
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      setPdfData(uint8Array);
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

  // Handle ODL generation
  const handleGenerateODL = async (orderId: string) => {
    try {
      const order = ordersList.find(o => o.id === orderId);
      if (!order) return;
      
      const response = await ordersApi.generateOrderDeliveryForm(order);
      // Convert Blob to Uint8Array
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      setPdfData(uint8Array);
      setPdfPreviewOpen(true);
      
      // Update order to mark ODL as generated
      await ordersApi.update(orderId, { odlGenerated: true });
      
      // Refetch orders to update the UI
      refetchOrders();
      
    } catch (error) {
      console.error('Error generating ODL:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante la generazione dell\'ODL',
        variant: 'destructive'
      });
    }
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
          <Button variant="outline" size="sm" onClick={() => setCopied(ordersList.map(order => order.id).join(', '))}>
            <Copy className="mr-2 h-4 w-4" />
            Copia ID Ordini
          </Button>
          {copied ? <Badge variant="secondary">Copiato!</Badge> : null}
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
                      {status}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Booleans Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <Select onValueChange={(value) => setIsLicensable(value === "true" ? true : value === "false" ? false : null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Targabile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setHasProforma(value === "true" ? true : value === "false" ? false : null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Proforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setIsPaid(value === "true" ? true : value === "false" ? false : null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pagato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setInvoiced(value === "true" ? true : value === "false" ? false : null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Fatturato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="">Qualsiasi</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setHasConformity(value === "true" ? true : value === "false" ? false : null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Conformità" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Si</SelectItem>
            <SelectItem value="false">No</SelectItem>
            <SelectItem value="">Qualsiasi</SelectItem>
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
              <TableHead>Modello</TableHead>
              <TableHead>Data Ordine</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Caricamento...</TableCell>
              </TableRow>
            ) : ordersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Nessun ordine trovato.</TableCell>
              </TableRow>
            ) : (
              ordersList.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleRowSelect(order.id)}
                    />
                  </TableCell>
                  <TableCell>{order.progressiveNumber?.toString().padStart(3, '0')}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.modelName || (order.vehicle ? `${order.vehicle.model} ${order.vehicle.trim || ''}` : 'Non disponibile')}</TableCell>
                  <TableCell>{formatDate(new Date(order.orderDate))}</TableCell>
                  <TableCell className="capitalize">{
                    order.status === 'processing' ? 'In Lavorazione' :
                      order.status === 'delivered' ? 'Consegnato' : 'Cancellato'
                  }</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePdfPreview(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Anteprima
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOpenOrderDetails(order)}>
                        <File className="mr-2 h-4 w-4" />
                        Dettagli
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Elimina
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Questa azione non può essere annullata. Vuoi veramente eliminare l'ordine?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteOrder}>Elimina</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
          open={pdfPreviewOpen}
          onOpenChange={setPdfPreviewOpen}
          pdfData={pdfData}
        />
      )}
    </div>
  );
};

export default Orders;
