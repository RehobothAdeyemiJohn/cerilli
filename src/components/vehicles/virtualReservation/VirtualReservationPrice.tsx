
import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface VirtualReservationPriceProps {
  calculatedPrice: number;
  priceComponents?: {
    baseModelPrice?: number;
    trimPrice?: number;
    fuelTypeAdjustment?: number;
    colorAdjustment?: number;
    transmissionAdjustment?: number;
  };
}

const VirtualReservationPrice = ({ calculatedPrice, priceComponents }: VirtualReservationPriceProps) => {
  if (calculatedPrice <= 0) {
    return null;
  }
  
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      {priceComponents && Object.keys(priceComponents).length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Componenti del prezzo:</h4>
          <div className="space-y-1">
            {priceComponents.baseModelPrice !== undefined && (
              <div className="flex justify-between">
                <span>Prezzo Base Modello:</span>
                <span className="font-medium">{formatCurrency(priceComponents.baseModelPrice)}</span>
              </div>
            )}
            {priceComponents.trimPrice !== undefined && (
              <div className="flex justify-between">
                <span>Prezzo Allestimento:</span>
                <span className="font-medium">{formatCurrency(priceComponents.trimPrice)}</span>
              </div>
            )}
            {priceComponents.fuelTypeAdjustment !== undefined && (
              <div className="flex justify-between">
                <span>Aggiustamento Motore:</span>
                <span className="font-medium">{formatCurrency(priceComponents.fuelTypeAdjustment)}</span>
              </div>
            )}
            {priceComponents.colorAdjustment !== undefined && (
              <div className="flex justify-between">
                <span>Aggiustamento Colore:</span>
                <span className="font-medium">{formatCurrency(priceComponents.colorAdjustment)}</span>
              </div>
            )}
            {priceComponents.transmissionAdjustment !== undefined && (
              <div className="flex justify-between">
                <span>Aggiustamento Cambio:</span>
                <span className="font-medium">{formatCurrency(priceComponents.transmissionAdjustment)}</span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="font-semibold border-t pt-2">
        <div className="flex justify-between items-center">
          <span>Prezzo di Listino Calcolato:</span>
          <span className="text-xl">{formatCurrency(calculatedPrice)}</span>
        </div>
      </div>
    </div>
  );
};

export default VirtualReservationPrice;
