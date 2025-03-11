
import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, Accessory } from '@/types';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { dealers } from '@/data/mockData';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useInventory } from '@/hooks/useInventory';
import { 
  modelsApi, trimsApi, fuelTypesApi, colorsApi, 
  transmissionsApi, accessoriesApi, calculateVehiclePrice 
} from '@/api/localStorage';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const virtualReservationSchema = z.object({
  dealerId: z.string().min(1, { message: "È necessario selezionare un concessionario" }),
  trim: z.string().min(1, { message: "È necessario selezionare un allestimento" }),
  fuelType: z.string().min(1, { message: "È necessario selezionare un'alimentazione" }),
  exteriorColor: z.string().min(1, { message: "È necessario selezionare un colore" }),
  transmission: z.string().min(1, { message: "È necessario selezionare un cambio" }),
  accessories: z.array(z.string()).default([]),
});

type VirtualReservationFormValues = z.infer<typeof virtualReservationSchema>;

interface ReserveVirtualVehicleFormProps {
  vehicle: Vehicle;
  onCancel: () => void;
  onReservationComplete: () => void;
}

const ReserveVirtualVehicleForm = ({ 
  vehicle, 
  onCancel, 
  onReservationComplete 
}: ReserveVirtualVehicleFormProps) => {
  // Initialize form first to avoid React hook ordering issues
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

  // Queries for data fetching - these won't change order
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

  // Watch form fields - after form is initialized
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

  // If loading or missing critical data, show loader
  if (isLoading || !vehicle) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If model is not found, show error message
  if (!modelObj) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Errore: Modello non trovato o dati non disponibili</p>
        <Button type="button" variant="outline" onClick={onCancel} className="mt-4">
          Annulla
        </Button>
      </div>
    );
  }

  // Get compatible items from the memoized value
  const { compatibleTrims, compatibleFuelTypes, compatibleColors, compatibleTransmissions } = compatibleItems;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium">Configura e Prenota {vehicle.model}</h3>
        
        {isAdmin && (
          <FormField
            control={form.control}
            name="dealerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Concessionario</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un concessionario" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activeDealers.map(dealer => (
                      <SelectItem key={dealer.id} value={dealer.id}>
                        {dealer.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allestimento</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un allestimento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {compatibleTrims.map(trim => (
                      <SelectItem key={trim.id} value={trim.name}>
                        {trim.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alimentazione</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un'alimentazione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {compatibleFuelTypes.map(fuelType => (
                      <SelectItem key={fuelType.id} value={fuelType.name}>
                        {fuelType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="exteriorColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colore Esterno</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un colore" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {compatibleColors.map(color => (
                      <SelectItem key={color.id} value={`${color.name} (${color.type})`}>
                        {color.name} ({color.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cambio</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un cambio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {compatibleTransmissions.map(transmission => (
                      <SelectItem key={transmission.id} value={transmission.name}>
                        {transmission.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {compatibleAccessories.length > 0 && watchTrim && (
          <div className="space-y-2 pt-2">
            <FormLabel>Optional Disponibili</FormLabel>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
              {compatibleAccessories.map((accessory) => (
                <FormField
                  key={accessory.id}
                  control={form.control}
                  name="accessories"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(accessory.name)}
                          onCheckedChange={(checked) => {
                            const currentValue = [...(field.value || [])];
                            if (checked) {
                              field.onChange([...currentValue, accessory.name]);
                            } else {
                              field.onChange(currentValue.filter(value => value !== accessory.name));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
                        {accessory.name}
                        <span className="ml-1 text-xs text-gray-500">
                          (+€{accessory.priceWithVAT.toLocaleString('it-IT')})
                        </span>
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )}
        
        {calculatedPrice > 0 && (
          <div className="py-3 text-right">
            <p className="text-sm text-gray-500">Prezzo Totale:</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(calculatedPrice)}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit">
            Conferma Prenotazione
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReserveVirtualVehicleForm;
