
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, calculateDaysInStock } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
  onCreateQuote: () => void;
  onReserveVehicle: () => void;
  onReserveVirtualVehicle: () => void;
}

const VehicleDetailsContent = ({ 
  vehicle, 
  onCreateQuote, 
  onReserveVehicle,
  onReserveVirtualVehicle
}: VehicleDetailsContentProps) => {
  // Check if vehicle is in virtual stock
  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  
  // Calculate days in stock if vehicle is in physical stock
  const daysInStock = vehicle.location !== 'Stock Virtuale' ? calculateDaysInStock(vehicle.dateAdded) : null;
  
  return (
    <div className="mt-2">
      <div className="grid grid-cols-6 gap-2 mt-2 text-sm">
        <div>
          <p className="text-xs font-medium text-gray-500">Modello</p>
          <p>{vehicle.model}</p>
        </div>
        {!isVirtualStock && (
          <>
            <div>
              <p className="text-xs font-medium text-gray-500">Allestimento</p>
              <p>{vehicle.trim}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Alimentazione</p>
              <p>{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Colore</p>
              <p>{vehicle.exteriorColor}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Prezzo</p>
              <p className="font-bold text-primary">
                {formatCurrency(vehicle.price)}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-xs font-medium text-gray-500">Ubicazione</p>
          <p>{vehicle.location}</p>
        </div>
        {!isVirtualStock && vehicle.transmission && (
          <div>
            <p className="text-xs font-medium text-gray-500">Cambio</p>
            <p>{vehicle.transmission}</p>
          </div>
        )}
        {daysInStock !== null && (
          <div>
            <p className="text-xs font-medium text-gray-500">Giorni in Stock</p>
            <div className="flex items-center gap-1">
              <span>{daysInStock}</span>
              <div className={`h-3 w-3 rounded-full ${
                daysInStock <= 30 ? 'bg-green-500' : 
                daysInStock <= 60 ? 'bg-amber-500' : 
                'bg-red-500'
              }`}></div>
            </div>
          </div>
        )}
        {vehicle.reservedBy && (
          <div>
            <p className="text-xs font-medium text-gray-500">Prenotato da</p>
            <p>{vehicle.reservedBy}</p>
          </div>
        )}
      </div>
      
      {!isVirtualStock && vehicle.accessories && vehicle.accessories.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500">Optional Inclusi</p>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {vehicle.accessories.map((accessory, idx) => (
              <div key={idx} className="text-xs flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1"></span>
                {accessory}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex gap-4 mt-4">
        {vehicle.status === 'available' ? (
          <>
            {isVirtualStock ? (
              <Button 
                variant="default" 
                className="flex-1"
                onClick={onReserveVirtualVehicle}
              >
                Prenota Virtuale
              </Button>
            ) : (
              <>
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={onCreateQuote}
                >
                  Crea Preventivo
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={onReserveVehicle}
                >
                  Prenota Auto
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="w-full text-center py-2 bg-gray-100 rounded-md text-gray-500">
            {vehicle.status === 'reserved' ? 'Veicolo Prenotato' : 'Veicolo Venduto'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetailsContent;
