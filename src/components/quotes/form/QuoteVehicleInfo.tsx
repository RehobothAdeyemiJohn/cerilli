
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface QuoteVehicleInfoProps {
  vehicle: Vehicle;
}

const QuoteVehicleInfo: React.FC<QuoteVehicleInfoProps> = ({ vehicle }) => {
  return (
    <div className="mb-3 p-2 bg-gray-50 rounded-md">
      <h3 className="font-medium text-base mb-1">Informazioni Veicolo</h3>
      <div className="grid grid-cols-6 gap-2">
        <div>
          <p className="text-xs text-gray-500">Modello</p>
          <p className="font-medium">{vehicle.model}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Allestimento</p>
          <p className="font-medium">{vehicle.trim}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Colore</p>
          <p className="font-medium">{vehicle.exteriorColor}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Prezzo</p>
          <p className="font-medium text-primary">{formatCurrency(vehicle.price)}</p>
        </div>
        {vehicle.transmission && (
          <div>
            <p className="text-xs text-gray-500">Cambio</p>
            <p className="font-medium">{vehicle.transmission}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500">Carburante</p>
          <p className="font-medium">{vehicle.fuelType}</p>
        </div>
      </div>
      
      {vehicle.accessories && vehicle.accessories.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Optional Inclusi</p>
          <div className="grid grid-cols-3 gap-1">
            {vehicle.accessories.map((accessory, idx) => (
              <div key={idx} className="text-xs flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1"></span>
                {accessory}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteVehicleInfo;
