
import { useState } from 'react';
import { Vehicle } from '@/types';
import { useInventoryMutations } from './useMutations';
import { toast } from '@/hooks/use-toast';

export const useVehicleActions = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDuplicating, setIsDuplicating] = useState<boolean>(false);
  const { updateMutation, deleteMutation, duplicateVehicle } = useInventoryMutations();

  const handleVehicleUpdate = async (vehicle: Vehicle) => {
    console.log('Updating vehicle with data:', vehicle);
    
    try {
      // Ensure accessories is an array
      if (!Array.isArray(vehicle.accessories)) {
        vehicle.accessories = [];
      }
      
      // Ensure location is set
      if (!vehicle.location) {
        vehicle.location = 'Stock CMC';
      }
      
      // Ensure price is a number
      if (typeof vehicle.price !== 'number') {
        vehicle.price = parseFloat(vehicle.price as any) || 0;
      }
      
      // Calculate accessories adjustment for price display
      let accessoriesAdjustment = 0;
      if (Array.isArray(vehicle.accessories) && vehicle.accessories.length > 0) {
        console.log('Vehicle has accessories:', vehicle.accessories);
        // Note: In a real app, we would look up the actual price of each accessory
        // For now, we'll just log that we detected accessories
      }
      
      // Clean up any null values to prevent Supabase errors
      const cleanVehicle = { ...vehicle };
      Object.keys(cleanVehicle).forEach(key => {
        if (cleanVehicle[key] === null) {
          if (key === 'accessories') {
            cleanVehicle[key] = [];
          } else if (key === 'price') {
            cleanVehicle[key] = 0;
          } else if (typeof cleanVehicle[key] === 'string') {
            cleanVehicle[key] = '';
          }
        }
      });
      
      // Handling for specific fields in non-virtual stock vehicles
      if (cleanVehicle.location !== 'Stock Virtuale') {
        // Make sure these fields are properly set
        if (!cleanVehicle.trim) cleanVehicle.trim = '';
        if (!cleanVehicle.fuelType) cleanVehicle.fuelType = '';
        if (!cleanVehicle.exteriorColor) cleanVehicle.exteriorColor = '';
        if (!cleanVehicle.transmission) cleanVehicle.transmission = '';
        if (!cleanVehicle.telaio) cleanVehicle.telaio = '';
      }
      
      // For virtual stock, clear fields that should be empty
      if (cleanVehicle.location === 'Stock Virtuale') {
        cleanVehicle.trim = '';
        cleanVehicle.fuelType = '';
        cleanVehicle.exteriorColor = '';
        cleanVehicle.transmission = '';
        cleanVehicle.telaio = '';
        cleanVehicle.accessories = [];
        cleanVehicle.price = 0;
      }
      
      console.log('Cleaned vehicle data for update:', cleanVehicle);
      console.log("damilare",cleanVehicle)
      
      // Actually perform the update
      const result = await updateMutation.mutateAsync(cleanVehicle);
      // console.log(result)
      
      console.log('Vehicle update response:', result);
      
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
      const vehicleId = typeof vehicleData === 'string' ? vehicleData : vehicleData.id;
      await duplicateVehicle(vehicleId);
      return true;
    } catch (error) {
      console.error('Error duplicating vehicle:', error);
      return false;
    } finally {
      setIsDuplicating(false);
    }
  };

  return {
    handleVehicleUpdate,
    isPending:updateMutation.isPending,
    handleVehicleDelete,
    handleVehicleDuplicate,
    isDeleting,
    isDuplicating
  };
};
