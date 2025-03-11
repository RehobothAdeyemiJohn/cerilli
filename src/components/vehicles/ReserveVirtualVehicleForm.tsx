import React, { useState, useEffect } from 'react';
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
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(true);
  const [dealerName, setDealerName] = useState<string>('');
  const { handleVehicleUpdate } = useInventory();
  
  const activeDealers = dealers.filter(dealer => dealer.isActive);
  
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

  const isLoading = isLoadingModels || isLoadingTrims || isLoadingFuelTypes || 
                    isLoadingColors || isLoadingTransmissions || isLoadingAccessories;

  const modelObj = models.find(m => m.name === vehicle.model);
  
  const compatibleTrims = modelObj && trims ? trims.filter(trim => 
    trim.compatibleModels.length === 0 || 
    trim.compatibleModels.includes(modelObj.id)
  ) : [];

  const compatibleFuelTypes = modelObj && fuelTypes ? fuelTypes.filter(fuel => 
    fuel.compatibleModels.length === 0 || 
    fuel.compatibleModels.includes(modelObj.id)
  ) : [];

  const compatibleColors = modelObj && colors ? colors.filter(color => 
    color.compatibleModels.length === 0 || 
    color.compatibleModels.includes(modelObj.id)
  ) : [];

  const compatibleTransmissions = modelObj && transmissions ? transmissions.filter(trans => 
    trans.compatibleModels.length === 0 || 
    trans.compatibleModels.includes(modelObj.id)
  ) : [];

  if (isLoading || !modelObj) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchColor = form.watch('exteriorColor');
  const watchTransmission = form.watch('transmission');
  const watchAccessories = form.watch('accessories');

  useEffect(() => {
    const updateCompatibleAccessories = async () => {
      if (vehicle.model && watchTrim) {
        const modelObj = models.find(m => m.name === vehicle.model);
        const trimObj = trims.find(t => t.name === watchTrim);
        
        if (modelObj && trimObj) {
          const compatibles = await accessoriesApi.getCompatible(modelObj.id, trimObj.id);
          setCompatibleAccessories(compatibles);
        } else {
          setCompatibleAccessories([]);
        }
      } else {
        setCompatibleAccessories([]);
      }
    };

    updateCompatibleAccessories();
  }, [vehicle.model, watchTrim, models, trims]);

  useEffect(() => {
    const updatePrice = async () => {
      if (vehicle.model && watchTrim && watchFuelType && watchColor && watchTransmission) {
        const modelObj = models.find(m => m.name === vehicle.model);
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
  }, [
    vehicle.model, 
    watchTrim, 
    watchFuelType, 
    watchColor, 
    watchTransmission, 
    watchAccessories, 
    models, 
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
