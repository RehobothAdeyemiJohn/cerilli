
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { FileText, Printer, Check, X, Trash2, Truck } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  error: any;
  isAdmin: boolean;
  showAdminColumns: boolean;
  onViewDetails: (order: Order) => void;
  onMarkAsDelivered: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteClick: (orderId: string) => void;
  onPrintOrder: (order: Order) => void;
  onCreateContract?: (order: Order) => void;
  tabName: string;
  processingOrders: Order[];
  deliveredOrders: Order[];
  cancelledOrders: Order[];
  isDealer: boolean;
  markAsDeliveredPending: boolean;
  cancelOrderPending: boolean;
  deleteOrderPending: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  error,
  isAdmin,
  showAdminColumns,
  onViewDetails,
  onMarkAsDelivered,
  onCancelOrder,
  onDeleteClick,
  onPrintOrder,
  tabName,
  processingOrders,
  deliveredOrders,
  cancelledOrders,
  isDealer,
  markAsDeliveredPending,
  cancelOrderPending,
  deleteOrderPending
}) => {
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
    if (a.progressiveNumber && b.progressiveNumber) {
      return a.progressiveNumber - b.progressiveNumber;
    }
    
    const dateA = new Date(a.orderDate || 0).getTime();
    const dateB = new Date(b.orderDate || 0).getTime();
    return dateA - dateB;
  });

  const getOrderNumber = (order: Order): string => {
    if (order.progressiveNumber) {
      return `#${order.progressiveNumber.toString().padStart(3, '0')}`;
    }
    
    const index = sortedOrders.findIndex(o => o.id === order.id);
    return `#${(index + 1).toString().padStart(3, '0')}`;
  };

  React.useEffect(() => {
    orders.forEach((order) => {
      console.log(`OrdersTable - Ordine ${order.id}:`, order);
      console.log(`OrdersTable - Plafond dealer al momento dell'ordine:`, order.plafondDealer);
    });
  }, [orders]);

  const renderOrderActions = (order: Order) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPrintOrder(order)}
          className="h-8"
        >
          <Printer className="h-4 w-4 mr-1" />
          Anteprima
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(order)}
          className="h-8"
        >
          <FileText className="h-4 w-4 mr-1" />
          APRI ORDINE
        </Button>
        
        {order.status === 'processing' && order.odlGenerated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkAsDelivered(order.id)}
            disabled={markAsDeliveredPending}
            className="h-8 bg-green-100 hover:bg-green-200 text-green-800"
            title={!order.odlGenerated ? "Genera prima l'ODL" : "Marca come consegnato"}
          >
            <Truck className="h-4 w-4 mr-1" />
            Consegna
          </Button>
        )}
        
        {order.status === 'processing' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancelOrder(order.id)}
            disabled={cancelOrderPending}
            className="h-8 bg-red-100 hover:bg-red-200 text-red-800"
          >
            <X className="h-4 w-4 mr-1" />
            Annulla
          </Button>
        )}
        
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteClick(order.id)}
            disabled={deleteOrderPending}
            className="h-8 bg-gray-100 hover:bg-gray-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const renderCheckIcon = (value: boolean | undefined) => {
    return value ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />;
  };

  const renderPlafondColumn = (order: Order) => {
    // Use the plafond stored in the order at creation time
    if (order.plafondDealer !== undefined && order.plafondDealer !== null) {
      // Set color based on plafond value
      let colorClass = "text-gray-800";
      const plafond = order.plafondDealer;
      
      if (plafond > 80000) {
        colorClass = "text-green-600 font-medium";
      } else if (plafond < 20000) {
        colorClass = "text-red-600 font-medium";
      } else if (plafond < 50000) {
        colorClass = "text-orange-500 font-medium";
      }
      
      return <span className={colorClass}>{formatCurrency(plafond)}</span>;
    }
    
    // Fallback to dealer's current plafond if order plafond is not available
    if (order.dealer?.creditLimit !== undefined) {
      return formatCurrency(order.dealer.creditLimit);
    }
    
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ordine</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Plafond Dealer</TableHead>
              <TableHead>Veicolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Data Ordine</TableHead>
              <TableHead>Data Consegna</TableHead>
              <TableHead className="text-center">Targabile</TableHead>
              <TableHead className="text-center">Proforma</TableHead>
              <TableHead className="text-center">Saldata</TableHead>
              <TableHead className="text-center">Fatturata</TableHead>
              <TableHead className="text-center">Conformità</TableHead>
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
                const vehicleInfo = order.modelName || (order.vehicle ? `${order.vehicle.model} ${order.vehicle.trim || ''}` : 'Veicolo non disponibile');
                
                const orderNumber = getOrderNumber(order);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.progressiveNumber?.toString().padStart(3, '0') || '???'}</TableCell>
                    <TableCell>{order.dealerName || order.dealer?.companyName || order.customerName}</TableCell>
                    <TableCell>{renderPlafondColumn(order)}</TableCell>
                    <TableCell>{vehicleInfo}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status === 'processing'
                          ? 'In Lavorazione'
                          : order.status === 'delivered'
                          ? 'Consegnato'
                          : 'Cancellato'}
                      </span>
                    </TableCell>
                    <TableCell>{order.orderDate ? formatDate(new Date(order.orderDate)) : '-'}</TableCell>
                    <TableCell>{order.deliveryDate ? formatDate(new Date(order.deliveryDate)) : '-'}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(order.isLicensable)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(order.hasProforma)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(order.isPaid)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(order.isInvoiced)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(order.hasConformity)}</TableCell>
                    <TableCell>{renderOrderActions(order)}</TableCell>
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
