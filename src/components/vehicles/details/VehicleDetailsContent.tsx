
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency, calculateDaysInStock } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  
  // Check if vehicle is in virtual stock
  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  
  // Calculate days in stock if vehicle is in physical stock
  // Solo gli amministratori possono vedere la giacenza
  const daysInStock = !isDealer && vehicle.location !== 'Stock Virtuale' 
    ? calculateDaysInStock(vehicle.dateAdded) 
    : null;
  
  // Check if vehicle has a virtual configuration
  const hasVirtualConfig = vehicle.virtualConfig !== undefined;
  
  // Determine if vehicle is reserved and display proper information
  const isReserved = vehicle.status === 'reserved';
  
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
        {isReserved && vehicle.reservedBy && (
          <div className="col-span-2">
            <p className="text-xs font-medium text-gray-500">Prenotato da</p>
            <p className="font-medium text-amber-700">{vehicle.reservedBy}</p>
          </div>
        )}
      </div>
      
      {/* Display reserved accessories if any */}
      {isReserved && vehicle.reservedAccessories && vehicle.reservedAccessories.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-medium text-gray-700">Optional Prenotati</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {vehicle.reservedAccessories.map((accessory, idx) => (
              <div key={idx} className="text-xs flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1"></span>
                {accessory}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Display virtual configuration if any */}
      {isReserved && hasVirtualConfig && (
        <div className="mt-4 border-t pt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Configurazione Virtuale</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-amber-50 p-2 rounded-md">
            {vehicle.virtualConfig?.trim && (
              <div>
                <p className="text-xs font-medium text-gray-500">Allestimento</p>
                <p>{vehicle.virtualConfig.trim}</p>
              </div>
            )}
            {vehicle.virtualConfig?.fuelType && (
              <div>
                <p className="text-xs font-medium text-gray-500">Alimentazione</p>
                <p>{vehicle.virtualConfig.fuelType}</p>
              </div>
            )}
            {vehicle.virtualConfig?.exteriorColor && (
              <div>
                <p className="text-xs font-medium text-gray-500">Colore</p>
                <p>{vehicle.virtualConfig.exteriorColor}</p>
              </div>
            )}
            {vehicle.virtualConfig?.transmission && (
              <div>
                <p className="text-xs font-medium text-gray-500">Cambio</p>
                <p>{vehicle.virtualConfig.transmission}</p>
              </div>
            )}
            {vehicle.virtualConfig?.price && (
              <div>
                <p className="text-xs font-medium text-gray-500">Prezzo configurato</p>
                <p className="font-bold text-primary">{formatCurrency(vehicle.virtualConfig.price)}</p>
              </div>
            )}
          </div>
          
          {/* Display virtual configuration accessories */}
          {vehicle.virtualConfig?.accessories && vehicle.virtualConfig.accessories.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500">Optional Configurati</p>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {vehicle.virtualConfig.accessories.map((accessory, idx) => (
                  <div key={idx} className="text-xs flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1"></span>
                    {accessory}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
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
