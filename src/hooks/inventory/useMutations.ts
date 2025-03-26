
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase/vehiclesApi'; 
import { Vehicle } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useInventoryMutations = () => {
  const queryClient = useQueryClient();
  
  // Update vehicle mutation
  const updateMutation = useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      
      // Ensure all required fields are properly formatted
      const formattedVehicle = {
        ...vehicle,
        accessories: Array.isArray(vehicle.accessories) ? vehicle.accessories : [],
        price: typeof vehicle.price === 'number' ? vehicle.price : parseFloat(String(vehicle.price)) || 0
      };
      
      // Send update to Supabase
      const updatedVehicle = await vehiclesApi.update(vehicle.id, formattedVehicle);
      
      
      return updatedVehicle;
    },
    onSuccess: () => {
      // Force an immediate refetch of the vehicles data
      
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.refetchQueries({ queryKey: ['vehicles'] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del veicolo",
        variant: "destructive",
      });
    }
  });
  
  // Delete vehicle mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await vehiclesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Veicolo eliminato",
        description: "Il veicolo è stato eliminato con successo",
      });
    },
    onError: (error) => {
      // console.error('Error deleting vehicle:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del veicolo",
        variant: "destructive",
      });
    }
  });
  
  // Create vehicle mutation
  const createMutation = useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, 'id'>) => {
      // console.log('Create mutation called with vehicle:', vehicle);
      
      // Ensure price is a number and accessories is an array
      const formattedVehicle = {
        ...vehicle,
        accessories: Array.isArray(vehicle.accessories) ? vehicle.accessories : [],
        price: typeof vehicle.price === 'number' ? vehicle.price : parseFloat(String(vehicle.price)) || 0
      };
      
      return await vehiclesApi.create(formattedVehicle);
    },
    onSuccess: () => {
      // console.log('Create mutation completed successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Veicolo aggiunto",
        description: "Il nuovo veicolo è stato aggiunto con successo",
      });
    },
    onError: (error) => {
      // console.error('Error creating vehicle:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta del veicolo",
        variant: "destructive",
      });
    }
  });

  // Helper function to add a vehicle
  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      // console.log("Adding vehicle to Supabase:", vehicle);
      const newVehicle = await createMutation.mutateAsync(vehicle);
      // console.log("Response from Supabase vehicle creation:", newVehicle);
      return newVehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  // Helper function to duplicate a vehicle
  const duplicateVehicle = async (vehicleId: string) => {
    try {
      // console.log("Duplicating vehicle with ID:", vehicleId);
      const duplicatedVehicle = await vehiclesApi.duplicate(vehicleId);
      
      // Force a refresh of the vehicles data
      // console.log('Vehicle duplicated successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.refetchQueries({ queryKey: ['vehicles'] });
      
      toast({
        title: "Veicolo duplicato",
        description: "Il veicolo è stato duplicato con successo",
      });
      return duplicatedVehicle;
    } catch (error) {
      console.error('Error duplicating vehicle:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    updateMutation,
    deleteMutation,
    createMutation,
    addVehicle,
    duplicateVehicle
  };
};
