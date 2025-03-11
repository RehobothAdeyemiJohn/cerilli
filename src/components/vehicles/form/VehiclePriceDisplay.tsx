
import React from 'react';

interface VehiclePriceDisplayProps {
  calculatedPrice: number;
}

const VehiclePriceDisplay = ({ calculatedPrice }: VehiclePriceDisplayProps) => {
  return (
    <div className="rounded-lg bg-gray-50 p-4 mt-6">
      <div className="text-lg font-semibold flex justify-between items-center">
        <span>Prezzo di Listino Calcolato:</span>
        <span className="text-xl">€{calculatedPrice.toLocaleString('it-IT')}</span>
      </div>
    </div>
  );
};

export default VehiclePriceDisplay;
