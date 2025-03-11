
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Quote, Vehicle } from '@/types';

interface QuoteDetailsDialogProps {
  quote: Quote | null;
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: Quote['status']) => void;
}

const QuoteDetailsDialog = ({ quote, vehicle, open, onOpenChange, onStatusChange }: QuoteDetailsDialogProps) => {
  if (!quote || !vehicle) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'In attesa';
      case 'approved': return 'Approvato';
      case 'rejected': return 'Rifiutato';
      case 'converted': return 'Convertito in vendita';
      default: return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Preventivo</DialogTitle>
        </DialogHeader>
        
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-md">
            <div>
              <p className="text-sm text-gray-500">Modello</p>
              <p className="font-medium">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Allestimento</p>
              <p className="font-medium">{vehicle.trim}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Colore</p>
              <p className="font-medium">{vehicle.exteriorColor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prezzo Veicolo</p>
              <p className="font-medium">{formatCurrency(quote.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prezzo Finale</p>
              <p className="font-medium text-primary">{formatCurrency(quote.finalPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IVA</p>
              <p className="font-medium">{quote.vatRate === 0.04 ? '4% (agevolata)' : '22%'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{quote.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{quote.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefono</p>
              <p className="font-medium">{quote.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Creazione</p>
              <p className="font-medium">{formatDate(quote.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stato</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(quote.status)}`}>
                  {getStatusLabel(quote.status)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sconto</p>
              <p className="font-medium">{formatCurrency(quote.discount || 0)}</p>
            </div>
          </div>
          
          {quote.hasTradeIn && (
            <div className="border p-3 rounded-md">
              <h3 className="font-medium mb-2">Dettagli Permuta</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Marca</p>
                  <p className="font-medium">{quote.tradeInBrand || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modello</p>
                  <p className="font-medium">{quote.tradeInModel || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Anno</p>
                  <p className="font-medium">{quote.tradeInYear || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chilometri</p>
                  <p className="font-medium">{quote.tradeInKm ? quote.tradeInKm.toLocaleString() : 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valore</p>
                  <p className="font-medium">{formatCurrency(quote.tradeInValue || 0)}</p>
                </div>
              </div>
            </div>
          )}
          
          {quote.status === 'rejected' && quote.rejectionReason && (
            <div className="border-t pt-3">
              <p className="text-sm text-gray-500">Motivo Rifiuto</p>
              <p className="font-medium">{quote.rejectionReason}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          {quote.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onStatusChange(quote.id, 'rejected')}
              >
                Rifiuta
              </Button>
              <Button 
                variant="default" 
                onClick={() => onStatusChange(quote.id, 'approved')}
              >
                Approva
              </Button>
            </div>
          )}
          
          {quote.status === 'approved' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onStatusChange(quote.id, 'pending')}
              >
                Metti in Attesa
              </Button>
              <Button 
                variant="default" 
                onClick={() => onStatusChange(quote.id, 'converted')}
              >
                Converti in Vendita
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsDialog;
