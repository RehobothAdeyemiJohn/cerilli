
import React from 'react';
import { Vehicle } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import EditVehicleForm from './EditVehicleForm';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useVehicleActions } from '@/hooks/inventory/useVehicleActions';

interface VehicleEditDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (updatedVehicle: Vehicle) => void;
  onCancel: () => void;
  locationOptions?: string[];
}

const VehicleEditDialog = ({ 
  vehicle, 
  open, 
  onOpenChange,
  onComplete,
  onCancel,
  locationOptions
}: VehicleEditDialogProps) => {
  const { handleVehicleUpdate } = useVehicleActions();
  const queryClient = useQueryClient();
  
  if (!vehicle) return null;
  
  // Determine if the vehicle is in Virtual Stock
  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  
  const handleSaveComplete = async (updatedVehicle: Vehicle) => {
    console.log('VehicleEditDialog - Saving vehicle with data:', updatedVehicle);
    console.log('VehicleEditDialog - Accessories:', updatedVehicle.accessories);
    
    try {
      const success = await handleVehicleUpdate(updatedVehicle);
      
      if (success) {
        // Force a complete refresh of the vehicles data
        console.log('Vehicle update successful, invalidating and refetching queries');
        await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        await queryClient.refetchQueries({ queryKey: ['vehicles'] });
        
        // Call the onComplete callback with the updated vehicle
        onComplete(updatedVehicle);
        
        // Close the dialog
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
      console.error('Error saving vehicle:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del veicolo.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {isVirtualStock ? 'Modifica Veicolo (Stock Virtuale)' : 'Modifica Veicolo'}
          </DialogTitle>
          <DialogDescription>
            {isVirtualStock 
              ? 'Modifica il modello del veicolo in stock virtuale' 
              : `Modifica i dettagli del veicolo ${vehicle.model} ${vehicle.trim || ''}`}
          </DialogDescription>
        </DialogHeader>
        
        <EditVehicleForm 
          vehicle={vehicle}
          onComplete={handleSaveComplete}
          onCancel={onCancel}
          locationOptions={locationOptions}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VehicleEditDialog;
