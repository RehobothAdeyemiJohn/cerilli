
import React from 'react';
import { formatCurrency } from '@/lib/utils';

interface VirtualReservationPriceProps {
  calculatedPrice: number;
}

const VirtualReservationPrice = ({ calculatedPrice }: VirtualReservationPriceProps) => {
  if (calculatedPrice <= 0) {
    return null;
  }
  
  return (
    <div className="py-3 text-right">
      <p className="text-sm text-gray-500">Prezzo Totale:</p>
      <p className="text-lg font-bold text-primary">{formatCurrency(calculatedPrice)}</p>
    </div>
  );
};

export default VirtualReservationPrice;
