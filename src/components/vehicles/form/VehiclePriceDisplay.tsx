
import React from 'react';

interface VehiclePriceDisplayProps {
  calculatedPrice: number;
  priceComponents?: any;
}

const VehiclePriceDisplay = ({ calculatedPrice, priceComponents }: VehiclePriceDisplayProps) => {
  return (
    <div className="border p-4 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Prezzo di Listino</h3>
      
      {priceComponents && Object.keys(priceComponents).length > 0 && (
        <div className="text-sm text-gray-600 mb-2 space-y-1">
          {priceComponents.baseModelPrice !== undefined && (
            <div className="flex justify-between">
              <span>Prezzo base modello:</span>
              <span>€{priceComponents.baseModelPrice.toLocaleString('it-IT')}</span>
            </div>
          )}
          
          {priceComponents.trimPrice !== undefined && (
            <div className="flex justify-between">
              <span>Prezzo allestimento:</span>
              <span>+€{priceComponents.trimPrice.toLocaleString('it-IT')}</span>
            </div>
          )}
          
          {priceComponents.fuelTypeAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Alimentazione:</span>
              <span>{priceComponents.fuelTypeAdjustment >= 0 ? '+' : ''}€{priceComponents.fuelTypeAdjustment.toLocaleString('it-IT')}</span>
            </div>
          )}
          
          {priceComponents.colorAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Colore:</span>
              <span>{priceComponents.colorAdjustment >= 0 ? '+' : ''}€{priceComponents.colorAdjustment.toLocaleString('it-IT')}</span>
            </div>
          )}
          
          {priceComponents.transmissionAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Cambio:</span>
              <span>{priceComponents.transmissionAdjustment >= 0 ? '+' : ''}€{priceComponents.transmissionAdjustment.toLocaleString('it-IT')}</span>
            </div>
          )}
          
          {priceComponents.accessoriesAdjustment !== undefined && priceComponents.accessoriesAdjustment > 0 && (
            <div className="flex justify-between">
              <span>Accessori:</span>
              <span>+€{priceComponents.accessoriesAdjustment.toLocaleString('it-IT')}</span>
            </div>
          )}
          
          <div className="border-t pt-1 mt-1"></div>
        </div>
      )}
      
      <div className="flex justify-between text-lg font-semibold">
        <span>Prezzo Totale:</span>
        <span>€{calculatedPrice.toLocaleString('it-IT')}</span>
      </div>
    </div>
  );
};

export default VehiclePriceDisplay;
