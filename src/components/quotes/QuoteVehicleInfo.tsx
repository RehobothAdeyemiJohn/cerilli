
import React from 'react';
import { Quote, Vehicle } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface QuoteVehicleInfoProps {
  quote: Quote;
  vehicle: Vehicle;
}

const QuoteVehicleInfo = ({ quote, vehicle }: QuoteVehicleInfoProps) => {
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
        <p className="text-xs text-gray-500">Prezzo Veicolo</p>
        <p className="font-medium">{formatCurrency(quote.price)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Prezzo Finale</p>
        <p className="font-medium text-primary">{formatCurrency(quote.finalPrice)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">IVA</p>
        <p className="font-medium">{quote.vatRate === 0.04 ? '4% (agevolata)' : '22%'}</p>
      </div>
    </div>
  );
};

export default QuoteVehicleInfo;
