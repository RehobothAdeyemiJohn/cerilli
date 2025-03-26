
import React from 'react';

interface VehiclePriceDisplayProps {
  calculatedPrice: number;
  priceComponents?: any;
}

const VehiclePriceDisplay = ({ calculatedPrice, priceComponents }: VehiclePriceDisplayProps) => {
  // Debug log to see price data
  // console.log("VehiclePriceDisplay - rendering with:", { calculatedPrice, priceComponents });

  // Ensure calculatedPrice is a valid number
  const price = typeof calculatedPrice === 'number' && !isNaN(calculatedPrice) ? calculatedPrice : 0;

  const array: any = ['basePrice', 'trimPrice', 'fuelTypeAdjustment', 'colorAdjustment', 'transmissionAdjustment', 'accessoriesPrice'];

  const calculatePrice = () => {
    let price: any = 0;
    for (const name of array) {
      const item = priceComponents[name]
      if (item && item != undefined) {
        price += item
      }
    }
    return price
  }

  return (
    <div className="border p-4 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Prezzo di Listino</h3>

      {priceComponents && Object.keys(priceComponents).length > 0 && (
        <div className="text-sm text-gray-600 mb-2 space-y-1">
          {priceComponents.basePrice !== undefined && (
            <div className="flex justify-between">
              <span>Prezzo base modello:</span>
              <span>€{priceComponents.basePrice}</span>
            </div>
          )}

          {priceComponents.trimPrice !== undefined && (
            <div className="flex justify-between">
              <span>Prezzo allestimento:</span>
              <span>+€{priceComponents.trimPrice}</span>
            </div>
          )}

          {priceComponents.fuelTypeAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Alimentazione:</span>
              <span>{priceComponents.fuelTypeAdjustment >= 0 ? '+' : ''}€{priceComponents.fuelTypeAdjustment}</span>
            </div>
          )}

          {priceComponents.colorAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Colore:</span>
              <span>{priceComponents.colorAdjustment >= 0 ? '+' : ''}€{priceComponents.colorAdjustment}</span>
            </div>
          )}

          {priceComponents.transmissionAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Cambio:</span>
              <span>{priceComponents.transmissionAdjustment >= 0 ? '+' : ''}€{priceComponents.transmissionAdjustment}</span>
            </div>
          )}

          {priceComponents.accessoriesPrice !== undefined && (
            <div className="flex justify-between">
              <span>Accessori:</span>
              <span>+€{(priceComponents.accessoriesPrice || 0)}</span>
            </div>
          )}

          <div className="border-t pt-1 mt-1"></div>
        </div>
      )}

      <div className="flex justify-between text-lg font-semibold">
        <span>Prezzo Totale Chiavi in Mano:</span>
        <span>€{calculatePrice()}</span>
      </div>
    </div>
  );
};

export default VehiclePriceDisplay;
