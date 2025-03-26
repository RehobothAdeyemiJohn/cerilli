
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import VehicleDetailsContent from './details/VehicleDetailsContent';
import { useInventory } from '@/hooks/useInventory';
import EditVehicleForm from './EditVehicleForm';
import { toast } from '@/hooks/use-toast';
import { useVehicleActions } from '@/hooks/inventory/useVehicleActions';
import { useQueryClient } from '@tanstack/react-query';
import { useOrdersActions } from '@/hooks/orders/useOrdersActions';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleUpdated?: () => void;
  onVehicleDeleted?: (vehicleId: string) => Promise<void>;
  onCreateQuote?: ((vehicle: Vehicle) => void) | undefined;
  onReserve?: ((vehicle: Vehicle) => void) | undefined;
  showActions?: boolean;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
  shouldReserve?: boolean;
  requestedAction?: string;
}

const VehicleDetailsDialog = ({
  vehicle,
  open,
  onOpenChange,
  onVehicleUpdated,
  onVehicleDeleted,
  onCreateQuote,
  onReserve,
  showActions = true,
  isDealerStock,
  isVirtualStock,
  shouldReserve,
  requestedAction,
}: VehicleDetailsDialogProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { locationOptions } = useInventory();
  const { handleVehicleUpdate,isPending } = useVehicleActions();
  const queryClient = useQueryClient();
  
  // Create a new state to track if we should show the reservation form
  const [autoOpenReservation, setAutoOpenReservation] = useState(false);
  
  // Get transform to order functionality from the orders hook
  const { handleTransformVehicleToOrder } = useOrdersActions(() => {
    // Callback to refresh data after transforming
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  });
  
  // Set autoOpenReservation when shouldReserve changes or when dialog opens
  useEffect(() => {
    if (open && shouldReserve) {
      console.log("Setting autoOpenReservation to true based on shouldReserve flag");
      setAutoOpenReservation(true);
    }
  }, [shouldReserve, open]);
  
  const handleEdit = () => {
    console.log("Edit button clicked, showing edit form for vehicle:", vehicle);
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    if (vehicle && onVehicleDeleted) {
      try {
        await onVehicleDeleted(vehicle.id);
        onOpenChange(false);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const handleEditComplete = async (updatedVehicle: Vehicle) => {
    console.log("Edit complete, updated vehicle:", updatedVehicle);
    try {
      // Use the handleVehicleUpdate function to update the vehicle
      const success = await handleVehicleUpdate(updatedVehicle);
      
      if (success) {
        console.log("Vehicle updated successfully");
        setShowEditForm(false);
        
        // Force a complete refresh of the vehicles data
        console.log('Invalidating and refetching vehicle queries');
        await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        await queryClient.refetchQueries({ queryKey: ['vehicles'] });
        
        // Call onVehicleUpdated callback if provided
        if (onVehicleUpdated) {
          onVehicleUpdated();
        }
        
        // Close the dialog after successful update
        onOpenChange(false);
        
        toast({
          title: "Veicolo aggiornato",
          description: `${updatedVehicle.model} ${updatedVehicle.trim || ''} è stato aggiornato con successo.`,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiornamento del veicolo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del veicolo.",
        variant: "destructive",
      });
    }
  };

  const handleEditCancel = () => {
    console.log("Edit cancelled");
    setShowEditForm(false);
  };
  
  // Handle transform to order button click
  const handleTransformToOrder = async () => {
    if (vehicle) {
      console.log("Transforming vehicle to order:", vehicle.id);
      try {
        await handleTransformVehicleToOrder(vehicle.id);
        onOpenChange(false);
        toast({
          title: "Veicolo trasformato in ordine",
          description: `${vehicle.model} ${vehicle.trim || ''} è stato trasformato in ordine con successo.`,
        });
      } catch (error) {
        console.error("Error transforming vehicle to order:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la trasformazione del veicolo in ordine.",
          variant: "destructive",
        });
      }
    }
  };

  // Close the dialog when clicking outside
  const handleCloseDialog = () => {
    if (showEditForm) {
      const confirmLeave = window.confirm("Sei sicuro di voler uscire? Le modifiche non salvate andranno perse.");
      if (confirmLeave) {
        setShowEditForm(false);
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
      // Reset the autoOpenReservation flag when closing
      setAutoOpenReservation(false);
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {isVirtualStock || vehicle.location === 'Stock Virtuale'
                ? 'Dettagli Veicolo (Stock Virtuale)'
                : ``}
            </span>
          </DialogTitle>
        </DialogHeader>

        {showEditForm ? (
          <EditVehicleForm
            vehicle={vehicle}
            isLoading={isPending}
            onComplete={handleEditComplete}
            onCancel={handleEditCancel}
            locationOptions={locationOptions}
          />
        ) : (
          <VehicleDetailsContent
            vehicle={vehicle}
            onEdit={showActions ? handleEdit : undefined}
            onDelete={showActions ? handleDelete : undefined}
            isDealerStock={isDealerStock}
            isVirtualStock={isVirtualStock}
            onCreateQuote={onCreateQuote}
            onReserve={onReserve}
            onTransformToOrder={handleTransformToOrder}
            shouldReserve={autoOpenReservation || shouldReserve}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
