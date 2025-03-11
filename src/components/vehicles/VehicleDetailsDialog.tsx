
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
import ReserveVehicleForm from './ReserveVehicleForm';
import ReserveVirtualVehicleForm from './ReserveVirtualVehicleForm';
import { calculateDaysInStock } from '@/lib/utils';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VehicleDetailsDialog = ({ vehicle, open, onOpenChange }: VehicleDetailsDialogProps) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [showVirtualReserveForm, setShowVirtualReserveForm] = useState(false);
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

  const handleReserveVehicle = () => {
    setShowReserveForm(true);
  };

  const handleReserveVirtualVehicle = () => {
    setShowVirtualReserveForm(true);
  };

  const handleCancelReservation = () => {
    setShowReserveForm(false);
    setShowVirtualReserveForm(false);
  };
  
  // Calculate days in stock if vehicle is in physical stock
  const daysInStock = vehicle.location !== 'Stock Virtuale' ? calculateDaysInStock(vehicle.dateAdded) : null;

  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  
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
        ) : showReserveForm ? (
          <ReserveVehicleForm 
            vehicle={vehicle}
            onCancel={handleCancelReservation}
            onReservationComplete={() => {
              setShowReserveForm(false);
              onOpenChange(false);
            }}
          />
        ) : showVirtualReserveForm ? (
          <ReserveVirtualVehicleForm
            vehicle={vehicle}
            onCancel={handleCancelReservation}
            onReservationComplete={() => {
              setShowVirtualReserveForm(false);
              onOpenChange(false);
            }}
          />
        ) : (
          <div className="mt-2">
            <div className="grid grid-cols-6 gap-2 mt-2 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">Modello</p>
                <p>{vehicle.model}</p>
              </div>
              {!isVirtualStock && (
                <>
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
                </>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500">Ubicazione</p>
                <p>{vehicle.location}</p>
              </div>
              {!isVirtualStock && vehicle.transmission && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Cambio</p>
                  <p>{vehicle.transmission}</p>
                </div>
              )}
              {daysInStock !== null && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Giorni in Stock</p>
                  <div className="flex items-center gap-1">
                    <span>{daysInStock}</span>
                    <div className={`h-3 w-3 rounded-full ${
                      daysInStock <= 30 ? 'bg-green-500' : 
                      daysInStock <= 60 ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              )}
              {vehicle.reservedBy && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Prenotato da</p>
                  <p>{vehicle.reservedBy}</p>
                </div>
              )}
            </div>
            
            {!isVirtualStock && vehicle.accessories && vehicle.accessories.length > 0 && (
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
            )}
            
            <div className="flex gap-4 mt-4">
              {vehicle.status === 'available' ? (
                <>
                  {isVirtualStock ? (
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={handleReserveVirtualVehicle}
                    >
                      Prenota Virtuale
                    </Button>
                  ) : (
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
                        onClick={handleReserveVehicle}
                      >
                        Prenota Auto
                      </Button>
                    </>
                  )}
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
