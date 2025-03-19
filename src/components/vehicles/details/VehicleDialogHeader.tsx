
import React from 'react';
import { Vehicle } from '@/types';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingCart, Ban, Package } from 'lucide-react';

interface VehicleDialogHeaderProps {
  vehicle: Vehicle;
  onDuplicate?: () => void;
  onCreateQuote?: (() => void) | ((vehicle: Vehicle) => void);
  onReserve?: () => void;
  onCancelReservation?: () => void;
  onCreateOrder?: () => void;
  isDealer?: boolean;
  isVirtualStock?: boolean;
  isDealerStock?: boolean;
}

const VehicleDialogHeader = ({ 
  vehicle,
  onDuplicate,
  onCreateQuote,
  onReserve,
  onCancelReservation,
  onCreateOrder,
  isDealer,
  isVirtualStock,
  isDealerStock
}: VehicleDialogHeaderProps) => {
  const getDialogTitle = () => {
    if (vehicle.status === 'reserved') {
      return (
        <div className="flex items-center gap-2">
          <span>{vehicle.model} {vehicle.trim}</span>
          <span className="text-sm font-normal px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
            Prenotato
          </span>
        </div>
      );
    }
    return vehicle.model + (vehicle.trim ? ` ${vehicle.trim}` : '');
  };
  
  const handleCreateQuote = () => {
    if (onCreateQuote) {
      if (typeof onCreateQuote === 'function') {
        // Check if the function expects a vehicle parameter
        if (onCreateQuote.length > 0) {
          onCreateQuote(vehicle);
        } else {
          (onCreateQuote as () => void)();
        }
      }
    }
  };
  
  return (
    <>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogDescription className="flex flex-wrap gap-2 mt-2">
        {onDuplicate && (
          <Button variant="outline" size="sm" onClick={onDuplicate} className="h-8">
            Duplica
          </Button>
        )}
        
        {onCreateQuote && !isVirtualStock && (
          <Button variant="outline" size="sm" onClick={handleCreateQuote} className="h-8 text-green-600 border-green-200 hover:bg-green-50">
            <FileText className="h-4 w-4 mr-1" /> Crea Preventivo
          </Button>
        )}
        
        {onReserve && (
          <Button variant="outline" size="sm" onClick={onReserve} className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
            <ShoppingCart className="h-4 w-4 mr-1" /> Prenota
          </Button>
        )}
        
        {onCancelReservation && (
          <Button variant="outline" size="sm" onClick={onCancelReservation} className="h-8 text-orange-600 border-orange-200 hover:bg-orange-50">
            <Ban className="h-4 w-4 mr-1" /> Annulla Prenotazione
          </Button>
        )}
        
        {onCreateOrder && (
          <Button variant="outline" size="sm" onClick={onCreateOrder} className="h-8 text-purple-600 border-purple-200 hover:bg-purple-50">
            <Package className="h-4 w-4 mr-1" /> Crea Ordine
          </Button>
        )}
      </DialogDescription>
    </>
  );
};

export default VehicleDialogHeader;
