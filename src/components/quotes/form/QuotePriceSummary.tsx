
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
  
  // Apply VAT adjustment to prices if reduced VAT is enabled
  const applyVatAdjustment = (price: number): number => {
    if (!watchReducedVAT) return price;
    
    // Remove 22% VAT
    const priceWithoutVAT = price / 1.22;
    // Add 4% VAT
    return priceWithoutVAT * 1.04;
  };
  
  // Calculate the applicable tax rate for display
  const vatRate = watchReducedVAT ? 0.04 : 0.22;
  
  // Adjust prices based on VAT rate - except trade-in value which stays the same
  const adjustedBasePrice = applyVatAdjustment(basePrice);
  const adjustedAccessoryPrice = applyVatAdjustment(accessoryTotalPrice);
  const adjustedDiscount = applyVatAdjustment(discount);
  const adjustedLicensePlateBonus = applyVatAdjustment(licensePlateBonus);
  const adjustedTradeInBonus = applyVatAdjustment(tradeInBonus);
  const adjustedSafetyKit = applyVatAdjustment(safetyKit);
  const adjustedRoadPreparationFee = applyVatAdjustment(roadPreparationFee);
  const adjustedTradeInHandlingFee = applyVatAdjustment(tradeInHandlingFee);
  
  // Calculate VAT amount for display (only when reduced VAT is selected)
  const vatAmount = watchReducedVAT ? 
    ((basePrice / 1.22) * vatRate) : 0;
  
  return (
    <div className="pt-2 border-t">
      <h3 className="text-md font-semibold mb-2">Prezzo Finale</h3>
      <div className="grid grid-cols-4 gap-2 border p-2 rounded-md bg-gray-50">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Prezzo Veicolo</p>
          <p className="font-medium text-sm">{formatCurrency(adjustedBasePrice)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Optional Aggiunti</p>
          <p className="font-medium text-sm">+ {formatCurrency(adjustedAccessoryPrice)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Sconto</p>
          <p className="font-medium text-sm">- {formatCurrency(adjustedDiscount)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Premio Targa</p>
          <p className="font-medium text-sm">- {formatCurrency(adjustedLicensePlateBonus)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Premio Permuta</p>
          <p className="font-medium text-sm">- {formatCurrency(adjustedTradeInBonus)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Kit Sicurezza</p>
          <p className="font-medium text-sm">+ {formatCurrency(adjustedSafetyKit)}</p>
        </div>
        
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500">Messa su strada</p>
          <p className="font-medium text-sm">+ {formatCurrency(adjustedRoadPreparationFee)}</p>
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
                <p className="font-medium text-sm">+ {formatCurrency(adjustedTradeInHandlingFee)}</p>
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
        
        {/* Final price - with full width blue background */}
        <div className="col-span-4 mt-3">
          <div className="bg-blue-900 py-2 px-3 rounded w-full">
            <p className="text-xs text-white font-semibold text-center">Prezzo Finale - Chiavi in mano</p>
            <p className="font-bold text-xl text-white text-center">
              {formatCurrency(finalPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePriceSummary;
