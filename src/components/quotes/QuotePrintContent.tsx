
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

  // Simulated dealership data - in a real app, this would come from your API/store
  const dealership = {
    name: "Auto Elite Italia",
    address: "Via Roma 123, 00184 Roma",
    phone: "+39 06 1234567",
    email: "info@autoeliteitalia.it",
    website: "www.autoeliteitalia.it",
    logo: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=100&auto=format"
  };

  return (
    <div ref={ref} className="p-8 bg-white max-w-[210mm] mx-auto">
      {/* Header with dealership info */}
      <div className="border-b pb-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">{dealership.name}</h1>
          <p className="text-gray-500">{dealership.address}</p>
          <p className="text-gray-500">Tel: {dealership.phone}</p>
          <p className="text-gray-500">Email: {dealership.email}</p>
          <p className="text-gray-500">{dealership.website}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold mb-1">PREVENTIVO</div>
          <div className="text-gray-500">Numero: {quote.id.substring(0, 8).toUpperCase()}</div>
          <div className="text-gray-500">Data: {formatDate(quote.createdAt)}</div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8 p-4 bg-gray-50 rounded-md">
        <h2 className="text-xl font-semibold mb-3 text-primary">Dati Cliente</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Nome</p>
            <p className="font-medium">{quote.customerName}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-medium">{quote.customerEmail}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Telefono</p>
            <p className="font-medium">{quote.customerPhone}</p>
          </div>
        </div>
      </div>

      {/* Vehicle Info with image */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-primary">Dettagli Veicolo</h2>
        <div className="flex gap-6">
          <div className="w-1/3">
            <img 
              src={vehicle.imageUrl || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"} 
              alt={vehicle.model}
              className="w-full h-auto object-cover rounded-md border"
            />
          </div>
          <div className="w-2/3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Modello</p>
              <p className="font-medium">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Allestimento</p>
              <p className="font-medium">{vehicle.trim}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Colore</p>
              <p className="font-medium">{vehicle.exteriorColor}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Carburante</p>
              <p className="font-medium">{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Telaio</p>
              <p className="font-medium">{vehicle.telaio || "N/D"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Anno</p>
              <p className="font-medium">{vehicle.year || "N/D"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Optional & Accessories */}
      {quote.accessories && quote.accessories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-primary">Optional e Accessori</h2>
          <div className="grid grid-cols-2 gap-3">
            {quote.accessories.map((acc, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{acc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade-in */}
      {quote.hasTradeIn && (
        <div className="mb-8 p-4 bg-gray-50 rounded-md">
          <h2 className="text-xl font-semibold mb-3 text-primary">Dettagli Permuta</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Marca</p>
              <p className="font-medium">{quote.tradeInBrand || 'N/D'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Modello</p>
              <p className="font-medium">{quote.tradeInModel || 'N/D'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Anno</p>
              <p className="font-medium">{quote.tradeInYear || 'N/D'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Chilometri</p>
              <p className="font-medium">{quote.tradeInKm ? quote.tradeInKm.toLocaleString() : 'N/D'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Valore Permuta</p>
              <p className="font-medium">{formatCurrency(quote.tradeInValue || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-3 text-primary">Riepilogo Prezzi</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Prezzo Base Veicolo</p>
            <p className="font-medium">{formatCurrency(quote.price)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Sconto Applicato</p>
            <p className="font-medium text-destructive">- {formatCurrency(quote.discount)}</p>
          </div>
          {quote.accessoryPrice && quote.accessoryPrice > 0 && (
            <div>
              <p className="text-gray-600 text-sm">Prezzo Optional</p>
              <p className="font-medium">{formatCurrency(quote.accessoryPrice)}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600 text-sm">IVA</p>
            <p className="font-medium">{quote.reducedVAT ? '4% (agevolata)' : '22%'}</p>
          </div>
        </div>
        <div className="bg-primary text-white p-4 rounded-md flex justify-between items-center">
          <span className="text-lg">Prezzo Finale</span>
          <span className="text-2xl font-bold">{formatCurrency(quote.finalPrice)}</span>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="mt-8 pt-4 border-t">
        <h3 className="font-medium mb-2">Note</h3>
        <p className="text-sm text-gray-600 mb-4">
          {quote.notes || "Nessuna nota aggiuntiva"}
        </p>
        
        <div className="mt-6 text-xs text-gray-500">
          <p className="mb-1">* I prezzi indicati sono da intendersi IVA inclusa</p>
          <p className="mb-1">* Preventivo valido per 15 giorni dalla data di emissione</p>
          <p className="mb-1">* Le immagini sono puramente indicative, il veicolo reale potrebbe differire</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-10 pt-4 border-t text-center text-xs text-gray-500">
        <p>{dealership.name} - P.IVA: 01234567890 - {dealership.address}</p>
        <p>Tel: {dealership.phone} - Email: {dealership.email} - {dealership.website}</p>
      </div>
    </div>
  );
});

QuotePrintContent.displayName = 'QuotePrintContent';

export default QuotePrintContent;
