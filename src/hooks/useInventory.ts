
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase';
import { Vehicle, Filter as VehicleFilter } from '@/types';
import { useLocationOptions } from './inventory/useLocations';
import { useVehicleActions } from './inventory/useVehicleActions';
import { useInventoryMutations } from './inventory/useMutations';

export const useInventory = () => {
  const [activeFilters, setActiveFilters] = useState<VehicleFilter | null>(null);
  const locationOptions = useLocationOptions();
  const { addVehicle } = useInventoryMutations();
  
  const { data: inventory = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
    staleTime: 0, // Set to 0 to always consider data stale and refresh immediately
  });
  
  const { 
    handleVehicleUpdate,
    handleVehicleDelete: handleVehicleDeleteBase,
    handleVehicleDuplicate
  } = useVehicleActions();

  // Wrap the handleVehicleDelete to provide the inventory
  const handleVehicleDelete = (vehicleId: string) => {
    handleVehicleDeleteBase(vehicleId, inventory);
  };

  return {
    inventory,
    isLoading,
    error,
    refetch,
    activeFilters,
    setActiveFilters,
    locationOptions,
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate,
    addVehicle,
  };
};
