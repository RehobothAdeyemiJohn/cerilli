
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Quote, Vehicle } from '@/types';
import { Button } from '@/components/ui/button';

interface QuoteDetailsDialogProps {
  quote: Quote | null;
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, status: Quote['status']) => void;
}

const QuoteDetailsDialog = ({ 
  quote, 
  vehicle, 
  open, 
  onOpenChange,
  onStatusChange
}: QuoteDetailsDialogProps) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dettagli Preventivo</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
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
              <p className="text-sm text-gray-500">Stato Preventivo</p>
              <p className="font-medium">
                <span className={`px-2 py-1 text-xs rounded-full 
                  ${quote.status === 'pending' ? 'bg-blue-100 text-blue-800' : 
                  quote.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'}`}
                >
                  {quote.status === 'pending' ? 'In attesa' : 
                   quote.status === 'approved' ? 'Approvato' : 
                   quote.status === 'rejected' ? 'Rifiutato' : 'Convertito'}
                </span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Prezzo Veicolo:</span>
              <span>{formatCurrency(quote.price)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Sconto:</span>
              <span>- {formatCurrency(quote.discount || 0)}</span>
            </div>
            {quote.tradeInValue > 0 && (
              <div className="flex justify-between mb-2">
                <span>Valore Permuta ({quote.tradeInModel || 'Veicolo usato'}):</span>
                <span>- {formatCurrency(quote.tradeInValue)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Prezzo Finale:</span>
              <span className="text-primary">
                {formatCurrency(quote.finalPrice)}
              </span>
            </div>
          </div>

          {quote.rejectionReason && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">Motivo Rifiuto</p>
              <p className="font-medium text-red-600">{quote.rejectionReason}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          {quote.status === 'pending' && onStatusChange && (
            <>
              <Button 
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Chiudi
              </Button>
              <Button
                variant="default"
                onClick={() => onStatusChange(quote.id, 'approved')}
              >
                Approva
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // La gestione del rifiuto verrà delegata al componente padre
                  onStatusChange(quote.id, 'rejected');
                }}
              >
                Rifiuta
              </Button>
            </>
          )}
          
          {quote.status === 'approved' && onStatusChange && (
            <>
              <Button 
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Chiudi
              </Button>
              <Button 
                variant="secondary"
                onClick={() => onStatusChange(quote.id, 'pending')}
              >
                Riporta In Attesa
              </Button>
              <Button
                variant="default"
                onClick={() => onStatusChange(quote.id, 'converted')}
              >
                Converti in Ordine
              </Button>
            </>
          )}

          {!onStatusChange && (
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Chiudi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsDialog;
