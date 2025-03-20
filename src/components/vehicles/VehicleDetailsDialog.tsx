
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import { useInventory } from '@/hooks/useInventory';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import VehicleDialogHeader from './details/VehicleDialogHeader';
import VehicleDialogContent from './details/VehicleDialogContent';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleUpdated: () => void;
  onVehicleDeleted: (id: string) => Promise<void>;
  onCreateQuote?: (vehicle: Vehicle) => void;
  onReserve?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
  shouldReserve?: boolean;
  requestedAction?: string;
}

const VehicleDetailsDialog: React.FC<VehicleDetailsDialogProps> = ({
  vehicle,
  open,
  onOpenChange,
  onVehicleUpdated,
  onVehicleDeleted,
  onCreateQuote,
  onReserve,
  isDealerStock,
  isVirtualStock,
  shouldReserve,
  requestedAction
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [showVirtualReserveForm, setShowVirtualReserveForm] = useState(false);
  const [showCancelReservationForm, setShowCancelReservationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { handleVehicleDuplicate } = useInventory();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const userCanReserveVehicles = true;
  const userCanCreateQuotes = true;
  
  useEffect(() => {
    if (open && vehicle) {
      setSelectedVehicle(vehicle);
      
      if (shouldReserve && vehicle.status === 'available') {
        console.log("Auto-triggering reservation for vehicle:", vehicle.id);
        
        if (vehicle.location === 'Stock Virtuale') {
          setShowVirtualReserveForm(true);
        } else {
          setShowReserveForm(true);
        }
      }
      
      if (requestedAction === 'duplicate' && vehicle.location === 'Stock Virtuale') {
        handleDuplicateVehicle();
      }
    } else {
      resetForms();
    }
  }, [open, vehicle, shouldReserve, requestedAction]);
  
  const resetForms = () => {
    setShowEditForm(false);
    setShowQuoteForm(false);
    setShowReserveForm(false);
    setShowVirtualReserveForm(false);
    setShowCancelReservationForm(false);
  };
  
  const handleDuplicateVehicle = async () => {
    if (!selectedVehicle) return;
    
    try {
      setIsSubmitting(true);
      const duplicatedVehicle = await handleVehicleDuplicate(selectedVehicle.id);
      
      toast({
        title: "Veicolo Duplicato",
        description: `${selectedVehicle.model} è stato duplicato con successo`,
      });
      
      handleDialogClose();
      onVehicleUpdated();
    } catch (error) {
      console.error("Error duplicating vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReserveVehicle = () => {
    resetForms();
    
    if (selectedVehicle?.location === 'Stock Virtuale') {
      setShowVirtualReserveForm(true);
    } else {
      setShowReserveForm(true);
    }
  };
  
  const handleCancelReservation = () => {
    resetForms();
    setShowCancelReservationForm(true);
  };
  
  const handleCancelReservationConfirm = async () => {
    if (!selectedVehicle) return;
    
    try {
      setIsSubmitting(true);
      
      // Create updated vehicle object with reset reservation fields
      const updatedVehicle = {
        ...selectedVehicle,
        status: 'available',
        reservedBy: null,
        reservedAccessories: [],
        reservationTimestamp: null,
        reservationDestination: null
      };
      
      console.log("Cancelling reservation with vehicle data:", updatedVehicle);
      
      // Use direct Supabase update to avoid RLS issues
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          status: 'available',
          reservedby: null,
          reservedaccessories: [],
          reservation_timestamp: null,
          reservation_destination: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedVehicle.id);
        
      if (error) {
        console.error("Supabase error cancelling reservation:", error);
        throw error;
      }
      
      toast({
        title: "Prenotazione Annullata",
        description: `La prenotazione per ${selectedVehicle.model} è stata annullata`,
      });
      
      onVehicleUpdated();
      handleDialogClose();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'annullamento della prenotazione",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCreateQuoteClick = () => {
    resetForms();
    
    if (onCreateQuote && selectedVehicle) {
      onCreateQuote(selectedVehicle);
      handleDialogClose();
    } else {
      setShowQuoteForm(true);
    }
  };
  
  const handleFormSubmitted = () => {
    onVehicleUpdated();
    handleDialogClose();
  };
  
  const handleDialogClose = () => {
    resetForms();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {selectedVehicle && !showEditForm && (
          <>
            <DialogHeader>
              <VehicleDialogHeader 
                vehicle={selectedVehicle}
                onDuplicate={selectedVehicle.location === 'Stock Virtuale' ? handleDuplicateVehicle : undefined}
                onCreateQuote={selectedVehicle.location !== 'Stock Virtuale' ? handleCreateQuoteClick : undefined}
                onReserve={selectedVehicle.status === 'available' ? handleReserveVehicle : undefined}
                onCancelReservation={selectedVehicle.status === 'reserved' ? handleCancelReservation : undefined}
                isDealer={isDealer}
                isVirtualStock={isVirtualStock}
                isDealerStock={isDealerStock}
              />
            </DialogHeader>
            
            <VehicleDialogContent 
              vehicle={selectedVehicle}
              showQuoteForm={showQuoteForm}
              showReserveForm={showReserveForm}
              showVirtualReserveForm={showVirtualReserveForm}
              showCancelReservationForm={showCancelReservationForm}
              isSubmitting={isSubmitting}
              onCreateQuote={handleCreateQuoteClick}
              onCancel={resetForms}
              onSubmit={handleFormSubmitted}
              onConfirm={handleCancelReservationConfirm}
              userCanReserveVehicles={userCanReserveVehicles}
              userCanCreateQuotes={userCanCreateQuotes}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
