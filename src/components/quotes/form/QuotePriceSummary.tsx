
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';

interface QuotePriceSummaryProps {
  basePrice: number;
  accessoryTotalPrice: number;
  finalPrice: number;
  watchReducedVAT?: boolean;
  totalDiscount: number;
}

const QuotePriceSummary: React.FC<QuotePriceSummaryProps> = ({ 
  basePrice, 
  accessoryTotalPrice, 
  finalPrice,
  watchReducedVAT,
  totalDiscount
}) => {
  return (
    <div className="pt-2 border-t">
      <div className="grid grid-cols-4 gap-2 border p-2 rounded-md bg-gray-50">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Prezzo Veicolo {watchReducedVAT ? '(IVA 4%)' : '(IVA 22%)'}</p>
          <p className="font-medium text-sm">{formatCurrency(basePrice)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Optional Aggiunti</p>
          <p className="font-medium text-sm">+ {formatCurrency(accessoryTotalPrice)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Sconto / Permuta</p>
          <p className="font-medium text-sm">- {formatCurrency(totalDiscount)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500 font-semibold">Prezzo Finale</p>
          <p className="font-bold text-sm text-primary">
            {formatCurrency(finalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotePriceSummary;
