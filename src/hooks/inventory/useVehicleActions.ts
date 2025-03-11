
import { Vehicle } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useInventoryMutations } from './useMutations';

export const useVehicleActions = () => {
  const { updateMutation, deleteMutation, createMutation } = useInventoryMutations();

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    updateMutation.mutate(updatedVehicle, {
      onSuccess: () => {
        toast({
          title: "Veicolo Aggiornato",
          description: `${updatedVehicle.model} ${updatedVehicle.trim} è stato aggiornato con successo.`,
        });
      },
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'aggiornamento del veicolo.",
            variant: "destructive",
          });
          console.error("Errore durante l'aggiornamento:", error);
        }
      }
    });
  };
  
  const handleVehicleDelete = (vehicleId: string, inventory: Vehicle[]) => {
    const vehicleToDelete = inventory.find(v => v.id === vehicleId);
    
    deleteMutation.mutate(vehicleId, {
      onSuccess: () => {
        if (vehicleToDelete) {
          toast({
            title: "Veicolo Eliminato",
            description: `${vehicleToDelete.model} ${vehicleToDelete.trim} è stato eliminato dall'inventario.`,
            variant: "destructive",
          });
        }
      },
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'eliminazione del veicolo.",
            variant: "destructive",
          });
          console.error("Errore durante l'eliminazione:", error);
        }
      }
    });
  };
  
  const handleVehicleDuplicate = async (vehicle: Vehicle) => {
    const { id, ...vehicleWithoutId } = vehicle;
    
    const newVehicle = {
      ...vehicleWithoutId,
      model: vehicle.model,
      trim: vehicle.trim,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    
    try {
      const duplicatedVehicle = await createMutation.mutateAsync(newVehicle);
      toast({
        title: "Veicolo Duplicato",
        description: `${duplicatedVehicle.model} ${duplicatedVehicle.trim} è stato duplicato con successo.`,
      });
      return duplicatedVehicle;
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo.",
        variant: "destructive",
      });
      console.error("Errore durante la duplicazione:", error);
      throw error;
    }
  };

  return {
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate
  };
};
