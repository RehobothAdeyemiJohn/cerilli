
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
import { Check, X } from 'lucide-react';

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

  const getOrderNumber = (index: number): string => {
    return `#${(index + 1).toString().padStart(3, '0')}`;
  };

  const getCreditColorClass = (creditLimit: number) => {
    if (creditLimit >= 60000) return 'text-green-600';
    if (creditLimit >= 40000) return 'text-yellow-600';
    if (creditLimit < 10000) return 'text-red-600';
    return 'text-red-600';
  };

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
              
              {/* Admin sees all columns */}
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
              
              {/* Dealer sees only the requested columns */}
              {isDealer && (
                <>
                  <TableHead>Proformata</TableHead>
                  <TableHead>Saldata</TableHead>
                  <TableHead>Fatturata</TableHead>
                  <TableHead>Plafond</TableHead>
                </>
              )}
              
              {/* Only show Actions column for non-dealers */}
              {!isDealer && (
                <TableHead>Azioni</TableHead>
              )}
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
            ) : orders.length > 0 ? (
              orders.map((order, index) => {
                const vehicleInfo = order.vehicle ? 
                  `${order.vehicle.model} ${order.vehicle.trim || ''}` : 
                  'Veicolo non disponibile';
                
                const orderNumber = getOrderNumber(
                  tabName === 'all' ? index : 
                  tabName === 'processing' ? processingOrders.indexOf(order) :
                  tabName === 'delivered' ? deliveredOrders.indexOf(order) :
                  cancelledOrders.indexOf(order)
                );
                
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
                    
                    {/* Admin sees all columns */}
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
                    
                    {/* Dealer sees only the requested columns */}
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
                    
                    {/* Only show Actions cell for non-dealers */}
                    {!isDealer && (
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
                          
                          {order.status === 'processing' && (
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
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
                                onClick={() => onCancelOrder(order.id)}
                                disabled={cancelOrderPending}
                              >
                                Cancella
                              </Button>
                            </>
                          )}
                          
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
                        </div>
                      </TableCell>
                    )}
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
