
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VirtualReservationPriceProps {
  calculatedPrice: number;
  priceComponents: {
    basePrice?: number;
    trimPrice?: number;
    fuelTypeAdjustment?: number;
    colorAdjustment?: number;
    transmissionAdjustment?: number;
    accessoriesPrice?: number;
  };
}

const VirtualReservationPrice: React.FC<VirtualReservationPriceProps> = ({ 
  calculatedPrice,
  priceComponents 
}) => {
  const formatPrice = (price: number | undefined): string => {
    if (price === undefined) return "€0";
    return `€${price}`;
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Prezzo Configurazione</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {priceComponents.basePrice !== undefined && (
            <div className="flex justify-between">
              <span>Prezzo Base:</span>
              <span className="font-medium">{formatPrice(priceComponents.basePrice)}</span>
            </div>
          )}
          
          {priceComponents.trimPrice !== undefined && (
            <div className="flex justify-between">
              <span>Allestimento:</span>
              <span className="font-medium">{formatPrice(priceComponents.trimPrice)}</span>
            </div>
          )}
          
          {priceComponents.fuelTypeAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Alimentazione:</span>
              <span className="font-medium">{formatPrice(priceComponents.fuelTypeAdjustment)}</span>
            </div>
          )}
          
          {priceComponents.colorAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Colore:</span>
              <span className="font-medium">{formatPrice(priceComponents.colorAdjustment)}</span>
            </div>
          )}
          
          {priceComponents.transmissionAdjustment !== undefined && (
            <div className="flex justify-between">
              <span>Cambio:</span>
              <span className="font-medium">{formatPrice(priceComponents.transmissionAdjustment)}</span>
            </div>
          )}
          
          {priceComponents.accessoriesPrice !== undefined && priceComponents.accessoriesPrice > 0 && (
            <div className="flex justify-between">
              <span>Accessori:</span>
              <span className="font-medium">{formatPrice(priceComponents.accessoriesPrice)}</span>
            </div>
          )}
          
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-bold">Prezzo Totale:</span>
            <span className="font-bold">{formatPrice(calculatedPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualReservationPrice;
