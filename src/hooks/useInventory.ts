
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase';
import { dealersApi } from '@/api/supabase';
import { Vehicle, Filter as VehicleFilter, Dealer } from '@/types';
import { useLocationOptions } from './inventory/useLocations';
import { useVehicleActions } from './inventory/useVehicleActions';
import { useInventoryMutations } from './inventory/useMutations';

export const useInventory = () => {
  const [activeFilters, setActiveFilters] = useState<VehicleFilter | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<string | null>(null);
  const locationOptions = useLocationOptions();
  const { addVehicle } = useInventoryMutations();
  
  // Fetch vehicles
  const { data: inventory = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
    staleTime: 0, // Set to 0 to always consider data stale and refresh immediately
  });
  
  // Fetch dealers
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll
  });
  
  // Filter out vehicles that are in dealer stock or have been delivered
  const filteredInventory = inventory.filter(vehicle => 
    vehicle.location !== 'Stock Dealer' && 
    vehicle.status !== 'delivered'
  );
  
  const { 
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate
  } = useVehicleActions();

  return {
    inventory: filteredInventory,
    allVehicles: inventory,
    dealers,
    isLoading,
    error,
    refetch,
    activeFilters,
    setActiveFilters,
    selectedDealer,
    setSelectedDealer,
    locationOptions,
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate,
    addVehicle,
  };
};
