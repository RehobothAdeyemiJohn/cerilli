
import { useQuery } from '@tanstack/react-query';
import { Vehicle, VehicleModel } from '@/types';
import { 
  modelsApi, trimsApi, fuelTypesApi, colorsApi, 
  transmissionsApi, accessoriesApi 
} from '@/api/localStorage';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useMemo } from 'react';

export const useVirtualReservationData = (vehicle: Vehicle, isAdmin: boolean) => {
  // Queries for data fetching
  const { 
    data: models = [], 
    isLoading: isLoadingModels 
  } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
    staleTime: 0
  });

  const { 
    data: trims = [], 
    isLoading: isLoadingTrims 
  } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });

  const { 
    data: fuelTypes = [], 
    isLoading: isLoadingFuelTypes 
  } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll
  });

  const { 
    data: colors = [], 
    isLoading: isLoadingColors 
  } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll
  });

  const { 
    data: transmissions = [], 
    isLoading: isLoadingTransmissions 
  } = useQuery({
    queryKey: ['transmissions'],
    queryFn: transmissionsApi.getAll
  });

  const { 
    data: accessories = [], 
    isLoading: isLoadingAccessories 
  } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });

  // Fetch active dealers from Supabase
  const { 
    data: activeDealers = [], 
    isLoading: isLoadingDealers 
  } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    staleTime: 0,
    enabled: isAdmin
  });

  // Filter active dealers
  const filteredDealers = useMemo(() => {
    return activeDealers.filter(dealer => dealer.isActive);
  }, [activeDealers]);

  // Compute loading state
  const isLoading = isLoadingModels || isLoadingTrims || isLoadingFuelTypes || 
                  isLoadingColors || isLoadingTransmissions || isLoadingAccessories || 
                  (isAdmin && isLoadingDealers);

  // Find model object safely with useMemo
  const modelObj = useMemo(() => {
    if (!vehicle?.model || !models || models.length === 0) return null;
    return models.find(m => m.name === vehicle.model) || null;
  }, [vehicle?.model, models]);

  return {
    models,
    trims,
    fuelTypes,
    colors,
    transmissions,
    accessories,
    filteredDealers,
    isLoading,
    modelObj
  };
};
