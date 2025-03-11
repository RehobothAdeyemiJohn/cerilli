
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Vehicle, Accessory } from '@/types';
import { 
  modelsApi, trimsApi, fuelTypesApi, colorsApi, 
  transmissionsApi, accessoriesApi, calculateVehiclePrice 
} from '@/api/localStorage';

// Schema for vehicle edit form
const vehicleSchema = z.object({
  model: z.string().min(1, { message: "Il modello è obbligatorio." }),
  location: z.string().min(1, { message: "La posizione è obbligatoria." }),
  trim: z.string().optional(),
  fuelType: z.string().optional(),
  exteriorColor: z.string().optional(),
  transmission: z.string().optional(),
  status: z.enum(["available", "reserved", "sold"]).default("available"),
  telaio: z.string().optional(),
  accessories: z.array(z.string()).default([])
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export const useEditVehicleForm = (
  vehicle: Vehicle,
  onComplete: (vehicle: Vehicle) => void,
  onCancel: () => void
) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(vehicle.price || 0);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [isVirtualStock, setIsVirtualStock] = useState<boolean>(vehicle.location === 'Stock Virtuale');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form with vehicle data
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: vehicle.model,
      trim: vehicle.trim,
      fuelType: vehicle.fuelType,
      exteriorColor: vehicle.exteriorColor,
      location: vehicle.location,
      transmission: vehicle.transmission || '',
      status: vehicle.status,
      telaio: vehicle.telaio || '',
      accessories: vehicle.accessories || []
    },
  });

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

  const { data: trims = [] } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });

  const { data: fuelTypes = [] } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll
  });

  const { data: colors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll
  });

  const { data: transmissions = [] } = useQuery({
    queryKey: ['transmissions'],
    queryFn: transmissionsApi.getAll
  });

  const { data: accessories = [] } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });

  const watchModel = form.watch('model');
  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchColor = form.watch('exteriorColor');
  const watchTransmission = form.watch('transmission');
  const watchAccessories = form.watch('accessories');
  const watchLocation = form.watch('location');

  // Update isVirtualStock when location changes
  useEffect(() => {
    setIsVirtualStock(watchLocation === 'Stock Virtuale');
  }, [watchLocation]);

  // Update price based on selections
  useEffect(() => {
    const updatePrice = async () => {
      // If we're in Stock Virtuale, the price is always 0
      if (isVirtualStock) {
        setCalculatedPrice(0);
        return;
      }

      if (watchModel && watchTrim && watchFuelType && watchColor && watchTransmission) {
        const modelObj = models.find(m => m.name === watchModel);
        const trimObj = trims.find(t => t.name === watchTrim);
        const fuelTypeObj = fuelTypes.find(f => f.name === watchFuelType);
        const colorParts = watchColor.match(/^(.+) \((.+)\)$/);
        const colorName = colorParts ? colorParts[1] : watchColor;
        const colorType = colorParts ? colorParts[2] : '';
        const colorObj = colors.find(c => c.name === colorName && c.type === colorType);
        const transmissionObj = transmissions.find(t => t.name === watchTransmission);

        if (modelObj && trimObj && fuelTypeObj && colorObj && transmissionObj) {
          const selectedAccessoryIds = watchAccessories.map(name => {
            const acc = accessories.find(a => a.name === name);
            return acc ? acc.id : '';
          }).filter(id => id !== '');

          const price = await calculateVehiclePrice(
            modelObj.id,
            trimObj.id,
            fuelTypeObj.id,
            colorObj.id,
            transmissionObj.id,
            selectedAccessoryIds
          );
          
          setCalculatedPrice(price);
        }
      }
    };

    updatePrice();
  }, [watchModel, watchTrim, watchFuelType, watchColor, watchTransmission, watchAccessories, models, trims, fuelTypes, colors, transmissions, accessories, isVirtualStock]);

  // Update compatible accessories based on model and trim
  useEffect(() => {
    const updateCompatibleAccessories = async () => {
      if (watchModel && watchTrim) {
        const modelObj = models.find(m => m.name === watchModel);
        const trimObj = trims.find(t => t.name === watchTrim);
        if (modelObj && trimObj) {
          const compatibles = await accessoriesApi.getCompatible(modelObj.id, trimObj.id);
          setCompatibleAccessories(compatibles);
        }
      }
    };

    updateCompatibleAccessories();
  }, [watchModel, watchTrim, models, trims]);

  const onSubmit = (data: VehicleFormValues) => {
    setValidationError(null);
    
    // Custom validation based on location
    if (isVirtualStock) {
      // For Stock Virtuale, only model is required
      if (!data.model) {
        setValidationError("Il modello è obbligatorio.");
        return;
      }
    } else {
      // For other locations, all main fields are required
      if (!data.model || !data.trim || !data.fuelType || !data.exteriorColor || 
          !data.location || !data.transmission || !data.status || !data.telaio) {
        setValidationError("Tutti i campi sono obbligatori per veicoli non in Stock Virtuale");
        return;
      }
    }
    
    const updatedVehicle: Vehicle = {
      ...vehicle,
      model: data.model,
      trim: isVirtualStock ? '' : data.trim || '',
      fuelType: isVirtualStock ? '' : data.fuelType || '',
      exteriorColor: isVirtualStock ? '' : data.exteriorColor || '',
      location: data.location,
      transmission: isVirtualStock ? '' : data.transmission || '',
      status: data.status,
      telaio: isVirtualStock ? '' : data.telaio || '',
      accessories: isVirtualStock ? [] : data.accessories || [],
      price: isVirtualStock ? 0 : calculatedPrice
    };
    
    onComplete(updatedVehicle);
  };

  return {
    form,
    calculatedPrice,
    compatibleAccessories,
    isVirtualStock,
    validationError,
    onSubmit,
    onCancel
  };
};
