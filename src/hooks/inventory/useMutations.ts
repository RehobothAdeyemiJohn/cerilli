
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
      toast({
        title: "Veicolo aggiornato",
        description: "Il veicolo è stato aggiornato con successo",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('Delete mutation called for ID:', id);
      return vehiclesApi.delete(id);
    },
    onSuccess: () => {
      console.log('Delete mutation completed successfully');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
  
  const createMutation = useMutation({
    mutationFn: (vehicle: Omit<Vehicle, 'id'>) => vehiclesApi.create(vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      console.log("Veicolo creato con successo in Supabase");
      toast({
        title: "Veicolo aggiunto",
        description: "Il nuovo veicolo è stato aggiunto con successo",
      });
    },
    onError: (error) => {
      console.error('Errore durante la creazione del veicolo:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta del veicolo",
        variant: "destructive",
      });
    }
  });

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      console.log("Tentativo di aggiungere veicolo in Supabase:", vehicle);
      const newVehicle = await createMutation.mutateAsync(vehicle);
      console.log("Risposta da Supabase dopo creazione veicolo:", newVehicle);
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
