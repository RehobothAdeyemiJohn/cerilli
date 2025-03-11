
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Vehicle, Accessory } from '@/types';
import { 
  modelsApi, trimsApi, fuelTypesApi, colorsApi, 
  transmissionsApi, accessoriesApi, calculateVehiclePrice 
} from '@/api/localStorage';
import { dealers } from '@/data/mockData';
import { useInventory } from '@/hooks/useInventory';
import { toast } from '@/hooks/use-toast';

// Schema for virtual vehicle reservation
const virtualReservationSchema = z.object({
  dealerId: z.string().min(1, { message: "È necessario selezionare un concessionario" }),
  trim: z.string().min(1, { message: "È necessario selezionare un allestimento" }),
  fuelType: z.string().min(1, { message: "È necessario selezionare un'alimentazione" }),
  exteriorColor: z.string().min(1, { message: "È necessario selezionare un colore" }),
  transmission: z.string().min(1, { message: "È necessario selezionare un cambio" }),
  accessories: z.array(z.string()).default([]),
});

export type VirtualReservationFormValues = z.infer<typeof virtualReservationSchema>;

export const useVirtualReservation = (
  vehicle: Vehicle,
  onCancel: () => void,
  onReservationComplete: () => void
) => {
  // Initialize form
  const form = useForm<VirtualReservationFormValues>({
    resolver: zodResolver(virtualReservationSchema),
    defaultValues: {
      dealerId: '',
      trim: '',
      fuelType: '',
      exteriorColor: '',
      transmission: '',
      accessories: [],
    },
  });

  // Component state
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(true);
  const [dealerName, setDealerName] = useState<string>('');
  
  const { handleVehicleUpdate } = useInventory();
  
  // Filter active dealers
  const activeDealers = useMemo(() => {
    return dealers.filter(dealer => dealer.isActive);
  }, []);

  // Queries for data fetching
  const { 
    data: models = [], 
    isLoading: isLoadingModels 
  } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
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

  // Compute loading state
  const isLoading = isLoadingModels || isLoadingTrims || isLoadingFuelTypes || 
                    isLoadingColors || isLoadingTransmissions || isLoadingAccessories;

  // Find model object safely with useMemo
  const modelObj = useMemo(() => {
    if (!vehicle?.model || !models || models.length === 0) return null;
    return models.find(m => m.name === vehicle.model) || null;
  }, [vehicle?.model, models]);

  // Compute compatible items safely with useMemo
  const compatibleItems = useMemo(() => {
    if (!modelObj || !trims || !fuelTypes || !colors || !transmissions) {
      return {
        compatibleTrims: [],
        compatibleFuelTypes: [],
        compatibleColors: [],
        compatibleTransmissions: []
      };
    }

    return {
      compatibleTrims: trims.filter(trim => 
        !trim.compatibleModels || 
        trim.compatibleModels.length === 0 || 
        trim.compatibleModels.includes(modelObj.id)
      ),
      compatibleFuelTypes: fuelTypes.filter(fuel => 
        !fuel.compatibleModels || 
        fuel.compatibleModels.length === 0 || 
        fuel.compatibleModels.includes(modelObj.id)
      ),
      compatibleColors: colors.filter(color => 
        !color.compatibleModels || 
        color.compatibleModels.length === 0 || 
        color.compatibleModels.includes(modelObj.id)
      ),
      compatibleTransmissions: transmissions.filter(trans => 
        !trans.compatibleModels || 
        trans.compatibleModels.length === 0 || 
        trans.compatibleModels.includes(modelObj.id)
      )
    };
  }, [modelObj, trims, fuelTypes, colors, transmissions]);

  // Update accessories when trim changes
  useEffect(() => {
    const updateCompatibleAccessories = async () => {
      if (!vehicle?.model || !watchTrim || !modelObj) {
        setCompatibleAccessories([]);
        return;
      }

      const trimObj = trims.find(t => t.name === watchTrim);
      
      if (trimObj) {
        try {
          const compatibles = await accessoriesApi.getCompatible(modelObj.id, trimObj.id);
          setCompatibleAccessories(compatibles || []);
        } catch (error) {
          console.error('Error fetching compatible accessories:', error);
          setCompatibleAccessories([]);
        }
      } else {
        setCompatibleAccessories([]);
      }
    };

    updateCompatibleAccessories();
  }, [vehicle?.model, watchTrim, modelObj, trims]);

  // Update price calculation
  useEffect(() => {
    const updatePrice = async () => {
      if (!modelObj || !watchTrim || !watchFuelType || !watchColor || !watchTransmission) {
        setCalculatedPrice(0);
        return;
      }

      const trimObj = trims.find(t => t.name === watchTrim);
      const fuelTypeObj = fuelTypes.find(f => f.name === watchFuelType);
      
      const colorParts = watchColor.match(/^(.+) \((.+)\)$/);
      const colorName = colorParts ? colorParts[1] : watchColor;
      const colorType = colorParts ? colorParts[2] : '';
      const colorObj = colors.find(c => c.name === colorName && c.type === colorType);
      
      const transmissionObj = transmissions.find(t => t.name === watchTransmission);

      if (trimObj && fuelTypeObj && colorObj && transmissionObj) {
        try {
          const selectedAccessoryIds = watchAccessories
            .map(name => {
              const acc = accessories.find(a => a.name === name);
              return acc ? acc.id : '';
            })
            .filter(id => id !== '');

          const price = await calculateVehiclePrice(
            modelObj.id,
            trimObj.id,
            fuelTypeObj.id,
            colorObj.id,
            transmissionObj.id,
            selectedAccessoryIds
          );
          
          setCalculatedPrice(price);
        } catch (error) {
          console.error('Error calculating price:', error);
          setCalculatedPrice(0);
        }
      } else {
        setCalculatedPrice(0);
      }
    };

    updatePrice();
  }, [
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
  ]);

  const onSubmit = async (data: VirtualReservationFormValues) => {
    try {
      const selectedDealer = activeDealers.find(dealer => dealer.id === data.dealerId);
      const dealerDisplayName = selectedDealer ? selectedDealer.companyName : dealerName || 'Unknown';
      
      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: 'reserved',
        reservedBy: dealerDisplayName,
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
        description: `${vehicle.model} configurato è stato prenotato per ${dealerDisplayName}`,
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
    activeDealers,
    onCancel
  };
};
