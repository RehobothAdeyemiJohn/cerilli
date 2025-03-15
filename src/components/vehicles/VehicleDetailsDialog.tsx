import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import VehicleDialogHeader from './details/VehicleDialogHeader';
import VehicleDialogContent from './details/VehicleDialogContent';
import { useAuth } from '@/context/AuthContext';
import VehicleEditDialog from './VehicleEditDialog';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { vehiclesApi } from '@/api/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleUpdated?: () => void;
  onVehicleDeleted?: (id: string) => Promise<void>;
  onReserve?: (vehicle: Vehicle) => void;
  onCreateQuote?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
}

const VehicleDetailsDialog = ({
  vehicle,
  open,
  onOpenChange,
  onVehicleUpdated,
  onVehicleDeleted,
  onReserve,
  onCreateQuote,
  isDealerStock = false,
  isVirtualStock = false
}: VehicleDetailsDialogProps) => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [showVirtualReserveForm, setShowVirtualReserveForm] = useState(false);
  const [showCancelReservationForm, setShowCancelReservationForm] = useState(false);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  
  const handleDuplicateVehicle = async (vehicleId: string) => {
    if (!vehicle) return;
    try {
      await vehiclesApi.duplicate(vehicleId);
      if (onVehicleUpdated) onVehicleUpdated();
      toast({
        title: "Veicolo duplicato",
        description: "Il veicolo è stato duplicato con successo.",
      });
    } catch (error) {
      console.error("Error duplicating vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo.",
        variant: "destructive",
      });
    }
  };
  
  const handleVehicleDeleted = async () => {
    if (!vehicle || !onVehicleDeleted) return;
    try {
      await onVehicleDeleted(vehicle.id);
      toast({
        title: "Veicolo eliminato",
        description: "Il veicolo è stato eliminato con successo.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del veicolo.",
        variant: "destructive",
      });
    }
  };
  
  const handleReservationComplete = async () => {
    setShowReserveForm(false);
    setShowVirtualReserveForm(false);
    if (onVehicleUpdated) onVehicleUpdated();
    onOpenChange(false);
  };
  
  const handleCancelReservation = async () => {
    if (!vehicle) return;
    
    try {
      setIsSubmittingCancel(true);
      
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'available',
        reservedBy: undefined,
        reservedAccessories: [],
        virtualConfig: vehicle.location === 'Stock Virtuale' ? undefined : vehicle.virtualConfig,
        reservationDestination: undefined,
        reservationTimestamp: undefined
      };
      
      await vehiclesApi.update(vehicle.id, updatedVehicle);
      
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      toast({
        title: "Prenotazione Cancellata",
        description: `La prenotazione per ${vehicle.model} ${vehicle.trim || ''} è stata cancellata.`,
      });
      
      setShowCancelReservationForm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la cancellazione della prenotazione",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCancel(false);
    }
  };
  
  const handleCreateOrder = async (vehicleId: string) => {
    if (!vehicle) return;
    
    try {
      await vehiclesApi.transformToOrder(vehicleId);
      
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: "Ordine Creato",
        description: "Il veicolo è stato trasformato in ordine con successo.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la trasformazione in ordine",
        variant: "destructive",
      });
    }
  };

  const shouldHideImage = isDealerStock;
  
  const handleEdit = () => setShowEditDialog(true);
  const handleDelete = () => setShowDeleteDialog(true);
  const handleDuplicate = () => {
    if (vehicle) handleDuplicateVehicle(vehicle.id);
  };
  const handleCreateQuoteAction = () => {
    if (vehicle && onCreateQuote) {
      onCreateQuote(vehicle);
      onOpenChange(false);
    }
  };
  const handleReserveAction = () => {
    if (vehicle) {
      if (vehicle.location === 'Stock Virtuale') {
        setShowVirtualReserveForm(true);
      } else if (onReserve) {
        onReserve(vehicle);
        onOpenChange(false);
      } else {
        setShowReserveForm(true);
      }
    }
  };
  const handleCancelReservationAction = () => {
    setShowCancelReservationForm(true);
  };
  const handleCreateOrderAction = () => {
    if (vehicle) handleCreateOrder(vehicle.id);
  };
  
  const isAdmin = user?.type === 'admin';
  
  const showEditButton = isAdmin && vehicle?.status !== 'ordered';
  const showDeleteButton = isAdmin && vehicle?.status !== 'ordered';
  const showDuplicateButton = isAdmin;
  
  const showCreateQuoteButton = !isVirtualStock && 
                               (isDealer || isAdmin) && 
                               (vehicle?.status === 'available' || vehicle?.status === 'delivered') && 
                               onCreateQuote !== undefined;
                               
  const showReserveButton = (isDealer || isAdmin) && 
                           (vehicle?.status === 'available' || vehicle?.status === 'delivered') && 
                           vehicle?.location !== 'Stock Dealer' && 
                           onReserve !== undefined;
                           
  const showCancelReservationButton = vehicle?.status === 'reserved' && 
    ((isDealer && vehicle.reservedBy === user?.dealerName) || isAdmin);
    
  const showCreateOrderButton = isAdmin && vehicle?.status === 'reserved';
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {vehicle && (
            <>
              <DialogHeader>
                <VehicleDialogHeader 
                  vehicle={vehicle}
                  onEdit={showEditButton ? handleEdit : undefined}
                  onDelete={showDeleteButton ? handleDelete : undefined}
                  onDuplicate={showDuplicateButton ? handleDuplicate : undefined}
                  onCreateQuote={showCreateQuoteButton ? handleCreateQuoteAction : undefined}
                  onReserve={showReserveButton ? handleReserveAction : undefined}
                  onCancelReservation={showCancelReservationButton ? handleCancelReservationAction : undefined}
                  onCreateOrder={showCreateOrderButton ? handleCreateOrderAction : undefined}
                  isDealer={isDealer}
                />
              </DialogHeader>
              
              <VehicleDialogContent
                vehicle={vehicle}
                showQuoteForm={showQuoteForm}
                showReserveForm={showReserveForm}
                showVirtualReserveForm={showVirtualReserveForm}
                showCancelReservationForm={showCancelReservationForm}
                isSubmitting={isSubmittingCancel}
                onCreateQuote={() => {
                  setShowQuoteForm(false);
                  if (onCreateQuote) onCreateQuote(vehicle);
                }}
                onCancel={() => {
                  setShowQuoteForm(false);
                  setShowReserveForm(false);
                  setShowVirtualReserveForm(false);
                  setShowCancelReservationForm(false);
                }}
                onSubmit={handleReservationComplete}
                onConfirm={handleCancelReservation}
                hideImage={shouldHideImage}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <VehicleEditDialog
        vehicle={vehicle}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onComplete={() => {
          if (onVehicleUpdated) onVehicleUpdated();
        }}
        onCancel={() => setShowEditDialog(false)}
      />
      
      <VehicleDeleteDialog
        vehicle={vehicle}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleVehicleDeleted}
      />
    </>
  );
};

export default VehicleDetailsDialog;
