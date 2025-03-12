
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';

interface QuotePriceSummaryProps {
  basePrice: number;
  accessoryTotalPrice: number;
  finalPrice: number;
  watchReducedVAT?: boolean;
  totalDiscount: number;
  roadPreparationFee?: number;
}

const QuotePriceSummary: React.FC<QuotePriceSummaryProps> = ({ 
  basePrice, 
  accessoryTotalPrice, 
  finalPrice,
  watchReducedVAT,
  totalDiscount,
  roadPreparationFee = 400 // Default to €400
}) => {
  const form = useFormContext();
  const discount = form.watch('discount') || 0;
  const hasTradeIn = form.watch('hasTradeIn');
  const tradeInValue = form.watch('tradeInValue') || 0;
  
  return (
    <div className="pt-2 border-t">
      <div className="grid grid-cols-4 gap-2 border p-2 rounded-md bg-gray-50">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Prezzo Veicolo</p>
          <p className="font-medium text-sm">{formatCurrency(basePrice)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Optional Aggiunti</p>
          <p className="font-medium text-sm">+ {formatCurrency(accessoryTotalPrice)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Sconto</p>
          <p className="font-medium text-sm">- {formatCurrency(discount)}</p>
        </div>
        
        {hasTradeIn && tradeInValue > 0 && (
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">Valore Permuta</p>
            <p className="font-medium text-sm">- {formatCurrency(tradeInValue)}</p>
          </div>
        )}
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Messa su strada</p>
          <p className="font-medium text-sm">+ {formatCurrency(roadPreparationFee)}</p>
        </div>
        
        <div className="space-y-0.5 col-span-2">
          <p className="text-xs text-gray-500 font-semibold">Prezzo Finale (IVA inclusa)</p>
          <p className="font-bold text-sm text-primary">
            {formatCurrency(finalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotePriceSummary;
