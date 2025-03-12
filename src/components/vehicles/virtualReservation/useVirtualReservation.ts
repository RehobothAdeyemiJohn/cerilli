import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Vehicle } from '@/types';
import { 
  modelsApi, trimsApi, fuelTypesApi, colorsApi, 
  transmissionsApi, accessoriesApi 
} from '@/api/localStorage';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useInventory } from '@/hooks/useInventory';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { createVirtualReservationSchema, VirtualReservationFormValues } from './schema';
import { useCompatibleItems } from './useCompatibleItems';
import { useCalculatePrice } from './useCalculatePrice';
import { useCompatibleAccessories } from './useCompatibleAccessories';

export type { VirtualReservationFormValues } from './schema';

export const useVirtualReservation = (
  vehicle: Vehicle,
  onCancel: () => void,
  onReservationComplete: () => void
) => {
  // Get user information
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const dealerId = user?.dealerId || '';
  const dealerName = user?.dealerName || '';
  
  // Initialize form with the appropriate schema
  const reservationSchema = createVirtualReservationSchema(isAdmin);
  
  // Default values depend on user type
  const defaultValues: any = {
    trim: '',
    fuelType: '',
    exteriorColor: '',
    transmission: '',
    accessories: [],
    reservationDestination: '',
  };
  
  // Add dealerId field only for admins
  if (isAdmin) {
    defaultValues.dealerId = '';
  }
  
  const form = useForm<VirtualReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues,
  });
  
  const { handleVehicleUpdate } = useInventory();
  
  // Fetch active dealers from Supabase
  const { 
    data: activeDealers = [], 
    isLoading: isLoadingDealers 
  } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    staleTime: 0 // Set to 0 to always consider data stale
  });

  // Filter active dealers
  const filteredDealers = useMemo(() => {
    return activeDealers.filter(dealer => dealer.isActive);
  }, [activeDealers]);

  // Queries for data fetching
  const { 
    data: models = [], 
    isLoading: isLoadingModels 
  } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
    staleTime: 0 // Set to 0 to always consider data stale
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

  // Watch form fields
  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchColor = form.watch('exteriorColor');
  const watchTransmission = form.watch('transmission');
  const watchAccessories = form.watch('accessories');
  const watchReservationDestination = form.watch('reservationDestination');

  // Compute loading state
  const isLoading = isLoadingModels || isLoadingTrims || isLoadingFuelTypes || 
                    isLoadingColors || isLoadingTransmissions || isLoadingAccessories || isLoadingDealers;

  // Find model object safely with useMemo
  const modelObj = useMemo(() => {
    if (!vehicle?.model || !models || models.length === 0) return null;
    return models.find(m => m.name === vehicle.model) || null;
  }, [vehicle?.model, models]);

  // Use custom hooks for modular functionality
  const compatibleItems = useCompatibleItems(vehicle, modelObj, trims, fuelTypes, colors, transmissions);
  
  const calculatedPrice = useCalculatePrice(
    modelObj,
    watchTrim,
    watchFuelType,
    watchColor,
    watchTransmission,
    watchAccessories,
    trims,
    fuelTypes,
    colors,
    transmissions,
    accessories
  );
  
  const compatibleAccessories = useCompatibleAccessories(vehicle, watchTrim, modelObj, trims);

  const onSubmit = async (data: VirtualReservationFormValues) => {
    try {
      // Determine dealer ID and name based on user role
      let selectedDealerId = '';
      let selectedDealerName = '';
      
      if (isAdmin) {
        // For admin, use selected dealer from dropdown
        selectedDealerId = (data as any).dealerId;
        const selectedDealer = filteredDealers.find(dealer => dealer.id === selectedDealerId);
        selectedDealerName = selectedDealer ? selectedDealer.companyName : 'Unknown';
      } else {
        // For dealer, use authenticated user's dealer info
        selectedDealerId = dealerId;
        selectedDealerName = dealerName;
      }
      
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'reserved',
        reservedBy: selectedDealerName,
        reservationDestination: data.reservationDestination,
        virtualConfig: {
          trim: data.trim,
          fuelType: data.fuelType,
          exteriorColor: data.exteriorColor,
          transmission: data.transmission,
          accessories: data.accessories,
          price: calculatedPrice
        }
      };
      
      await handleVehicleUpdate(updatedVehicle);
      
      toast({
        title: "Veicolo Virtuale Prenotato",
        description: `${vehicle.model} configurato è stato prenotato per ${selectedDealerName}`,
      });
      
      onReservationComplete();
    } catch (error) {
      console.error('Error reserving virtual vehicle:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione del veicolo virtuale",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    modelObj,
    compatibleItems,
    compatibleAccessories,
    calculatedPrice,
    vehicle,
    isAdmin,
    activeDealers: filteredDealers,
    onCancel
  };
};
