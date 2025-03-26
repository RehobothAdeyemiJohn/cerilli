
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Vehicle, Accessory } from '@/types';
import { 
  modelsApi, trimsApi, fuelTypesApi, colorsApi, 
  transmissionsApi, accessoriesApi, calculateVehiclePrice 
} from '@/api/supabase/settingsApi';

// Schema for vehicle edit form
const vehicleSchema = z.object({
  model: z.string().min(1, { message: "Il modello è obbligatorio." }),
  location: z.string().min(1, { message: "La posizione è obbligatoria." }),
  trim: z.string().optional(),
  fuelType: z.string().optional(),
  exteriorColor: z.string().optional(),
  transmission: z.string().optional(),
  status: z.enum(["available", "reserved", "sold", "ordered", "delivered"]).default("available"),
  telaio: z.string().optional(),
  accessories: z.array(z.string()).default([]),
  originalStock: z.string().optional()
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
  const [priceComponents, setPriceComponents] = useState<any>({});

  // console.log("Initial vehicle data for form:", vehicle);
  // console.log("Initial accessories:", vehicle.accessories);

  // Make sure accessories is always an array
  const safeAccessories = Array.isArray(vehicle.accessories) 
    ? vehicle.accessories 
    : [];

  // Initialize form with vehicle data
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: vehicle.model || '',
      trim: vehicle.trim || '',
      fuelType: vehicle.fuelType || '',
      exteriorColor: vehicle.exteriorColor || '',
      location: vehicle.location || '',
      transmission: vehicle.transmission || '',
      status: vehicle.status || 'available',
      telaio: vehicle.telaio || '',
      accessories: safeAccessories,
      originalStock: vehicle.originalStock || ''
    },
  });

  // Fetch model data
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

  // Fetch trim data
  const { data: trims = [] } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });

  // Fetch fuel type data
  const { data: fuelTypes = [] } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll
  });

  // Fetch color data
  const { data: colors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll
  });

  // Fetch transmission data
  const { data: transmissions = [] } = useQuery({
    queryKey: ['transmissions'],
    queryFn: transmissionsApi.getAll
  });

  // Fetch accessory data
  const { data: accessories = [] } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });

  // Watch form values
  const watchModel = form.watch('model');
  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchColor = form.watch('exteriorColor');
  const watchTransmission = form.watch('transmission');
  const watchAccessories = form.watch('accessories');
  const watchLocation = form.watch('location');
  const watchOriginalStock = form.watch('originalStock');

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
        setPriceComponents({});
        return;
      }

      if (watchModel && watchTrim && watchFuelType && watchColor && watchTransmission) {
        // console.log("Calculating price with:", {
        //   model: watchModel,
        //   trim: watchTrim,
        //   fuelType: watchFuelType,
        //   color: watchColor,
        //   transmission: watchTransmission,
        //   accessories: watchAccessories
        // });
        
        // Find model
        const modelObj = models.find(m => m.name === watchModel);
        
        // Find trim
        const trimObj = trims.find(t => t.name === watchTrim);
        
        // Find fuel type
        const fuelTypeObj = fuelTypes.find(f => f.name === watchFuelType);
        
        // Find color (handling different formats)
        let colorObj;
        if (watchColor && colors.length > 0) {
          // Try formatted string first (e.g., "Pure Ice (metallizzato)")
          if (watchColor.includes('(')) {
            const colorParts = watchColor.match(/^(.+) \((.+)\)$/);
            if (colorParts) {
              const colorName = colorParts[1].trim();
              const colorType = colorParts[2].trim();
              colorObj = colors.find(c => c.name === colorName && c.type === colorType);
            }
          }
          
          // If not found, try direct name match
          if (!colorObj) {
            colorObj = colors.find(c => c.name === watchColor);
          }
          
          // If still not found and there are parts, try each part
          if (!colorObj && watchColor.includes(' ')) {
            const parts = watchColor.split(' ');
            for (const part of parts) {
              colorObj = colors.find(c => c.name === part);
              if (colorObj) break;
            }
          }
        }
        
        // Find transmission
        const transmissionObj = transmissions.find(t => t.name === watchTransmission);

        // console.log("Found objects for price calculation:", {
        //   modelObj,
        //   trimObj,
        //   fuelTypeObj,
        //   colorObj,
        //   transmissionObj
        // });

        if (modelObj && trimObj && fuelTypeObj && colorObj && transmissionObj) {
          // Calculate each component's contribution to the price
          const components = {
            baseModelPrice: modelObj.basePrice || 0,
            trimPrice: trimObj.basePrice || 0,
            fuelTypeAdjustment: fuelTypeObj.price_adjustment || 0,
            colorAdjustment: colorObj.price_adjustment || 0,
            transmissionAdjustment: transmissionObj.price_adjustment || 0,
          };
          
          // console.log("Price components:", components);
          setPriceComponents(components);
          
          // Find accessory IDs based on names
          const selectedAccessoryIds = Array.isArray(watchAccessories) ? 
            watchAccessories
              .filter(name => name) // Filter out any empty strings
              .map(name => {
                const acc = accessories.find(a => a.name === name);
                return acc ? acc.id : '';
              })
              .filter(id => id !== '') : [];

          // console.log("Selected accessory IDs for price calculation:", selectedAccessoryIds);

          try {
            // Calculate total price
            const price = await calculateVehiclePrice(
              modelObj.id,
              trimObj.id,
              fuelTypeObj.id,
              colorObj.id,
              transmissionObj.id,
              selectedAccessoryIds
            );
            
            // console.log("Final calculated price:", price);
            setCalculatedPrice(price);
          } catch (error) {
            console.error("Error calculating price:", error);
          }
        }
      }
    };

    updatePrice();
  }, [watchModel, watchTrim, watchFuelType, watchColor, watchTransmission, watchAccessories, models, trims, fuelTypes, colors, transmissions, accessories, isVirtualStock]);

  // Update compatible accessories based on model and trim
  useEffect(() => {
    const updateCompatibleAccessories = async () => {
      if (watchModel && watchTrim && accessories.length > 0) {
        // console.log("Fetching compatible accessories for model:", watchModel, "and trim:", watchTrim);
        
        try {
          const modelObj = models.find(m => m.name === watchModel);
          const trimObj = trims.find(t => t.name === watchTrim);
          
          if (modelObj && trimObj) {
            // console.log("Found model and trim objects:", modelObj, trimObj);
            const compatibles = await accessoriesApi.getCompatible(modelObj.id, trimObj.id);
            // console.log("Compatible accessories:", compatibles);
            setCompatibleAccessories(compatibles);
          } else {
            // console.log("Model or trim not found in available options");
            setCompatibleAccessories([]);
          }
        } catch (error) {
          console.error("Error fetching compatible accessories:", error);
          setCompatibleAccessories([]);
        }
      } else {
        // console.log("Missing model or trim, can't fetch compatible accessories");
        setCompatibleAccessories([]);
      }
    };

    updateCompatibleAccessories();
  }, [watchModel, watchTrim, models, trims, accessories]);

  // Form submission handler
  const onSubmit = async (data: VehicleFormValues) => {
    // console.log("Form submitted with data:", data);
    setValidationError(null);
    
    // Custom validation based on location
    if (isVirtualStock) {
      // For Stock Virtuale, model and originalStock are required
      if (!data.model) {
        setValidationError("Il modello è obbligatorio.");
        return;
      }
      
      if (!data.originalStock) {
        setValidationError("Lo stock origine è obbligatorio per veicoli in Stock Virtuale");
        return;
      }
      
      if (data.originalStock !== 'Cina' && data.originalStock !== 'Germania') {
        setValidationError("Lo stock origine deve essere 'Cina' o 'Germania'");
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
    
    // Calculate estimated arrival days for Virtual Stock
    let estimatedArrivalDays = vehicle.estimatedArrivalDays;
    if (isVirtualStock && data.originalStock) {
      // Only recalculate if origin changed or not previously set
      const originChanged = data.originalStock !== vehicle.originalStock;
      const noExistingEstimate = !vehicle.estimatedArrivalDays;
      
      if (originChanged || noExistingEstimate) {
        if (data.originalStock === 'Germania') {
          // Germany stock: 38-52 days
          estimatedArrivalDays = Math.floor(Math.random() * (52 - 38 + 1)) + 38;
        } else if (data.originalStock === 'Cina') {
          // China stock: 90-120 days
          estimatedArrivalDays = Math.floor(Math.random() * (120 - 90 + 1)) + 90;
        }
        console.log(`Calculated new estimated arrival days: ${estimatedArrivalDays}`);
      }
    }
    
    // Prepare updated vehicle data
    const updatedVehicle: Vehicle = {
      ...vehicle,
      model: data.model,
      trim: isVirtualStock ? '' : (data.trim || ''),
      fuelType: isVirtualStock ? '' : (data.fuelType || ''),
      exteriorColor: isVirtualStock ? '' : (data.exteriorColor || ''),
      location: data.location,
      transmission: isVirtualStock ? '' : (data.transmission || ''),
      status: data.status,
      telaio: isVirtualStock ? '' : (data.telaio || ''),
      accessories: isVirtualStock ? [] : (Array.isArray(data.accessories) ? data.accessories : []),
      price: isVirtualStock ? 0 : calculatedPrice,
      originalStock: isVirtualStock ? (data.originalStock as 'Cina' | 'Germania') : undefined,
      estimatedArrivalDays: isVirtualStock ? estimatedArrivalDays : undefined
    };
    
    // console.log("Submitting updated vehicle:", updatedVehicle);
    onComplete(updatedVehicle);
  };

  return {
    form,
    calculatedPrice,
    compatibleAccessories,
    isVirtualStock,
    validationError,
    priceComponents,
    onSubmit,
    onCancel
  };
};
