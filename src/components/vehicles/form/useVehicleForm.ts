
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

// Schema for vehicle form
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

export const useVehicleForm = (onComplete: (newVehicle: Vehicle | null) => void) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [isVirtualStock, setIsVirtualStock] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [priceComponents, setPriceComponents] = useState<any>({});

  // Initialize form with default values
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: '',
      trim: '',
      fuelType: '',
      exteriorColor: '',
      location: 'Stock CMC',
      transmission: '',
      status: 'available',
      telaio: '',
      accessories: [],
      originalStock: ''
    },
  });

  // Fetch data from Supabase
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

  // Update calculated price based on selections
  useEffect(() => {
    const updatePrice = async () => {
      // If we're in Stock Virtuale, the price is always 0
      if (isVirtualStock) {
        setCalculatedPrice(0);
        setPriceComponents({});
        return;
      }

      if (watchModel && watchTrim && watchFuelType && watchColor && watchTransmission) {
        console.log("Calculating price with:", {
          model: watchModel,
          trim: watchTrim,
          fuelType: watchFuelType,
          color: watchColor,
          transmission: watchTransmission,
          accessories: watchAccessories
        });

        const modelObj = models.find(m => m.name === watchModel);
        const trimObj = trims.find(t => t.name === watchTrim);
        const fuelTypeObj = fuelTypes.find(f => f.name === watchFuelType);
        
        // Handle different color formats
        let colorObj;
        if (watchColor) {
          if (watchColor.includes('(')) {
            const colorParts = watchColor.match(/^(.+) \((.+)\)$/);
            if (colorParts) {
              const colorName = colorParts[1].trim();
              const colorType = colorParts[2].trim();
              colorObj = colors.find(c => c.name === colorName && c.type === colorType);
            }
          } else {
            colorObj = colors.find(c => c.name === watchColor);
          }
        }
        
        const transmissionObj = transmissions.find(t => t.name === watchTransmission);

        console.log("Found objects:", {
          modelObj,
          trimObj,
          fuelTypeObj,
          colorObj,
          transmissionObj
        });

        if (modelObj && trimObj && fuelTypeObj && colorObj && transmissionObj) {
          // Store price components for debugging
          const components = {
            baseModelPrice: modelObj.basePrice || 0,
            trimPrice: trimObj.basePrice || 0,
            fuelTypeAdjustment: fuelTypeObj.priceAdjustment || 0,
            colorAdjustment: colorObj.priceAdjustment || 0,
            transmissionAdjustment: transmissionObj.priceAdjustment || 0,
          };
          
          console.log("Price components:", components);
          setPriceComponents(components);

          // Get accessory IDs for price calculation
          const selectedAccessoryIds = Array.isArray(watchAccessories) ? 
            watchAccessories
              .filter(name => name)
              .map(name => {
                const acc = accessories.find(a => a.name === name);
                return acc ? acc.id : '';
              })
              .filter(id => id !== '') : [];

          try {
            const price = await calculateVehiclePrice(
              modelObj.id,
              trimObj.id,
              fuelTypeObj.id,
              colorObj.id,
              transmissionObj.id,
              selectedAccessoryIds
            );
            
            console.log("Final calculated price:", price);
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
      if (watchModel && watchTrim) {
        try {
          const modelObj = models.find(m => m.name === watchModel);
          const trimObj = trims.find(t => t.name === watchTrim);
          
          if (modelObj && trimObj) {
            console.log("Fetching compatible accessories for:", modelObj.id, trimObj.id);
            const compatibles = await accessoriesApi.getCompatible(modelObj.id, trimObj.id);
            console.log("Received compatible accessories:", compatibles);
            setCompatibleAccessories(compatibles);
          } else {
            console.log("Model or trim not found");
            setCompatibleAccessories([]);
          }
        } catch (error) {
          console.error("Error fetching compatible accessories:", error);
          setCompatibleAccessories([]);
        }
      } else {
        setCompatibleAccessories([]);
      }
    };

    updateCompatibleAccessories();
  }, [watchModel, watchTrim, models, trims]);

  // Form submission handler
  const onSubmit = async (data: VehicleFormValues) => {
    try {
      setValidationError(null);
      
      // Custom validation based on location
      if (isVirtualStock) {
        // For Stock Virtuale, only model and originalStock are required
        if (!data.model) {
          setValidationError("Il modello è obbligatorio.");
          return;
        }
        
        if (!data.originalStock) {
          setValidationError("Lo stock origine è obbligatorio per veicoli in Stock Virtuale");
          return;
        }
        
        // Validate originalStock value
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
      
      // Calculate estimated arrival days for virtual stock
      let estimatedArrivalDays: number | undefined = undefined;
      if (isVirtualStock && data.originalStock) {
        // Ensure originalStock is of the correct type
        const stockOrigin = data.originalStock as 'Cina' | 'Germania';
        
        if (stockOrigin === 'Germania') {
          // Germany stock: 38-52 days
          estimatedArrivalDays = Math.floor(Math.random() * (52 - 38 + 1)) + 38;
        } else if (stockOrigin === 'Cina') {
          // China stock (default): 90-120 days
          estimatedArrivalDays = Math.floor(Math.random() * (120 - 90 + 1)) + 90;
        }
        console.log("Estimated arrival days:", estimatedArrivalDays);
      }
      
      // Prepare vehicle data for creation
      const newVehicleData: Omit<Vehicle, 'id'> = {
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
        dateAdded: new Date().toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
        originalStock: isVirtualStock ? (data.originalStock as 'Cina' | 'Germania') : undefined,
        estimatedArrivalDays: estimatedArrivalDays
      };
      
      console.log("Prepared vehicle data for Supabase:", newVehicleData);
      
      // Pass the vehicle to the callback
      onComplete(newVehicleData as Vehicle);
    } catch (error) {
      console.error('Error during vehicle save:', error);
      setValidationError("Si è verificato un errore durante il salvataggio del veicolo.");
    }
  };

  return {
    form,
    calculatedPrice,
    compatibleAccessories,
    isVirtualStock,
    validationError,
    priceComponents,
    onSubmit
  };
};
