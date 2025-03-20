
import { useState } from 'react';
import { Vehicle } from '@/types';
import { useInventoryMutations } from './useMutations';
import { toast } from '@/hooks/use-toast';

export const useVehicleActions = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDuplicating, setIsDuplicating] = useState<boolean>(false);
  const { updateMutation, deleteMutation, createMutation } = useInventoryMutations();

  const handleVehicleUpdate = async (vehicle: Vehicle) => {
    console.log('Updating vehicle with data:', vehicle);
    
    try {
      // Make sure accessories is an array
      if (!Array.isArray(vehicle.accessories)) {
        vehicle.accessories = [];
      }
      
      // Ensure we're sending a proper location
      if (!vehicle.location) {
        vehicle.location = 'Stock CMC';
      }
      
      // Make sure price is a number
      if (typeof vehicle.price !== 'number') {
        vehicle.price = 0;
      }
      
      const result = await updateMutation.mutateAsync(vehicle);
      
      console.log('Vehicle update response:', result);
      
      toast({
        title: "Veicolo aggiornato",
        description: `${vehicle.model} ${vehicle.trim || ''} è stato aggiornato.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del veicolo.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const handleVehicleDelete = async (vehicleId: string) => {
    console.log('Deleting vehicle:', vehicleId);
    setIsDeleting(true);
    
    try {
      await deleteMutation.mutateAsync(vehicleId);
      
      toast({
        title: "Veicolo eliminato",
        description: "Il veicolo è stato eliminato con successo.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del veicolo.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleVehicleDuplicate = async (vehicleData: Vehicle | string) => {
    console.log('Duplicating vehicle:', vehicleData);
    setIsDuplicating(true);
    
    try {
      // Handle both Vehicle object and vehicle ID string
      if (typeof vehicleData === 'string') {
        const vehicleId = vehicleData;
        // In this case, we need to fetch the vehicle data first
        // This might require additional logic, but for now, let's return early
        console.log('Vehicle ID provided instead of Vehicle object:', vehicleId);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante la duplicazione del veicolo (ID fornito invece dell'oggetto).",
          variant: "destructive",
        });
        return false;
      }
      
      // If we have a Vehicle object, proceed with duplication
      const vehicle = vehicleData as Vehicle;
      
      // Remove the ID to create a new vehicle
      const { id, ...vehicleWithoutId } = vehicle;
      
      // Create a new vehicle with the same properties
      await createMutation.mutateAsync(vehicleWithoutId as Omit<Vehicle, 'id'>);
      
      toast({
        title: "Veicolo duplicato",
        description: `Una copia di ${vehicle.model} ${vehicle.trim || ''} è stata creata.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error duplicating vehicle:', error);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsDuplicating(false);
    }
  };

  return {
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate,
    isDeleting,
    isDuplicating
  };
};
