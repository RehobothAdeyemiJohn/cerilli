import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase/ordersApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { Order, Vehicle, OrderDetails, Dealer } from '@/types';
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
  Filter,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

  const { data: dealersData = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    staleTime: 0,
    enabled: isAdmin,
  });

  const { 
    data: ordersData = [], 
    isLoading, 
    error,
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    staleTime: 0,
  });

  const filterOrders = (orders: Order[], status?: string) => {
    let filtered = orders;
    
    if (status && status !== 'all') {
      filtered = filtered.filter(o => o.status === status);
    }
    
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

  const processingOrders = filterOrders(ordersData, 'processing');
  const deliveredOrders = filterOrders(ordersData, 'delivered');
  const cancelledOrders = filterOrders(ordersData, 'cancelled');
  const allOrders = filterOrders(ordersData);

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

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const order = await ordersApi.getById(orderId);
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

  const getOrderNumber = (index: number): string => {
    return `#${(index + 1).toString().padStart(3, '0')}`;
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

  const updateBooleanFilter = (key: keyof typeof filters, value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
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

  const getCreditColorClass = (creditLimit: number) => {
    if (creditLimit >= 60000) return 'text-green-600';
    if (creditLimit >= 40000) return 'text-yellow-600';
    if (creditLimit < 10000) return 'text-red-600';
    return 'text-red-600';
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
                  <TableHead>Targabile</TableHead>
                  <TableHead>Proformata</TableHead>
                  <TableHead>Saldata</TableHead>
                  <TableHead>Fatturata</TableHead>
                  <TableHead>Conformità</TableHead>
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
                
                const orderNumber = getOrderNumber(
                  tabName === 'all' ? index : 
                  tabName === 'processing' ? processingOrders.indexOf(order) :
                  tabName === 'delivered' ? deliveredOrders.indexOf(order) :
                  cancelledOrders.indexOf(order)
                );
                
                const canDeliverOrder = order.status === 'processing' && order.details?.odlGenerated;
                
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
                          {order.dealer && order.dealer.credit_limit !== undefined ? (
                            <span className={getCreditColorClass(order.dealer.credit_limit)}>
                              {new Intl.NumberFormat('it-IT', {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0,
                              }).format(order.dealer.credit_limit)}
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

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Ordini</h1>
        
        {isAdmin && (
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtri
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchOrders()}
              title="Ricarica ordini"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isAdmin && showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Targabile</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant={filters.isLicensable === true ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('isLicensable', true)}
                  >
                    Sì
                  </Button>
                  <Button 
                    variant={filters.isLicensable === false ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('isLicensable', false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Proformata</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant={filters.hasProforma === true ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('hasProforma', true)}
                  >
                    Sì
                  </Button>
                  <Button 
                    variant={filters.hasProforma === false ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('hasProforma', false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Saldata</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant={filters.isPaid === true ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('isPaid', true)}
                  >
                    Sì
                  </Button>
                  <Button 
                    variant={filters.isPaid === false ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('isPaid', false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Fatturata</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant={filters.isInvoiced === true ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('isInvoiced', true)}
                  >
                    Sì
                  </Button>
                  <Button 
                    variant={filters.isInvoiced === false ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('isInvoiced', false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Conformità</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant={filters.hasConformity === true ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('hasConformity', true)}
                  >
                    Sì
                  </Button>
                  <Button 
                    variant={filters.hasConformity === false ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateBooleanFilter('hasConformity', false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Modello</h3>
                <Select
                  value={filters.model || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, model: value === "all" ? null : value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona modello" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i modelli</SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Dealer</h3>
                <Select
                  value={filters.dealerId || "all"}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dealerId: value === "all" ? null : value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona dealer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i dealer</SelectItem>
                    {dealersData.map((dealer: Dealer) => (
                      <SelectItem key={dealer.id} value={dealer.id}>{dealer.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mr-2"
            >
              Reimposta filtri
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Applica
            </Button>
          </CardFooter>
        </Card>
      )}
      
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
