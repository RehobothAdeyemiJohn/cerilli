
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, calculateDaysInStock, calculateEstimatedArrival } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CalendarClock, Car, PaintBucket, Fuel, CreditCard, FileCheck, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { modelsApi } from '@/api/localStorage';

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

  console.log("VehicleDetailsContent props:", { 
    onReserve: Boolean(onReserve), 
    onCreateQuote: Boolean(onCreateQuote), 
    status: vehicle.status, 
    isVirtualStock, 
    model: vehicle.model,
    availability: vehicle.status === 'available'
  });

  return (
    <div className="space-y-6">
      {/* Header with title, badge */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{vehicle.model}</h2>
            <Badge className={statusColors[vehicle.status]}>
              {statusTranslations[vehicle.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Action buttons - Spostati qui prima del contenuto principale ma dopo l'header */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white py-3 border rounded-md shadow-sm p-3">
        {onReserve && (
          <Button 
            onClick={onReserve}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base w-full sm:w-auto"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-1" />
            Prenota
          </Button>
        )}
        
        {onCreateQuote && !isVirtualStockVehicle && (
          <Button 
            onClick={onCreateQuote}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-base w-full sm:w-auto"
            size="lg"
          >
            <FileCheck className="h-5 w-5 mr-1" />
            Crea Preventivo
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {!hideImage && (
          <div className="md:w-1/2">
            <img
              src={modelImage || vehicle.imageUrl || "/placeholder.svg"}
              alt={`${vehicle.model} ${vehicle.trim}`}
              className="w-full h-auto rounded-lg object-cover aspect-video"
            />
          </div>
        )}
        
        <div className={hideImage ? "w-full" : "md:w-1/2"}>
          <div className="mb-4">
            <h3 className="text-xl">{vehicle.trim}</h3>
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
        <CardContent className="space-y-2 pt-6">
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
          <CardContent className="space-y-2 pt-6">
            <h3 className="text-lg font-semibold">Telaio Precedente</h3>
            <p className="text-gray-700">{vehicle.previousChassis}</p>
          </CardContent>
        </Card>
      )}
      
      {vehicle.telaio && (
        <Card>
          <CardContent className="space-y-2 pt-6">
            <h3 className="text-lg font-semibold">Telaio</h3>
            <p className="text-gray-700">{vehicle.telaio}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Admin action buttons */}
      {(onEdit || onDelete || onClose) && (
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
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Chiudi
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsContent;
