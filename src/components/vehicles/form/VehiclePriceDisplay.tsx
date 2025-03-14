
import React from 'react';

interface VehiclePriceDisplayProps {
  calculatedPrice: number;
  priceComponents?: {
    baseModelPrice?: number;
    trimPrice?: number;
    fuelTypeAdjustment?: number;
    colorAdjustment?: number;
    transmissionAdjustment?: number;
  };
}

const VehiclePriceDisplay = ({ calculatedPrice, priceComponents }: VehiclePriceDisplayProps) => {
  return (
    <div className="rounded-lg bg-gray-50 p-4 mt-6">
      {priceComponents && Object.keys(priceComponents).length > 0 && (
        <div className="mb-2 text-sm">
          <h4 className="font-semibold mb-1">Componenti del prezzo:</h4>
          <ul className="space-y-1">
            {priceComponents.baseModelPrice !== undefined && (
              <li className="flex justify-between">
                <span>Prezzo Base Modello:</span>
                <span>€{priceComponents.baseModelPrice.toLocaleString('it-IT')}</span>
              </li>
            )}
            {priceComponents.trimPrice !== undefined && (
              <li className="flex justify-between">
                <span>Prezzo Allestimento:</span>
                <span>€{priceComponents.trimPrice.toLocaleString('it-IT')}</span>
              </li>
            )}
            {priceComponents.fuelTypeAdjustment !== undefined && (
              <li className="flex justify-between">
                <span>Aggiustamento Motore:</span>
                <span>€{priceComponents.fuelTypeAdjustment.toLocaleString('it-IT')}</span>
              </li>
            )}
            {priceComponents.colorAdjustment !== undefined && (
              <li className="flex justify-between">
                <span>Aggiustamento Colore:</span>
                <span>€{priceComponents.colorAdjustment.toLocaleString('it-IT')}</span>
              </li>
            )}
            {priceComponents.transmissionAdjustment !== undefined && (
              <li className="flex justify-between">
                <span>Aggiustamento Cambio:</span>
                <span>€{priceComponents.transmissionAdjustment.toLocaleString('it-IT')}</span>
              </li>
            )}
          </ul>
        </div>
      )}
      <div className="text-lg font-semibold flex justify-between items-center">
        <span>Prezzo di Listino Calcolato:</span>
        <span className="text-xl">€{calculatedPrice.toLocaleString('it-IT')}</span>
      </div>
    </div>
  );
};

export default VehiclePriceDisplay;
