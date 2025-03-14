
import React from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Check, Clock, Package, FileCheck, X, Truck, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
  onCreateQuote: () => void;
  onReserveVehicle: () => void;
  onReserveVirtualVehicle: () => void;
  onCancelReservation: () => void;
  onTransformToOrder: () => void;
  userCanCreateQuotes: boolean;
  isSubmitting?: boolean;
}

const VehicleDetailsContent = ({
  vehicle,
  onCreateQuote,
  onReserveVehicle,
  onReserveVirtualVehicle,
  onCancelReservation,
  onTransformToOrder,
  userCanCreateQuotes,
  isSubmitting = false
}: VehicleDetailsContentProps) => {
  console.log("Rendering VehicleDetailsContent with status:", vehicle.status);
  console.log("Transform to order function available:", !!onTransformToOrder);
  
  return (
    <div className="space-y-6">
      {/* Vehicle Basic Info Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Informazioni Veicolo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Modello</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          {vehicle.trim && (
            <div>
              <p className="text-muted-foreground">Versione</p>
              <p className="font-medium">{vehicle.trim}</p>
            </div>
          )}
          {vehicle.fuelType && (
            <div>
              <p className="text-muted-foreground">Alimentazione</p>
              <p className="font-medium">{vehicle.fuelType}</p>
            </div>
          )}
          {vehicle.exteriorColor && (
            <div>
              <p className="text-muted-foreground">Colore Esterno</p>
              <p className="font-medium">{vehicle.exteriorColor}</p>
            </div>
          )}
          {vehicle.transmission && (
            <div>
              <p className="text-muted-foreground">Trasmissione</p>
              <p className="font-medium">{vehicle.transmission}</p>
            </div>
          )}
          {vehicle.telaio && (
            <div>
              <p className="text-muted-foreground">Telaio</p>
              <p className="font-medium">{vehicle.telaio}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Ubicazione</p>
            <p className="font-medium">{vehicle.location}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stato</p>
            <Badge className={`${
              vehicle.status === 'available' ? 'bg-green-500' : 
              vehicle.status === 'reserved' ? 'bg-amber-500' : 
              vehicle.status === 'ordered' ? 'bg-blue-500' : 
              vehicle.status === 'sold' ? 'bg-purple-500' : 'bg-gray-500'
            }`}>
              {vehicle.status === 'available' ? 'Disponibile' : 
               vehicle.status === 'reserved' ? 'Prenotato' : 
               vehicle.status === 'ordered' ? 'Ordinato' : 
               vehicle.status === 'sold' ? 'Venduto' : vehicle.status}
            </Badge>
          </div>
          {vehicle.price > 0 && (
            <div>
              <p className="text-muted-foreground">Prezzo</p>
              <p className="font-medium">{formatCurrency(vehicle.price)}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Accessories Section */}
      {vehicle.accessories && vehicle.accessories.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Accessori</h3>
          <div className="grid grid-cols-1 gap-1">
            {vehicle.accessories.map((accessory, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{accessory}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Reserved Info Section */}
      {vehicle.status === 'reserved' && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Informazioni Prenotazione</h3>
          <div className="grid grid-cols-1 gap-2">
            {vehicle.reservedBy && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Prenotato da: <strong>{vehicle.reservedBy}</strong></span>
              </div>
            )}
            {vehicle.reservationDestination && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-500" />
                <span>Destinazione: <strong>{vehicle.reservationDestination}</strong></span>
              </div>
            )}
            {vehicle.reservationTimestamp && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Data: <strong>{new Date(vehicle.reservationTimestamp).toLocaleDateString()}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Reserved Accessories Section */}
      {vehicle.status === 'reserved' && vehicle.reservedAccessories && vehicle.reservedAccessories.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Accessori Prenotati</h3>
          <div className="grid grid-cols-1 gap-1">
            {vehicle.reservedAccessories.map((accessory, index) => (
              <div key={index} className="flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-500" />
                <span>{accessory}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Separator />
      
      {/* Action Buttons Section */}
      <div className="flex flex-wrap gap-2">
        {/* Quote Button */}
        {vehicle.status === 'available' && userCanCreateQuotes && (
          <Button onClick={onCreateQuote} className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            <span>Crea Preventivo</span>
          </Button>
        )}
        
        {/* Reserve Button */}
        {vehicle.status === 'available' && vehicle.location !== 'Stock Virtuale' && (
          <Button onClick={onReserveVehicle} className="flex items-center gap-2" variant="secondary">
            <Plus className="h-4 w-4" />
            <span>Prenota Veicolo</span>
          </Button>
        )}
        
        {/* Reserve Virtual Button */}
        {vehicle.status === 'available' && vehicle.location === 'Stock Virtuale' && (
          <Button onClick={onReserveVirtualVehicle} className="flex items-center gap-2" variant="secondary">
            <Plus className="h-4 w-4" />
            <span>Prenota Config. Virtuale</span>
          </Button>
        )}
        
        {/* Transform to Order Button */}
        {vehicle.status === 'reserved' && (
          <Button 
            onClick={onTransformToOrder} 
            className="flex items-center gap-2" 
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Elaborazione...</span>
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" />
                <span>Trasforma in Ordine</span>
              </>
            )}
          </Button>
        )}
        
        {/* Cancel Reservation Button */}
        {vehicle.status === 'reserved' && (
          <Button 
            onClick={onCancelReservation} 
            className="flex items-center gap-2" 
            variant="destructive"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
            <span>Cancella Prenotazione</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default VehicleDetailsContent;
