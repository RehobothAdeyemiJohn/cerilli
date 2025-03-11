
import React from 'react';
import { Quote, Vehicle } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface QuotePrintContentProps {
  quote: Quote;
  vehicle: Vehicle;
}

const QuotePrintContent = React.forwardRef<HTMLDivElement, QuotePrintContentProps>(({ quote, vehicle }, ref) => {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div ref={ref} className="p-8 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Preventivo Auto</h1>
        <p className="text-sm text-gray-500">Data: {formatDate(quote.createdAt)}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Dati Cliente</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Nome:</p>
            <p>{quote.customerName}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p>{quote.customerEmail}</p>
          </div>
          <div>
            <p className="text-gray-600">Telefono:</p>
            <p>{quote.customerPhone}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Dettagli Veicolo</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Modello:</p>
            <p>{vehicle.model}</p>
          </div>
          <div>
            <p className="text-gray-600">Allestimento:</p>
            <p>{vehicle.trim}</p>
          </div>
          <div>
            <p className="text-gray-600">Colore:</p>
            <p>{vehicle.exteriorColor}</p>
          </div>
          <div>
            <p className="text-gray-600">Carburante:</p>
            <p>{vehicle.fuelType}</p>
          </div>
          <div>
            <p className="text-gray-600">Telaio:</p>
            <p>{vehicle.telaio}</p>
          </div>
        </div>
      </div>

      {quote.accessories && quote.accessories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Optional</h2>
          <ul className="list-disc list-inside text-sm">
            {quote.accessories.map((acc, idx) => (
              <li key={idx}>{acc}</li>
            ))}
          </ul>
        </div>
      )}

      {quote.hasTradeIn && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Permuta</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Marca:</p>
              <p>{quote.tradeInBrand}</p>
            </div>
            <div>
              <p className="text-gray-600">Modello:</p>
              <p>{quote.tradeInModel}</p>
            </div>
            <div>
              <p className="text-gray-600">Anno:</p>
              <p>{quote.tradeInYear}</p>
            </div>
            <div>
              <p className="text-gray-600">Km:</p>
              <p>{quote.tradeInKm?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Valore Permuta:</p>
              <p>{formatCurrency(quote.tradeInValue || 0)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Riepilogo Prezzi</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Prezzo Base:</p>
            <p>{formatCurrency(quote.price)}</p>
          </div>
          <div>
            <p className="text-gray-600">Sconto:</p>
            <p>{formatCurrency(quote.discount)}</p>
          </div>
          {quote.accessoryPrice && quote.accessoryPrice > 0 && (
            <div>
              <p className="text-gray-600">Prezzo Optional:</p>
              <p>{formatCurrency(quote.accessoryPrice)}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">IVA:</p>
            <p>{quote.reducedVAT ? '4% (agevolata)' : '22%'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-lg font-bold">Prezzo Finale: {formatCurrency(quote.finalPrice)}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500">
        <p>* I prezzi indicati sono da intendersi IVA inclusa</p>
        <p>* Preventivo valido per 15 giorni dalla data di emissione</p>
      </div>
    </div>
  );
});

QuotePrintContent.displayName = 'QuotePrintContent';

export default QuotePrintContent;
