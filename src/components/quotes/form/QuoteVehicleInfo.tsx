
import React from 'react';
import { Vehicle } from '@/types';

interface QuoteVehicleInfoProps {
  vehicle: Vehicle;
}

const QuoteVehicleInfo = ({ vehicle }: QuoteVehicleInfoProps) => {
  return (
    <div className="bg-[#e1e1e2] p-4 rounded-md">
      <h3 className="text-md font-semibold mb-2">Informazioni Veicolo</h3>
      <div className="grid grid-cols-1 gap-3">
        {/* Model and Trim in the same row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Modello</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Allestimento</p>
            <p className="font-medium">{vehicle.trim}</p>
          </div>
        </div>
        
        {/* Engine and Color in the same row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Motore</p>
            <p className="font-medium">{vehicle.fuelType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Colore</p>
            <p className="font-medium">{vehicle.exteriorColor}</p>
          </div>
        </div>
        
        {/* Telaio and Price */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Telaio</p>
            <p className="font-medium">{vehicle.telaio || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prezzo</p>
            <p className="font-medium">€ {vehicle.price?.toLocaleString('it-IT') || '0'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteVehicleInfo;
