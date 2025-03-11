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
import { quotesApi } from '@/api/supabase/quotesApi';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import ReserveVehicleForm from './ReserveVehicleForm';
import ReserveVirtualVehicleForm from './ReserveVirtualVehicleForm';
import VehicleDetailsContent from './details/VehicleDetailsContent';
import { useAuth } from '@/context/AuthContext';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VehicleDetailsDialog = ({ vehicle, open, onOpenChange }: VehicleDetailsDialogProps) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [showVirtualReserveForm, setShowVirtualReserveForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  if (!vehicle) return null;

  const handleShowQuoteForm = () => {
    if (!user?.dealerId) {
      toast({
        title: "Errore",
        description: "Non hai accesso alla creazione di preventivi",
        variant: "destructive",
      });
      return;
    }
    setShowQuoteForm(true);
  };
  
  const handleCreateQuote = async (quoteData: any) => {
    try {
      setIsSubmitting(true);
      await quotesApi.create({
        ...quoteData,
        status: 'pending' as Quote['status'],
        createdAt: new Date().toISOString(),
        dealerId: user!.dealerId,
        vehicleId: vehicle.id
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
    } finally {
      setIsSubmitting(false);
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
          isSubmitting={isSubmitting}
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
    
    return (
      <VehicleDetailsContent 
        vehicle={vehicle}
        onCreateQuote={handleShowQuoteForm}
        onReserveVehicle={handleReserveVehicle}
        onReserveVirtualVehicle={handleReserveVirtualVehicle}
      />
    );
  };
  
  const getDialogTitle = () => {
    if (vehicle.status === 'reserved') {
      return (
        <div className="flex items-center gap-2">
          <span>{vehicle.model} {vehicle.trim}</span>
          <span className="text-sm font-normal px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
            Prenotato
          </span>
        </div>
      );
    }
    return vehicle.model + (vehicle.trim ? ` ${vehicle.trim}` : '');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
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
