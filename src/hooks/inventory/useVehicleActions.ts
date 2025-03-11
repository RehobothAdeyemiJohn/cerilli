
import { useState } from 'react';
import { Vehicle } from '@/types';
import { useInventoryMutations } from './useMutations';
import { vehiclesApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';

export const useVehicleActions = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  const { updateMutation, deleteMutation } = useInventoryMutations();
  
  const handleVehicleUpdate = async (vehicle: Vehicle) => {
    setIsUpdating(true);
    try {
      await updateMutation.mutateAsync(vehicle);
      setIsUpdating(false);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del veicolo:', error);
      setIsUpdating(false);
      throw error;
    }
  };
  
  const handleVehicleDelete = async (vehicleId: string, inventory: Vehicle[]) => {
    setIsDeleting(true);
    try {
      // Get the vehicle details before deletion for better user feedback
      const vehicleToDelete = inventory.find(v => v.id === vehicleId);
      await deleteMutation.mutateAsync(vehicleId);
      
      if (vehicleToDelete) {
        toast({
          title: "Veicolo eliminato",
          description: `${vehicleToDelete.model} ${vehicleToDelete.trim || ''} è stato eliminato dall'inventario.`,
        });
      }
      
      setIsDeleting(false);
    } catch (error) {
      console.error('Errore durante l\'eliminazione del veicolo:', error);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del veicolo.",
        variant: "destructive",
      });
      
      setIsDeleting(false);
      throw error;
    }
  };
  
  const handleVehicleDuplicate = async (vehicleId: string) => {
    setIsDuplicating(true);
    try {
      await vehiclesApi.duplicate(vehicleId);
      
      toast({
        title: "Veicolo duplicato",
        description: "Il veicolo è stato duplicato con successo.",
      });
      
      setIsDuplicating(false);
    } catch (error) {
      console.error('Errore durante la duplicazione del veicolo:', error);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo.",
        variant: "destructive",
      });
      
      setIsDuplicating(false);
      throw error;
    }
  };
  
  return {
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate,
    isUpdating,
    isDeleting,
    isDuplicating
  };
};
