
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/localStorage';
import { Vehicle, Filter as VehicleFilter, Dealer } from '@/types';
import { toast } from '@/hooks/use-toast';
import { dealers } from '@/data/mockData';

export const useInventory = () => {
  const [activeFilters, setActiveFilters] = useState<VehicleFilter | null>(null);
  const [locationOptions, setLocationOptions] = useState<string[]>(['Stock CMC', 'Stock Virtuale']);
  const queryClient = useQueryClient();
  
  // Load dealer names to use as location options
  useEffect(() => {
    const defaultLocations = ['Stock CMC', 'Stock Virtuale'];
    const activeDealerLocations = dealers
      .filter(dealer => dealer.isActive)
      .map(dealer => dealer.companyName);
    setLocationOptions([...defaultLocations, ...activeDealerLocations]);
  }, []);
  
  const { data: inventory = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
  });
  
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
    return createMutation.mutateAsync(vehicle);
  };

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
  
  const handleVehicleDelete = (vehicleId: string) => {
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
    // Create a duplicate of the vehicle without the ID
    const { id, ...vehicleWithoutId } = vehicle;
    
    // Add a suffix to indicate it's a copy
    const newVehicle = {
      ...vehicleWithoutId,
      model: vehicle.model,
      trim: vehicle.trim,
      dateAdded: new Date().toISOString().split('T')[0], // Set today's date
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
    inventory,
    isLoading,
    error,
    activeFilters,
    setActiveFilters,
    locationOptions,
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate,
    addVehicle,
  };
};
