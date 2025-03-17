
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
  roadPreparationFee = 350 // Default to €350
}) => {
  const form = useFormContext();
  const discount = form.watch('discount') || 0;
  const licensePlateBonus = form.watch('licensePlateBonus') || 0;
  const tradeInBonus = form.watch('tradeInBonus') || 0;
  const safetyKit = form.watch('safetyKit') || 0;
  const hasTradeIn = form.watch('hasTradeIn');
  const tradeInValue = form.watch('tradeInValue') || 0;
  const accessories = form.watch('accessories') || [];
  
  return (
    <div>
      <h3 className="text-md font-semibold mb-4">Prezzo Finale</h3>
      
      {/* Price breakdown in a more structured format */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm">Prezzo Veicolo</span>
          <span className="font-medium">{formatCurrency(basePrice)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Sconto</span>
          <span className="font-medium text-red-600">- {formatCurrency(discount)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Premio Targa</span>
          <span className="font-medium text-red-600">- {formatCurrency(licensePlateBonus)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Premio Permuta</span>
          <span className="font-medium text-red-600">- {formatCurrency(tradeInBonus)}</span>
        </div>
        
        {hasTradeIn && (
          <div className="flex justify-between">
            <span className="text-sm">Valore Permuta</span>
            <span className="font-medium text-red-600">- {formatCurrency(tradeInValue)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-sm">Kit Sicurezza</span>
          <span className="font-medium text-green-600">+ {formatCurrency(safetyKit)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Messa su strada</span>
          <span className="font-medium text-green-600">+ {formatCurrency(roadPreparationFee)}</span>
        </div>
        
        {accessoryTotalPrice > 0 || accessories.length > 0 && (
          <div className="flex justify-between">
            <span className="text-sm">Optional Aggiunti</span>
            <span className="font-medium text-green-600">+ {formatCurrency(accessoryTotalPrice)}</span>
          </div>
        )}
      </div>
      
      {/* Final price - with blue background */}
      <div className="bg-blue-900 py-3 px-4 rounded">
        <p className="text-sm text-white font-semibold text-center">Prezzo Finale - Chiavi in mano</p>
        <p className="font-bold text-xl text-white text-center">
          {formatCurrency(finalPrice)}
        </p>
        {watchReducedVAT && (
          <p className="text-xs text-white text-center mt-1">
            IVA agevolata 4% inclusa
          </p>
        )}
      </div>
    </div>
  );
};

export default QuotePriceSummary;
