
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
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Componenti del prezzo:</h4>
          <div className="space-y-1">
            {priceComponents.baseModelPrice !== undefined && (
              <div className="flex justify-between">
                <span>Prezzo Base Modello:</span>
                <span className="font-medium">€{priceComponents.baseModelPrice.toLocaleString('it-IT')}</span>
              </div>
            )}
            {priceComponents.trimPrice !== undefined && (
              <div className="flex justify-between">
                <span>Prezzo Allestimento:</span>
                <span className="font-medium">€{priceComponents.trimPrice.toLocaleString('it-IT')}</span>
              </div>
            )}
            {priceComponents.fuelTypeAdjustment !== undefined && (
              <div className="flex justify-between">
                <span>Aggiustamento Motore:</span>
                <span className="font-medium">€{priceComponents.fuelTypeAdjustment.toLocaleString('it-IT')}</span>
              </div>
            )}
            {priceComponents.colorAdjustment !== undefined && (
              <div className="flex justify-between">
                <span>Aggiustamento Colore:</span>
                <span className="font-medium">€{priceComponents.colorAdjustment.toLocaleString('it-IT')}</span>
              </div>
            )}
            {priceComponents.transmissionAdjustment !== undefined && (
              <div className="flex justify-between">
                <span>Aggiustamento Cambio:</span>
                <span className="font-medium">€{priceComponents.transmissionAdjustment.toLocaleString('it-IT')}</span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="font-semibold border-t pt-2">
        <div className="flex justify-between items-center">
          <span>Prezzo di Listino Calcolato:</span>
          <span className="text-xl">€{calculatedPrice.toLocaleString('it-IT')}</span>
        </div>
      </div>
    </div>
  );
};

export default VehiclePriceDisplay;
