
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
  roadPreparationFee = 400 // Default value is 400 euros
}) => {
  const form = useFormContext();
  const discount = form.watch('discount') || 0;
  const licensePlateBonus = form.watch('licensePlateBonus') || 0;
  const tradeInBonus = form.watch('tradeInBonus') || 0;
  const safetyKit = form.watch('safetyKit') || 0;
  const hasTradeIn = form.watch('hasTradeIn');
  const tradeInValue = form.watch('tradeInValue') || 0;
  const accessories = form.watch('accessories') || [];
  
  // Function to adjust prices based on VAT setting
  const getVATAdjustedPrice = (price: number) => {
    if (!watchReducedVAT) return price; // No change for standard VAT
    
    // For reduced VAT, first remove standard VAT then apply 4% VAT
    const priceWithoutVAT = price / 1.22;
    return priceWithoutVAT * 1.04;
  };
  
  // Apply VAT adjustment to display values (except trade-in value)
  const vatAdjustedBasePrice = getVATAdjustedPrice(basePrice);
  const vatAdjustedDiscount = getVATAdjustedPrice(discount);
  const vatAdjustedPlateBonus = getVATAdjustedPrice(licensePlateBonus);
  const vatAdjustedTradeInBonus = getVATAdjustedPrice(tradeInBonus);
  const vatAdjustedSafetyKit = getVATAdjustedPrice(safetyKit);
  const vatAdjustedRoadPrep = getVATAdjustedPrice(roadPreparationFee);
  
  return (
    <div>
      <h3 className="text-md font-semibold mb-4">Prezzo Finale</h3>
      
      {/* Price breakdown in a more structured format */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm">Prezzo Veicolo</span>
          <span className="font-medium">{formatCurrency(vatAdjustedBasePrice)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Sconto</span>
          <span className="font-medium text-red-600">- {formatCurrency(vatAdjustedDiscount)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Premio Targa</span>
          <span className="font-medium text-red-600">- {formatCurrency(vatAdjustedPlateBonus)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Premio Permuta</span>
          <span className="font-medium text-red-600">- {formatCurrency(vatAdjustedTradeInBonus)}</span>
        </div>
        
        {hasTradeIn && (
          <div className="flex justify-between">
            <span className="text-sm">Valore Permuta</span>
            <span className="font-medium text-red-600">- {formatCurrency(tradeInValue)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-sm">Kit Sicurezza</span>
          <span className="font-medium text-green-600">+ {formatCurrency(vatAdjustedSafetyKit)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm">Messa su strada</span>
          <span className="font-medium text-green-600">+ {formatCurrency(vatAdjustedRoadPrep)}</span>
        </div>
        
        {(accessoryTotalPrice > 0 || (accessories.length > 0)) && (
          <div className="flex justify-between">
            <span className="text-sm">Optional Aggiunti</span>
            <span className="font-medium text-green-600">+ {formatCurrency(accessoryTotalPrice)}</span>
          </div>
        )}
      </div>
      
      {/* Final price - with blue background */}
      <div className="bg-blue-900 py-3 px-4 rounded">
        <p className="text-sm text-white font-semibold text-center">Prezzo Finale chiavi in mano (iva inclusa) a saldo</p>
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
