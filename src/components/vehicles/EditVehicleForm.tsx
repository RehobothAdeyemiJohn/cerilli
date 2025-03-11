
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vehicle, Accessory } from '@/types';
import { 
  modelsApi, 
  trimsApi, 
  fuelTypesApi, 
  colorsApi, 
  transmissionsApi, 
  accessoriesApi,
  calculateVehiclePrice 
} from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';
import { dealers } from '@/data/mockData';

// Schema modificato per gestire correttamente i veicoli in Stock Virtuale
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

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onComplete: (vehicle: Vehicle) => void;
  onCancel: () => void;
  locationOptions?: string[];
}

const EditVehicleForm = ({ vehicle, onComplete, onCancel, locationOptions }: EditVehicleFormProps) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(vehicle.price || 0);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const [locations, setLocations] = useState<string[]>(['Stock CMC', 'Stock Virtuale']);
  const [isVirtualStock, setIsVirtualStock] = useState<boolean>(vehicle.location === 'Stock Virtuale');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (locationOptions) {
      setLocations(locationOptions);
    } else {
      const defaultLocations = ['Stock CMC', 'Stock Virtuale'];
      const activeDealerLocations = dealers
        .filter(dealer => dealer.isActive)
        .map(dealer => dealer.companyName);
      setLocations([...defaultLocations, ...activeDealerLocations]);
    }
  }, [locationOptions]);

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

  const watchModel = form.watch('model');
  const watchTrim = form.watch('trim');
  const watchFuelType = form.watch('fuelType');
  const watchColor = form.watch('exteriorColor');
  const watchTransmission = form.watch('transmission');
  const watchAccessories = form.watch('accessories');
  const watchLocation = form.watch('location');

  // Aggiorniamo isVirtualStock quando cambia il valore di location
  useEffect(() => {
    setIsVirtualStock(watchLocation === 'Stock Virtuale');
  }, [watchLocation]);

  useEffect(() => {
    const updatePrice = async () => {
      // Se siamo in Stock Virtuale, il prezzo è sempre 0
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
    
    // Validazione personalizzata in base alla location
    if (isVirtualStock) {
      // Per Stock Virtuale, solo il modello è obbligatorio
      if (!data.model) {
        setValidationError("Il modello è obbligatorio.");
        return;
      }
    } else {
      // Per altre locations, tutti i campi principali sono obbligatori
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posizione</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona la posizione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
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
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modello</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona il modello" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Campi aggiuntivi da mostrare solo se NON è Stock Virtuale */}
        {!isVirtualStock && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allestimento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona l'allestimento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trims.map((trim) => (
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona lo stato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Disponibile</SelectItem>
                        <SelectItem value="reserved">Prenotato</SelectItem>
                        <SelectItem value="sold">Venduto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alimentazione</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona il tipo di alimentazione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fuelTypes.map((fuelType) => (
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona il colore" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((color) => (
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cambio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona il tipo di cambio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transmissions.map((transmission) => (
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
              
              <FormField
                control={form.control}
                name="telaio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero Telaio</FormLabel>
                    <FormControl>
                      <Input placeholder="es. WBA12345678901234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="accessories"
                render={() => (
                  <FormItem>
                    <FormLabel>Accessori Disponibili</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {compatibleAccessories.map((accessory) => (
                        <div key={accessory.id} className="flex items-start space-x-3 space-y-0">
                          <Checkbox
                            checked={form.getValues('accessories').includes(accessory.name)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('accessories');
                              const updated = checked
                                ? [...current, accessory.name]
                                : current.filter((name) => name !== accessory.name);
                              form.setValue('accessories', updated);
                            }}
                          />
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {accessory.name}
                              <span className="ml-1 text-sm text-gray-500">
                                (+€{accessory.priceWithVAT.toLocaleString('it-IT')})
                              </span>
                            </FormLabel>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg bg-gray-50 p-4 mt-6">
              <div className="text-lg font-semibold flex justify-between items-center">
                <span>Prezzo di Listino Calcolato:</span>
                <span className="text-xl">€{calculatedPrice.toLocaleString('it-IT')}</span>
              </div>
            </div>
          </>
        )}
        
        {/* Mostra eventuali errori di validazione */}
        {validationError && (
          <div className="text-red-500 text-sm mt-2">{validationError}</div>
        )}
        
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Annulla
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Aggiorna Veicolo
          </button>
        </div>
      </form>
    </Form>
  );
};

export default EditVehicleForm;
