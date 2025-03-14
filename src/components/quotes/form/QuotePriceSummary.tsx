
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
  const tradeInHandlingFee = form.watch('tradeInHandlingFee') || 0;
  
  // Calculate VAT rate
  const vatRate = watchReducedVAT ? 0.04 : 0.22;
  
  // Calculate VAT amount on applicable items (everything except trade-in value)
  const vatAmount = watchReducedVAT ? ((basePrice + accessoryTotalPrice - discount + licensePlateBonus + tradeInBonus + roadPreparationFee + safetyKit + (hasTradeIn ? tradeInHandlingFee : 0)) * vatRate) : 0;
  
  return (
    <div className="pt-2 border-t">
      <h3 className="text-md font-semibold mb-2">Prezzo Finale</h3>
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
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Premio Targa</p>
          <p className="font-medium text-sm">+ {formatCurrency(licensePlateBonus)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Premio Permuta</p>
          <p className="font-medium text-sm">+ {formatCurrency(tradeInBonus)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Kit Sicurezza</p>
          <p className="font-medium text-sm">+ {formatCurrency(safetyKit)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Messa su strada</p>
          <p className="font-medium text-sm">+ {formatCurrency(roadPreparationFee)}</p>
        </div>
        
        {hasTradeIn && (
          <>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-500">Valore Permuta</p>
              <p className="font-medium text-sm">- {formatCurrency(tradeInValue)}</p>
            </div>
            
            {tradeInHandlingFee > 0 && (
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500">Gestione Usato</p>
                <p className="font-medium text-sm">+ {formatCurrency(tradeInHandlingFee)}</p>
              </div>
            )}
          </>
        )}
        
        {watchReducedVAT && (
          <div className="space-y-0.5">
            <p className="text-xs text-gray-500">IVA (4%)</p>
            <p className="font-medium text-sm">+ {formatCurrency(vatAmount)}</p>
          </div>
        )}
        
        {/* Final price - larger and highlighted */}
        <div className="col-span-4 text-center mt-3">
          <p className="text-xs text-gray-500 font-semibold">Prezzo Finale - Chiavi in mano</p>
          <p className="font-bold text-xl text-white bg-blue-900 py-1 px-3 rounded inline-block mt-1">
            {formatCurrency(finalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotePriceSummary;
