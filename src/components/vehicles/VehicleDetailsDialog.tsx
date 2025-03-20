
import React, { useState } from 'react';
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
import { useInventoryMutations } from '@/hooks/inventory/useMutations';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleUpdated?: () => void;
  onVehicleDeleted?: (vehicleId: string) => Promise<void>;
  showActions?: boolean;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
}

const VehicleDetailsDialog = ({
  vehicle,
  open,
  onOpenChange,
  onVehicleUpdated,
  onVehicleDeleted,
  showActions = true,
  isDealerStock,
  isVirtualStock,
}: VehicleDetailsDialogProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { locationOptions, handleVehicleUpdate } = useInventory();
  const { updateMutation } = useInventoryMutations();
  
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
      // Use the updateMutation to update the vehicle
      await updateMutation.mutateAsync(updatedVehicle);
      
      console.log("Vehicle updated successfully");
      setShowEditForm(false);
      
      // Call onVehicleUpdated callback if provided
      if (onVehicleUpdated) {
        onVehicleUpdated();
      }
      
      toast({
        title: "Veicolo aggiornato",
        description: `${updatedVehicle.model} ${updatedVehicle.trim || ''} è stato aggiornato con successo.`,
      });
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
                : `${vehicle.model} ${vehicle.trim}`}
            </span>
          </DialogTitle>
        </DialogHeader>

        {showEditForm ? (
          <EditVehicleForm
            vehicle={vehicle}
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
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
