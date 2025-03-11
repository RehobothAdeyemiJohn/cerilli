
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase';
import { Vehicle } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useInventoryMutations = () => {
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: (vehicle: Vehicle) => vehiclesApi.update(vehicle.id, vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
  
  const createMutation = useMutation({
    mutationFn: (vehicle: Omit<Vehicle, 'id'>) => vehiclesApi.create(vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const newVehicle = await createMutation.mutateAsync(vehicle);
      return newVehicle;
    } catch (error) {
      console.error('Errore durante l\'aggiunta del veicolo:', error);
      throw error;
    }
  };

  return {
    updateMutation,
    deleteMutation,
    createMutation,
    addVehicle
  };
};
