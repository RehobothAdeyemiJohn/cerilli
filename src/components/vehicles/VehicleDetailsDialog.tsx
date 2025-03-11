
import React, { useState } from 'react';
import { Vehicle, Quote } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import QuoteForm from '@/components/quotes/QuoteForm';
import { quotesApi } from '@/api/localStorage/quotesApi';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import ReserveVehicleForm from './ReserveVehicleForm';
import ReserveVirtualVehicleForm from './ReserveVirtualVehicleForm';
import VehicleDetailsContent from './details/VehicleDetailsContent';

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
  
  const renderContent = () => {
    if (showQuoteForm) {
      return (
        <QuoteForm 
          vehicle={vehicle}
          onSubmit={handleCreateQuote}
          onCancel={handleCancelQuote}
        />
      );
    } 
    
    if (showReserveForm) {
      return (
        <ReserveVehicleForm 
          vehicle={vehicle}
          onCancel={handleCancelReservation}
          onReservationComplete={() => {
            setShowReserveForm(false);
            onOpenChange(false);
          }}
        />
      );
    } 
    
    if (showVirtualReserveForm) {
      return (
        <ReserveVirtualVehicleForm
          vehicle={vehicle}
          onCancel={handleCancelReservation}
          onReservationComplete={() => {
            setShowVirtualReserveForm(false);
            onOpenChange(false);
          }}
        />
      );
    }
    
    // Default view - vehicle details
    return (
      <VehicleDetailsContent 
        vehicle={vehicle}
        onCreateQuote={() => setShowQuoteForm(true)}
        onReserveVehicle={handleReserveVehicle}
        onReserveVirtualVehicle={handleReserveVirtualVehicle}
      />
    );
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
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
