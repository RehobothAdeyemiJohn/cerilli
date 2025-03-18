
import React from 'react';
import { Quote } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface QuoteTradeInDetailsProps {
  quote: Quote;
}

const QuoteTradeInDetails = ({ quote }: QuoteTradeInDetailsProps) => {
  return (
    <div className="border p-2 rounded-md">
      <h3 className="font-medium mb-1 text-xs">Dettagli Permuta</h3>
      <div className="grid grid-cols-6 gap-2 mb-2">
        <div>
          <p className="text-xs text-gray-500">Marca</p>
          <p className="font-medium">{quote.tradeInBrand || 'N/D'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Modello</p>
          <p className="font-medium">{quote.tradeInModel || 'N/D'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Targa</p>
          <p className="font-medium">{quote.tradeInPlate || 'N/D'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Anno</p>
          <p className="font-medium">{quote.tradeInYear || 'N/D'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Chilometri</p>
          <p className="font-medium">{quote.tradeInKm ? quote.tradeInKm.toLocaleString() : 'N/D'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Valore</p>
          <p className="font-medium">{formatCurrency(quote.tradeInValue || 0)}</p>
        </div>
      </div>
      
      {quote.tradeInHandlingFee > 0 && (
        <div className="mt-1 border-t pt-1">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <p className="text-xs text-gray-500">Gestione Usato</p>
              <p className="font-medium">{formatCurrency(quote.tradeInHandlingFee)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteTradeInDetails;
