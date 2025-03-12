
import React from 'react';
import { Vehicle } from '@/types';

interface QuoteVehicleInfoProps {
  vehicle: Vehicle;
}

const QuoteVehicleInfo = ({ vehicle }: QuoteVehicleInfoProps) => {
  return (
    <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 rounded-md">
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
        <p className="text-xs text-gray-500">Motore</p>
        <p className="font-medium">{vehicle.fuelType}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Telaio</p>
        <p className="font-medium">{vehicle.telaio || 'N/A'}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Prezzo</p>
        <p className="font-medium">€ {vehicle.price?.toLocaleString('it-IT') || '0'}</p>
      </div>
    </div>
  );
};

export default QuoteVehicleInfo;
