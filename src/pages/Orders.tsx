
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase/ordersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { Order, Vehicle, OrderDetails } from '@/types';
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
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Orders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isAdmin = user?.type === 'admin';

  // Filter state
  const [filters, setFilters] = useState({
    isLicensable: null as boolean | null,
    hasProforma: null as boolean | null,
    isPaid: null as boolean | null,
    isInvoiced: null as boolean | null,
    hasConformity: null as boolean | null,
    dealerId: null as string | null,
    model: null as string | null,
  });
  
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
  
  // Filter orders by status and apply admin filters
  const filterOrders = (orders: Order[], status?: string) => {
    let filtered = orders;
    
    // Filter by status if provided
    if (status && status !== 'all') {
      filtered = filtered.filter(o => o.status === status);
    }
    
    // Apply admin filters
    if (isAdmin) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null) {
          switch (key) {
            case 'isLicensable':
            case 'hasProforma':
            case 'isPaid':
            case 'isInvoiced':
            case 'hasConformity':
              filtered = filtered.filter(order => 
                order.details && order.details[key as keyof OrderDetails] === value
              );
              break;
            case 'dealerId':
              if (value) {
                filtered = filtered.filter(order => order.dealerId === value);
              }
              break;
            case 'model':
              if (value) {
                filtered = filtered.filter(order => 
                  order.vehicle && order.vehicle.model === value
                );
              }
              break;
          }
        }
      });
    }
    
    return filtered;
  };
  
  // Filter orders by status
  const processingOrders = filterOrders(ordersData, 'processing');
  const deliveredOrders = filterOrders(ordersData, 'delivered');
  const cancelledOrders = filterOrders(ordersData, 'cancelled');
  const allOrders = filterOrders(ordersData);
  
  // Mutation for marking an order as delivered
  const markAsDeliveredMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        // 1. Get current order
        const order = await ordersApi.getById(orderId);
        
        // 2. Check if ODL has been generated
        if (!order.details?.odlGenerated) {
          throw new Error("L'ODL deve essere generato prima di poter consegnare l'ordine");
        }
        
        // 3. Update vehicle status to 'delivered' and change location to 'Stock Dealer'
        if (order.vehicle && order.dealerId) {
          await vehiclesApi.update(order.vehicleId, {
            status: 'delivered' as Vehicle['status'],
            location: 'Stock Dealer'
          });
        }
        
        // 4. Update order with delivered status
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
    onError: (error: any) => {
      console.error('Error marking order as delivered:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'aggiornamento dell'ordine",
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
  
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };
  
  const handleGenerateODL = (details: OrderDetails) => {
    // Refresh orders data
    queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: ['orderDetails'], refetchType: 'all' });
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
  
  // Get unique models and dealers for filters
  const uniqueModels = React.useMemo(() => {
    const models = new Set<string>();
    ordersData.forEach(order => {
      if (order.vehicle?.model) {
        models.add(order.vehicle.model);
      }
    });
    return Array.from(models);
  }, [ordersData]);
  
  const uniqueDealers = React.useMemo(() => {
    const dealers = new Set<string>();
    ordersData.forEach(order => {
      if (order.dealer?.id) {
        dealers.add(order.dealer.id);
      }
    });
    return Array.from(dealers);
  }, [ordersData]);
  
  // Helper function to render filter indicator icons
  const renderFilterStatus = (key: keyof typeof filters) => {
    const value = filters[key];
    if (value === null) return null;
    return value ? 
      <Check className="h-4 w-4 text-green-600" /> : 
      <X className="h-4 w-4 text-red-600" />;
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
              {isAdmin && (
                <>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Targabile</span>
                      {renderFilterStatus('isLicensable')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Proformata</span>
                      {renderFilterStatus('hasProforma')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Saldata</span>
                      {renderFilterStatus('isPaid')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Fatturata</span>
                      {renderFilterStatus('isInvoiced')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Conformità</span>
                      {renderFilterStatus('hasConformity')}
                    </div>
                  </TableHead>
                  <TableHead>Plafond</TableHead>
                </>
              )}
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 13 : 7} className="text-center py-10">
                  Caricamento ordini...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 13 : 7} className="text-center py-10 text-red-500">
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
                
                const canDeliverOrder = order.status === 'processing' && order.details?.odlGenerated;
                const dealerLimit = order.dealer?.creditLimit;
                
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
                    
                    {isAdmin && (
                      <>
                        <TableCell>
                          {order.details?.isLicensable ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.hasProforma ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.isPaid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.isInvoiced ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.hasConformity ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {dealerLimit !== undefined && dealerLimit !== null ? (
                            <span>
                              {new Intl.NumberFormat('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0,
                              }).format(dealerLimit)}
                            </span>
                          ) : 'N/A'}
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          Visualizza
                        </Button>
                        
                        {order.status === 'processing' && !isDealer && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
                              onClick={() => handleMarkAsDelivered(order.id)}
                              disabled={markAsDeliveredMutation.isPending || !canDeliverOrder}
                              title={!canDeliverOrder ? "Genera ODL prima di consegnare" : ""}
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
                        
                        {!isDealer && (
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 13 : 7} className="text-center py-10 text-gray-500">
                  Nessun ordine trovato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  // Reset all filters
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
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Ordini</h1>
        
        {isAdmin && (
          <div className="flex space-x-2 mt-4 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtri
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filtri Amministrativi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-medium pt-2">Targabile</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.isLicensable === true}
                  onCheckedChange={() => setFilters({...filters, isLicensable: filters.isLicensable !== true ? true : null})}
                >
                  Sì
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.isLicensable === false}
                  onCheckedChange={() => setFilters({...filters, isLicensable: filters.isLicensable !== false ? false : null})}
                >
                  No
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuLabel className="text-xs font-medium pt-2">Proformata</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.hasProforma === true}
                  onCheckedChange={() => setFilters({...filters, hasProforma: filters.hasProforma !== true ? true : null})}
                >
                  Sì
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.hasProforma === false}
                  onCheckedChange={() => setFilters({...filters, hasProforma: filters.hasProforma !== false ? false : null})}
                >
                  No
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuLabel className="text-xs font-medium pt-2">Saldata</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.isPaid === true}
                  onCheckedChange={() => setFilters({...filters, isPaid: filters.isPaid !== true ? true : null})}
                >
                  Sì
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.isPaid === false}
                  onCheckedChange={() => setFilters({...filters, isPaid: filters.isPaid !== false ? false : null})}
                >
                  No
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuLabel className="text-xs font-medium pt-2">Fatturata</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.isInvoiced === true}
                  onCheckedChange={() => setFilters({...filters, isInvoiced: filters.isInvoiced !== true ? true : null})}
                >
                  Sì
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.isInvoiced === false}
                  onCheckedChange={() => setFilters({...filters, isInvoiced: filters.isInvoiced !== false ? false : null})}
                >
                  No
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuLabel className="text-xs font-medium pt-2">Conformità</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.hasConformity === true}
                  onCheckedChange={() => setFilters({...filters, hasConformity: filters.hasConformity !== true ? true : null})}
                >
                  Sì
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.hasConformity === false}
                  onCheckedChange={() => setFilters({...filters, hasConformity: filters.hasConformity !== false ? false : null})}
                >
                  No
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-medium">Modello</DropdownMenuLabel>
                {uniqueModels.map(model => (
                  <DropdownMenuCheckboxItem
                    key={model}
                    checked={filters.model === model}
                    onCheckedChange={() => setFilters({...filters, model: filters.model !== model ? model : null})}
                  >
                    {model}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={resetFilters}
                  >
                    Reimposta Filtri
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
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
          {renderOrderTable(allOrders, 'all')}
        </TabsContent>
      </Tabs>
      
      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={orderDetailsOpen}
          onOpenChange={setOrderDetailsOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
          }}
          onGenerateODL={handleGenerateODL}
        />
      )}
    </div>
  );
};

export default Orders;
