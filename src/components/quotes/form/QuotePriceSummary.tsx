
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
  const licensePlateBonus = form.watch('licensePlateBonus') || 0;
  const tradeInBonus = form.watch('tradeInBonus') || 0;
  const safetyKit = form.watch('safetyKit') || 0;
  const hasTradeIn = form.watch('hasTradeIn');
  const tradeInValue = form.watch('tradeInValue') || 0;
  
  return (
    <div>
      <h3 className="text-md font-semibold mb-4">Prezzo Finale</h3>
      
      {/* Price breakdown grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-sm">Prezzo Veicolo</p>
          <p className="font-medium">{formatCurrency(basePrice)}</p>
        </div>
        
        <div>
          <p className="text-sm">Optional Aggiunti</p>
          <p className="font-medium">+ {formatCurrency(accessoryTotalPrice)}</p>
        </div>
        
        <div>
          <p className="text-sm">Sconto</p>
          <p className="font-medium">- {formatCurrency(discount)}</p>
        </div>
        
        <div>
          <p className="text-sm">Premio Targa</p>
          <p className="font-medium">- {formatCurrency(licensePlateBonus)}</p>
        </div>
        
        <div>
          <p className="text-sm">Premio Permuta</p>
          <p className="font-medium">- {formatCurrency(tradeInBonus)}</p>
        </div>
        
        <div>
          <p className="text-sm">Kit Sicurezza</p>
          <p className="font-medium">+ {formatCurrency(safetyKit)}</p>
        </div>
        
        <div>
          <p className="text-sm">Messa su strada</p>
          <p className="font-medium">+ {formatCurrency(roadPreparationFee)}</p>
        </div>
        
        {hasTradeIn && (
          <div>
            <p className="text-sm">Valore Permuta</p>
            <p className="font-medium">- {formatCurrency(tradeInValue)}</p>
          </div>
        )}
      </div>
      
      {/* Final price - with blue background */}
      <div className="bg-blue-900 py-3 px-4 rounded">
        <p className="text-sm text-white font-semibold text-center">Prezzo Finale - Chiavi in mano</p>
        <p className="font-bold text-xl text-white text-center">
          {formatCurrency(finalPrice)}
        </p>
      </div>
    </div>
  );
};

export default QuotePriceSummary;
