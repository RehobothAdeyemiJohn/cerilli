import React from 'react';
import { Order } from '@/types';
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
import { Check, X, Printer } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  error: any;
  isAdmin: boolean;
  showAdminColumns: boolean;
  tabName: string;
  processingOrders: Order[];
  deliveredOrders: Order[];
  cancelledOrders: Order[];
  onViewDetails: (order: Order) => void;
  onMarkAsDelivered: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteClick: (orderId: string) => void;
  onDeleteConfirm: () => void;
  onPrintOrder: (order: Order) => void;
  isDealer: boolean;
  markAsDeliveredPending: boolean;
  cancelOrderPending: boolean;
  deleteOrderPending: boolean;
}

const OrdersTable = ({
  orders,
  isLoading,
  error,
  isAdmin,
  showAdminColumns,
  tabName,
  processingOrders,
  deliveredOrders,
  cancelledOrders,
  onViewDetails,
  onMarkAsDelivered,
  onCancelOrder,
  onDeleteClick,
  onDeleteConfirm,
  onPrintOrder,
  isDealer,
  markAsDeliveredPending,
  cancelOrderPending,
  deleteOrderPending
}: OrdersTableProps) => {
  
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

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.orderDate || 0).getTime();
    const dateB = new Date(b.orderDate || 0).getTime();
    return dateA - dateB;
  });

  const getOrderNumber = (order: Order): string => {
    const index = sortedOrders.findIndex(o => o.id === order.id);
    return `#${(index + 1).toString().padStart(3, '0')}`;
  };

  const getCreditColorClass = (creditLimit: number) => {
    return 'text-green-600';
  };

  React.useEffect(() => {
    orders.forEach((order) => {
      if (order.status === 'delivered' && order.vehicle) {
        console.log(`Delivered vehicle for order ${order.id}: ${order.vehicle.model}, Price: ${order.vehicle.price}`);
      }
    });
  }, [orders]);

  return (
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
              
              {showAdminColumns && isAdmin && (
                <>
                  <TableHead>Targabile</TableHead>
                  <TableHead>Proformata</TableHead>
                  <TableHead>Saldata</TableHead>
                  <TableHead>Fatturata</TableHead>
                  <TableHead>Conformità</TableHead>
                  <TableHead>Plafond</TableHead>
                </>
              )}
              
              {isDealer && (
                <>
                  <TableHead>Proformata</TableHead>
                  <TableHead>Saldata</TableHead>
                  <TableHead>Fatturata</TableHead>
                  <TableHead>Plafond</TableHead>
                </>
              )}
              
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={showAdminColumns && isAdmin ? 13 : isDealer ? 10 : 7} className="text-center py-10">
                  Caricamento ordini...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={showAdminColumns && isAdmin ? 13 : isDealer ? 10 : 7} className="text-center py-10 text-red-500">
                  Errore durante il caricamento degli ordini.
                </TableCell>
              </TableRow>
            ) : sortedOrders.length > 0 ? (
              sortedOrders.map((order) => {
                const vehicleInfo = order.vehicle ? 
                  `${order.vehicle.model} ${order.vehicle.trim || ''}` : 
                  'Veicolo non disponibile';
                
                const orderNumber = getOrderNumber(order);
                
                const canDeliverOrder = order.status === 'processing' && (order.details?.odlGenerated === true);
                
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
                    
                    {showAdminColumns && isAdmin && (
                      <>
                        <TableCell>
                          {order.details?.isLicensable === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.hasProforma === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.isPaid === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.isInvoiced === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.hasConformity === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600">
                            {new Intl.NumberFormat('it-IT', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(300000)}
                          </span>
                        </TableCell>
                      </>
                    )}
                    
                    {isDealer && (
                      <>
                        <TableCell>
                          {order.details?.hasProforma === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.isPaid === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {order.details?.isInvoiced === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600">
                            {new Intl.NumberFormat('it-IT', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(300000)}
                          </span>
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => onViewDetails(order)}
                        >
                          Visualizza
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
                          onClick={() => onPrintOrder(order)}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Stampa ordine
                        </Button>
                        
                        {!isDealer && order.status === 'processing' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
                              onClick={() => onMarkAsDelivered(order.id)}
                              disabled={markAsDeliveredPending || !canDeliverOrder}
                              title={!canDeliverOrder ? "Genera ODL prima di consegnare" : ""}
                            >
                              Consegnato
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
                                onClick={() => onDeleteClick(order.id)}
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
                                  onClick={onDeleteConfirm}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={deleteOrderPending}
                                >
                                  {deleteOrderPending ? 'Eliminazione...' : 'Elimina'}
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
                <TableCell colSpan={showAdminColumns && isAdmin ? 13 : isDealer ? 10 : 7} className="text-center py-10 text-gray-500">
                  Nessun ordine trovato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersTable;
