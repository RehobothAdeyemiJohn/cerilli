
import React from 'react';
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, InfoIcon, Package, Settings } from 'lucide-react';
import { formatCurrency, calculateEstimatedArrival } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { Plus } from 'lucide-react';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
  onCreateQuote?: () => void;
  onReserveVehicle?: () => void;
  onReserveVirtualVehicle?: () => void;
  onCancelReservation?: () => void;
  onTransformToOrder?: () => void;
  isTransforming?: boolean;
  userCanCreateQuotes?: boolean;
  isSubmitting?: boolean;
}

const VehicleDetailsContent: React.FC<VehicleDetailsContentProps> = ({
  vehicle,
  onCreateQuote,
  onReserveVehicle,
  onReserveVirtualVehicle,
  onCancelReservation,
  onTransformToOrder,
  isTransforming
}) => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  
  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  const isDealerStock = vehicle.location === 'Stock Dealer';
  const estimatedArrival = isVirtualStock ? calculateEstimatedArrival(vehicle) : null;
  
  const getStatusText = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return 'Disponibile';
      case 'reserved': return 'Prenotato';
      case 'sold': return 'Venduto';
      case 'ordered': return 'Ordinato';
      case 'delivered': return 'Consegnato';
      default: return status;
    }
  };
  
  const getStatusBadgeClass = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-amber-100 text-amber-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Placeholder for vehicle image - only show for non-stock vehicles to user preference
  const showImage = !((vehicle.location === 'Stock CMC' || vehicle.location === 'Stock Virtuale') && !isAdmin);
  const imageUrl = vehicle.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
  
  return (
    <div className="pt-6 pb-4 px-4 md:px-6">
      <div className="grid md:grid-cols-[1fr_1fr] gap-6">
        {/* Left Column with Image - only show for certain locations or for admin */}
        {showImage && (
          <div className="rounded overflow-hidden">
            <div
              className="w-full h-48 md:h-64 bg-center bg-cover rounded"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          </div>
        )}
        
        {/* Right Column with Details - adjust to full width if image is hidden */}
        <div className={!showImage ? "col-span-2" : ""}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">{vehicle.model}</h3>
              {!isVirtualStock && <p className="text-gray-500">{vehicle.trim}</p>}
            </div>
            <Badge className={getStatusBadgeClass(vehicle.status)}>
              {getStatusText(vehicle.status)}
            </Badge>
          </div>
          
          <div className="grid gap-3 mt-4">
            <div className="grid grid-cols-2">
              <span className="text-gray-500">Posizione:</span>
              <span>{vehicle.location}</span>
            </div>
            
            {isVirtualStock && isAdmin && vehicle.originalStock && (
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Origine:</span>
                <span>Stock {vehicle.originalStock}</span>
              </div>
            )}
            
            {isVirtualStock && estimatedArrival && (
              <div className="grid grid-cols-2 items-center">
                <span className="text-gray-500 flex items-center gap-1">
                  <CalendarClock className="h-4 w-4" />
                  Data Arrivo:
                </span>
                <span className="font-medium text-primary">
                  {estimatedArrival.formattedRange}
                </span>
              </div>
            )}
            
            {!isVirtualStock && (
              <>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Alimentazione:</span>
                  <span>{vehicle.fuelType}</span>
                </div>
                
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Colore:</span>
                  <span>{vehicle.exteriorColor}</span>
                </div>
                
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Cambio:</span>
                  <span>{vehicle.transmission}</span>
                </div>
                
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Telaio:</span>
                  <span>{vehicle.telaio || 'N/A'}</span>
                </div>
                
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Prezzo:</span>
                  <span className="font-bold text-primary">{formatCurrency(vehicle.price)}</span>
                </div>
              </>
            )}
            
            {vehicle.reservedBy && (
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Prenotato da:</span>
                <span className="font-semibold">{vehicle.reservedBy}</span>
              </div>
            )}
            
            {vehicle.virtualConfig && (
              <div className="mt-2">
                <div className="flex items-center text-primary mb-2">
                  <Settings className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">Configurazione Veicolo</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Allestimento:</span>
                    <span>{vehicle.virtualConfig.trim}</span>
                  </div>
                  
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Alimentazione:</span>
                    <span>{vehicle.virtualConfig.fuelType}</span>
                  </div>
                  
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Colore:</span>
                    <span>{vehicle.virtualConfig.exteriorColor}</span>
                  </div>
                  
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Cambio:</span>
                    <span>{vehicle.virtualConfig.transmission}</span>
                  </div>
                  
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Prezzo:</span>
                    <span className="font-bold text-primary">{formatCurrency(vehicle.virtualConfig.price)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Accessories Section */}
      {((vehicle.accessories && vehicle.accessories.length > 0) || 
         (vehicle.virtualConfig?.accessories && vehicle.virtualConfig.accessories.length > 0)) && (
        <div className="mt-6">
          <h4 className="font-medium flex items-center mb-2">
            <Package className="h-4 w-4 mr-1.5" />
            Accessori
          </h4>
          
          <div className="bg-gray-50 p-3 rounded">
            <ul className="list-disc list-inside space-y-1">
              {!isVirtualStock && vehicle.accessories && vehicle.accessories.map((acc, idx) => (
                <li key={idx} className="text-sm">{acc}</li>
              ))}
              
              {vehicle.virtualConfig?.accessories && vehicle.virtualConfig.accessories.map((acc, idx) => (
                <li key={idx} className="text-sm">{acc}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-3 justify-end">
        {/* Quote Button */}
        {vehicle.status === 'available' && onCreateQuote && (
          <Button onClick={onCreateQuote} className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4" />
            <span>Crea Preventivo</span>
          </Button>
        )}
        
        {/* Reserve Button */}
        {vehicle.status === 'available' && vehicle.location !== 'Stock Virtuale' && (
          <Button 
            onClick={onReserveVehicle} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700" 
          >
            <Plus className="h-4 w-4" />
            <span>Prenota Veicolo</span>
          </Button>
        )}
        
        {/* Reserve Virtual Button */}
        {vehicle.status === 'available' && vehicle.location === 'Stock Virtuale' && (
          <Button 
            onClick={onReserveVirtualVehicle} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Prenota Config. Virtuale</span>
          </Button>
        )}
        
        {/* Cancel Reservation Button - Only for admins */}
        {vehicle.status === 'reserved' && isAdmin && onCancelReservation && (
          <Button variant="destructive" onClick={onCancelReservation}>
            Cancella Prenotazione
          </Button>
        )}
        
        {/* Transform to Order Button - Only for admins */}
        {vehicle.status === 'reserved' && isAdmin && onTransformToOrder && (
          <Button 
            onClick={onTransformToOrder} 
            disabled={isTransforming}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isTransforming ? "Trasformazione..." : "Trasforma in Ordine"}
          </Button>
        )}
      </div>
      
      {/* Add info note for reserved vehicle */}
      {vehicle.status === 'reserved' && (
        <div className="mt-6 pt-4 border-t text-sm text-gray-500 flex items-start">
          <InfoIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <p>
            La prenotazione è valida per 24 ore, dopodiché il veicolo tornerà disponibile nello stock.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsContent;
