
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, calculateDaysInStock, calculateEstimatedArrival } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CalendarClock, Car, PaintBucket, Fuel, CreditCard } from 'lucide-react';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
  hideImage?: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onReserve?: () => void;
  onCreateQuote?: () => void;
  onClose?: () => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
}

const VehicleDetailsContent: React.FC<VehicleDetailsContentProps> = ({ 
  vehicle, 
  hideImage,
  onEdit,
  onDelete,
  onReserve,
  onCreateQuote,
  onClose,
  isDealerStock,
  isVirtualStock
}) => {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-amber-100 text-amber-800',
    ordered: 'bg-blue-100 text-blue-800',
    sold: 'bg-gray-100 text-gray-800',
    delivered: 'bg-purple-100 text-purple-800',
  };

  const statusTranslations = {
    available: 'Disponibile',
    reserved: 'Prenotata',
    ordered: 'Ordinata',
    sold: 'Venduta',
    delivered: 'Consegnata',
  };

  const isVirtualStockVehicle = vehicle.location === 'Stock Virtuale';
  const daysInStock = !isVirtualStockVehicle ? calculateDaysInStock(vehicle.dateAdded) : null;
  const estimatedArrival = isVirtualStockVehicle ? calculateEstimatedArrival(vehicle) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{vehicle.model}</h2>
        <div className="flex gap-2">
          {onReserve && vehicle.status === 'available' && (
            <button
              onClick={onReserve}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Prenota
            </button>
          )}
          {onCreateQuote && vehicle.status === 'available' && (
            <button
              onClick={onCreateQuote}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Crea Preventivo
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Modifica
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Elimina
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Chiudi
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {!hideImage && (
          <div className="md:w-1/2">
            <img
              src={vehicle.imageUrl || "/placeholder.svg"}
              alt={`${vehicle.model} ${vehicle.trim}`}
              className="w-full h-auto rounded-lg object-cover aspect-video"
            />
          </div>
        )}
        
        <div className={hideImage ? "w-full" : "md:w-1/2"}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl">{vehicle.trim}</h3>
              <Badge className={statusColors[vehicle.status]}>
                {statusTranslations[vehicle.status]}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {!isVirtualStockVehicle && (
              <>
                {vehicle.fuelType && (
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{vehicle.fuelType}</span>
                  </div>
                )}
                
                {vehicle.exteriorColor && (
                  <div className="flex items-center gap-2">
                    <PaintBucket className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{vehicle.exteriorColor}</span>
                  </div>
                )}
                
                {vehicle.transmission && (
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{vehicle.transmission}</span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                {isVirtualStockVehicle ? 'Prezzo da configurare' : formatCurrency(vehicle.price)}
              </span>
            </div>
            
            {daysInStock !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{daysInStock} giorni in stock</span>
              </div>
            )}
            
            {isVirtualStockVehicle && estimatedArrival && (
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  Arrivo: {estimatedArrival.formattedRange}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="space-y-2">
          <h3 className="text-lg font-semibold">Accessori</h3>
          {vehicle.accessories && vehicle.accessories.length > 0 ? (
            <ul className="list-disc pl-5">
              {vehicle.accessories.map((accessory, index) => (
                <li key={index} className="text-gray-700">{accessory}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nessun accessorio disponibile.</p>
          )}
        </CardContent>
      </Card>
      
      {vehicle.previousChassis && (
        <Card>
          <CardContent className="space-y-2">
            <h3 className="text-lg font-semibold">Telaio Precedente</h3>
            <p className="text-gray-700">{vehicle.previousChassis}</p>
          </CardContent>
        </Card>
      )}
      
      {vehicle.telaio && (
        <Card>
          <CardContent className="space-y-2">
            <h3 className="text-lg font-semibold">Telaio</h3>
            <p className="text-gray-700">{vehicle.telaio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleDetailsContent;
