
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, calculateDaysInStock, calculateEstimatedArrival } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Fuel, Car, PaintBucket, CreditCard, Clock, CalendarClock, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { modelsApi } from '@/api/localStorage';
import { Separator } from '@/components/ui/separator';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
  hideImage?: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<void>;
  onClose?: () => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
}

const VehicleDetailsContent: React.FC<VehicleDetailsContentProps> = ({ 
  vehicle, 
  hideImage,
  onEdit,
  onDelete,
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

  // Fetch model data to get the model image if available
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
  });

  // Find the matching model to get its image
  const modelData = models.find(m => m.name === vehicle.model);
  const modelImage = modelData?.imageUrl;
  
  const isVirtualStockVehicle = vehicle.location === 'Stock Virtuale';
  const daysInStock = !isVirtualStockVehicle ? calculateDaysInStock(vehicle.dateAdded) : null;
  const estimatedArrival = isVirtualStockVehicle ? calculateEstimatedArrival(vehicle) : null;

  return (
    <div className="space-y-4">
      {/* Vehicle image */}
      {!hideImage && (
        <div className="w-full">
          <img
            src={modelImage || vehicle.imageUrl || "/placeholder.svg"}
            alt={`${vehicle.model} ${vehicle.trim}`}
            className="w-full h-auto rounded-lg object-cover aspect-video"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Badge className={statusColors[vehicle.status]}>
          {statusTranslations[vehicle.status]}
        </Badge>
        
        <div className="text-xl font-bold">
          {vehicle.price > 0 && formatCurrency(vehicle.price)}
        </div>
      </div>
      
      {/* Main vehicle details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{vehicle.model} {vehicle.trim}</h3>
          
          <div className="space-y-2">
            {vehicle.fuelType && (
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{vehicle.fuelType}</span>
              </div>
            )}
            
            {vehicle.transmission && (
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{vehicle.transmission}</span>
              </div>
            )}
            
            {vehicle.exteriorColor && (
              <div className="flex items-center gap-2">
                <PaintBucket className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{vehicle.exteriorColor}</span>
              </div>
            )}
            
            {vehicle.telaio && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{vehicle.telaio}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Informazioni</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Posizione: {vehicle.location}</span>
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
            
            {isVirtualStockVehicle && vehicle.originalStock && (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Origine: Stock {vehicle.originalStock}</span>
              </div>
            )}
            
            {vehicle.reservedBy && (
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Riservato per: {vehicle.reservedBy}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Accessories section */}
      {vehicle.accessories && vehicle.accessories.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Accessori</h3>
            <ul className="list-disc pl-5">
              {vehicle.accessories.map((accessory, index) => (
                <li key={index} className="text-gray-700">{accessory}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Admin actions */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 mt-4">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Modifica
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              Elimina
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsContent;
