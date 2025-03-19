import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order, OrderDetails } from '@/types';
import { formatDate } from '@/lib/utils';
import OrderDetailsForm from './OrderDetailsForm';
import { formatPlafond } from '@/hooks/orders/useOrdersModels';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onGenerateODL: (details: OrderDetails) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  open,
  onOpenChange,
  order,
  onGenerateODL,
}) => {
  // Verifica se ci sono dettagli del veicolo da mostrare
  const hasVehicleDetails = order?.vehicle !== null;
  const hasAccessories = order?.vehicle?.accessories && order.vehicle.accessories.length > 0;
  const hasReservedAccessories = order?.vehicle?.reservedAccessories && order.vehicle.reservedAccessories.length > 0;
  
  // Dettagli del veicolo
  const renderVehicleDetails = () => {
    if (!hasVehicleDetails) return (
      <div className="mt-4">
        <h3 className="text-sm font-medium">Dettagli Veicolo</h3>
        <p className="text-sm text-muted-foreground">Nessun dettaglio disponibile per questo veicolo</p>
      </div>
    );
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium">Dettagli Veicolo</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Modello:</p>
            <p className="text-sm">{order.vehicle?.model || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Trim:</p>
            <p className="text-sm">{order.vehicle?.trim || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Alimentazione:</p>
            <p className="text-sm">{order.vehicle?.fuelType || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Colore Esterno:</p>
            <p className="text-sm">{order.vehicle?.exteriorColor || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Trasmissione:</p>
            <p className="text-sm">{order.vehicle?.transmission || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Telaio:</p>
            <p className="text-sm">{order.vehicle?.telaio || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Posizione:</p>
            <p className="text-sm">{order.vehicle?.location || 'Non specificato'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Prezzo:</p>
            <p className="text-sm">€{order.vehicle?.price?.toLocaleString() || 'Non specificato'}</p>
          </div>
        </div>
        
        {/* Accessori standard */}
        {hasAccessories && (
          <div className="mt-4">
            <p className="text-sm font-medium">Accessori:</p>
            <ul className="list-disc pl-5 mt-1">
              {order.vehicle?.accessories.map((acc, idx) => (
                <li key={idx} className="text-sm">{acc}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Accessori alla prenotazione */}
        {hasReservedAccessories && (
          <div className="mt-4">
            <p className="text-sm font-medium">Accessori Prenotati:</p>
            <ul className="list-disc pl-5 mt-1">
              {order.vehicle?.reservedAccessories.map((acc, idx) => (
                <li key={idx} className="text-sm">{acc}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Configurazione virtuale se presente */}
        {order.vehicle?.virtualConfig && (
          <div className="mt-4">
            <p className="text-sm font-medium">Configurazione Virtuale:</p>
            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(order.vehicle.virtualConfig, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dettagli Ordine</DialogTitle>
          <DialogDescription>
            Gestisci i dettagli amministrativi dell'ordine
          </DialogDescription>
        </DialogHeader>

        {/* Dettagli Dealer */}
        <div className="mt-4">
          <h3 className="text-sm font-medium">Dettagli Dealer</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Nome Dealer:</p>
              <p className="text-sm">
                {order.dealer?.companyName || order.customerName || 'Non specificato'}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Email:</p>
              <p className="text-sm">{order.dealer?.email || 'Non specificato'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Indirizzo:</p>
              <p className="text-sm">{order.dealer?.address || 'Non specificato'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Città:</p>
              <p className="text-sm">{order.dealer?.city || 'Non specificato'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Plafond Disponibile:</p>
              <p className="text-sm">{formatPlafond(order.dealer)}</p>
            </div>
          </div>
        </div>

        {/* Dettagli Veicolo */}
        {renderVehicleDetails()}
        
        {/* Dettagli Ordine */}
        <OrderDetailsForm orderId={order.id} onGenerateODL={onGenerateODL} />
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
