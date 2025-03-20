
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase/vehiclesApi'; 
import { Vehicle } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useInventoryMutations = () => {
  const queryClient = useQueryClient();
  
  // Update vehicle mutation
  const updateMutation = useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      console.log('Supabase mutation updating vehicle:', vehicle);
      
      // Ensure all required fields are properly formatted
      const formattedVehicle = {
        ...vehicle,
        accessories: Array.isArray(vehicle.accessories) ? vehicle.accessories : [],
        price: typeof vehicle.price === 'number' ? vehicle.price : 0
      };
      
      // Send update to Supabase
      return await vehiclesApi.update(vehicle.id, formattedVehicle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Veicolo aggiornato",
        description: "Il veicolo è stato aggiornato con successo",
      });
    },
    onError: (error) => {
      console.error('Error updating vehicle:', error);
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
      console.log('Delete mutation called for ID:', id);
      return await vehiclesApi.delete(id);
    },
    onSuccess: () => {
      console.log('Delete mutation completed successfully');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Veicolo eliminato",
        description: "Il veicolo è stato eliminato con successo",
      });
    },
    onError: (error) => {
      console.error('Error deleting vehicle:', error);
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
      console.log('Create mutation called with vehicle:', vehicle);
      return await vehiclesApi.create(vehicle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Veicolo aggiunto",
        description: "Il nuovo veicolo è stato aggiunto con successo",
      });
    },
    onError: (error) => {
      console.error('Error creating vehicle:', error);
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
      console.log("Adding vehicle to Supabase:", vehicle);
      const newVehicle = await createMutation.mutateAsync(vehicle);
      console.log("Response from Supabase vehicle creation:", newVehicle);
      return newVehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };

  // Helper function to duplicate a vehicle
  const duplicateVehicle = async (vehicleId: string) => {
    try {
      console.log("Duplicating vehicle with ID:", vehicleId);
      const duplicatedVehicle = await vehiclesApi.duplicate(vehicleId);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
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
