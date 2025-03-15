
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, calculateDaysInStock, calculateEstimatedArrival } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CalendarClock, Car, PaintBucket, Fuel, CreditCard, Hash } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Status badge at the top */}
      <div className="flex items-center">
        <Badge className={statusColors[vehicle.status]}>
          {statusTranslations[vehicle.status]}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image section */}
        {!hideImage && (
          <div>
            <img
              src={modelImage || vehicle.imageUrl || "/placeholder.svg"}
              alt={`${vehicle.model} ${vehicle.trim}`}
              className="w-full h-auto rounded-lg object-cover aspect-video"
            />
          </div>
        )}
        
        {/* Details section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{vehicle.trim || vehicle.model}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
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
            
            {vehicle.price && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 font-medium">
                  {formatCurrency(vehicle.price)}
                </span>
              </div>
            )}
            
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
            
            {vehicle.telaio && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{vehicle.telaio}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Accessories section */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Accessori</h3>
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
      
      {/* Telaio section */}
      {vehicle.telaio && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Telaio</h3>
            <p className="text-gray-700">{vehicle.telaio}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Admin actions */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2 mt-4">
          {onEdit && (
            <Button 
              onClick={onEdit}
              variant="outline"
              size="sm"
            >
              Modifica
            </Button>
          )}
          {onDelete && (
            <Button 
              onClick={onDelete}
              variant="destructive"
              size="sm"
            >
              Elimina
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsContent;
