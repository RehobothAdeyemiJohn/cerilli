
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
  
  const handleVehicleDelete = async (vehicleId: string) => {
    console.log('useVehicleActions: Deleting vehicle with ID:', vehicleId);
    setIsDeleting(true);
    
    try {
      // Directly call the delete mutation with the vehicle ID
      await deleteMutation.mutateAsync(vehicleId);
      
      console.log('Vehicle successfully deleted:', vehicleId);
      
      toast({
        title: "Veicolo eliminato",
        description: "Il veicolo è stato eliminato con successo dall'inventario.",
      });
      
      setIsDeleting(false);
      return true;
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
    console.log('useVehicleActions: Duplicating vehicle with ID:', vehicleId);
    setIsDuplicating(true);
    
    try {
      const duplicatedVehicle = await vehiclesApi.duplicate(vehicleId);
      
      console.log('Vehicle successfully duplicated:', duplicatedVehicle);
      
      toast({
        title: "Veicolo duplicato",
        description: "Il veicolo è stato duplicato con successo.",
      });
      
      setIsDuplicating(false);
      return duplicatedVehicle;
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
