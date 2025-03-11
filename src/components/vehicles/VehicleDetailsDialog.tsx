
import React, { useState } from 'react';
import { Vehicle, Quote } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QuoteForm from '@/components/quotes/QuoteForm';
import { quotesApi } from '@/api/localStorage/quotesApi';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VehicleDetailsDialog = ({ vehicle, open, onOpenChange }: VehicleDetailsDialogProps) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const queryClient = useQueryClient();
  
  if (!vehicle) return null;
  
  const handleCreateQuote = async (quoteData: any) => {
    try {
      await quotesApi.create({
        ...quoteData,
        status: 'pending' as Quote['status'],
        createdAt: new Date().toISOString(),
      });
      
      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      
      toast({
        title: "Preventivo Creato",
        description: "Il preventivo è stato creato con successo",
      });
      
      setShowQuoteForm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Errore durante la creazione del preventivo:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del preventivo",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelQuote = () => {
    setShowQuoteForm(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>{vehicle.model} {vehicle.trim}</DialogTitle>
          <DialogDescription>
            Dettagli del veicolo e azioni disponibili
          </DialogDescription>
        </DialogHeader>
        
        {showQuoteForm ? (
          <QuoteForm 
            vehicle={vehicle}
            onSubmit={handleCreateQuote}
            onCancel={handleCancelQuote}
          />
        ) : (
          <div className="mt-2">
            <div className="grid grid-cols-6 gap-2 mt-2 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">Modello</p>
                <p>{vehicle.model}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Allestimento</p>
                <p>{vehicle.trim}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Alimentazione</p>
                <p>{vehicle.fuelType}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Colore</p>
                <p>{vehicle.exteriorColor}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Prezzo</p>
                <p className="font-bold text-primary">
                  {formatCurrency(vehicle.price)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Ubicazione</p>
                <p>{vehicle.location}</p>
              </div>
              {vehicle.transmission && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Cambio</p>
                  <p>{vehicle.transmission}</p>
                </div>
              )}
            </div>
            
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500">Optional Inclusi</p>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {vehicle.accessories.map((accessory, idx) => (
                  <div key={idx} className="text-xs flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1"></span>
                    {accessory}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              {vehicle.status === 'available' ? (
                <>
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => setShowQuoteForm(true)}
                  >
                    Crea Preventivo
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                  >
                    Prenota Auto
                  </Button>
                </>
              ) : (
                <div className="w-full text-center py-2 bg-gray-100 rounded-md text-gray-500">
                  {vehicle.status === 'reserved' ? 'Veicolo Prenotato' : 'Veicolo Venduto'}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
