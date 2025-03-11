
import React, { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, Accessory } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { accessoriesApi } from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';

const formSchema = z.object({
  customerName: z.string().min(2, {
    message: "Il nome del cliente deve contenere almeno 2 caratteri.",
  }),
  customerEmail: z.string().email({
    message: "Inserisci un indirizzo email valido.",
  }),
  customerPhone: z.string().min(6, {
    message: "Inserisci un numero di telefono valido.",
  }),
  discount: z.number().min(0),
  hasTradeIn: z.boolean().default(false),
  tradeInValue: z.number().min(0).optional(),
  tradeInBrand: z.string().optional(),
  tradeInModel: z.string().optional(),
  tradeInYear: z.string().optional(),
  tradeInKm: z.number().min(0).optional(),
  reducedVAT: z.boolean().default(false),
  vehicleAccessories: z.array(z.string()).default([]),
});

interface QuoteFormProps {
  vehicle: Vehicle;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const QuoteForm = ({ vehicle, onSubmit, onCancel }: QuoteFormProps) => {
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  
  const { data: accessories = [] } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });
  
  useEffect(() => {
    const getVehicleAccessories = async () => {
      if (vehicle.model && vehicle.trim) {
        // Get model and trim IDs from names
        const modelObj = await accessoriesApi.getCompatible(vehicle.model, vehicle.trim);
        setCompatibleAccessories(modelObj);
      }
    };
    
    getVehicleAccessories();
  }, [vehicle.model, vehicle.trim]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      discount: 0,
      hasTradeIn: false,
      tradeInValue: 0,
      tradeInBrand: "",
      tradeInModel: "",
      tradeInYear: "",
      tradeInKm: 0,
      reducedVAT: false,
      vehicleAccessories: [],
    },
  });

  const watchDiscount = form.watch('discount') || 0;
  const watchTradeInValue = form.watch('tradeInValue') || 0;
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchVehicleAccessories = form.watch('vehicleAccessories');
  
  const vatRate = watchReducedVAT ? 0.04 : 0.22;
  const basePrice = useMemo(() => {
    const priceWithoutVAT = vehicle.price / 1.22;
    return Math.round(priceWithoutVAT * (1 + vatRate));
  }, [vehicle.price, vatRate]);

  const accessoryTotalPrice = useMemo(() => {
    return watchVehicleAccessories.reduce((total, accName) => {
      const accessory = compatibleAccessories.find(a => a.name === accName);
      return total + (accessory?.priceWithVAT || 0);
    }, 0);
  }, [watchVehicleAccessories, compatibleAccessories]);

  const finalPrice = Math.max(0, basePrice + accessoryTotalPrice - watchDiscount - (watchHasTradeIn ? watchTradeInValue : 0));

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const quoteData = {
      ...values,
      vehicleId: vehicle.id,
      price: basePrice,
      finalPrice: finalPrice,
      vatRate: vatRate,
      accessories: values.vehicleAccessories,
      accessoryPrice: accessoryTotalPrice
    };
    onSubmit(quoteData);
  };

  return (
    <div className="w-full max-w-none text-base">
      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-lg mb-2">Informazioni Veicolo</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500">Modello</p>
            <p className="font-medium text-lg">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-gray-500">Allestimento</p>
            <p className="font-medium text-lg">{vehicle.trim}</p>
          </div>
          <div>
            <p className="text-gray-500">Colore</p>
            <p className="font-medium text-lg">{vehicle.exteriorColor}</p>
          </div>
          <div>
            <p className="text-gray-500">Prezzo</p>
            <p className="font-medium text-lg text-primary">{formatCurrency(vehicle.price)}</p>
          </div>
          {vehicle.transmission && (
            <div>
              <p className="text-gray-500">Cambio</p>
              <p className="font-medium text-lg">{vehicle.transmission}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Carburante</p>
            <p className="font-medium text-lg">{vehicle.fuelType}</p>
          </div>
        </div>
        
        {vehicle.accessories && vehicle.accessories.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-500 mb-2">Optional Inclusi</p>
            <div className="grid grid-cols-3 gap-2">
              {vehicle.accessories.map((accessory, idx) => (
                <div key={idx} className="text-base flex items-center">
                  <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                  {accessory}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Nome Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci nome cliente" {...field} className="text-base py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@esempio.com" {...field} className="text-base py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Telefono</FormLabel>
                  <FormControl>
                    <Input placeholder="+39 123 456 7890" {...field} className="text-base py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Sconto (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="text-base py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reducedVAT"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4 h-[calc(100%-8px)]">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">IVA agevolata</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Applica IVA al 4% (Legge 104)
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {compatibleAccessories.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Optional Disponibili</h3>
              <div className="grid grid-cols-2 gap-3">
                {compatibleAccessories.map((accessory) => (
                  <FormField
                    key={accessory.id}
                    control={form.control}
                    name="vehicleAccessories"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0">
                        <Checkbox
                          checked={field.value?.includes(accessory.name)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            const updated = checked
                              ? [...current, accessory.name]
                              : current.filter((name) => name !== accessory.name);
                            field.onChange(updated);
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
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <FormField
              control={form.control}
              name="hasTradeIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setShowTradeIn(!!checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base">
                      Permuta
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {showTradeIn && (
              <div className="grid grid-cols-3 gap-4 pl-6 mb-4">
                <FormField
                  control={form.control}
                  name="tradeInBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Fiat" {...field} className="text-base py-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tradeInModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Modello</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Panda" {...field} className="text-base py-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradeInYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Anno</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. 2018" {...field} className="text-base py-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradeInKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Chilometri</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Es. 50000" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-base py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradeInValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Valore permuta (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-base py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-4 gap-3 border p-3 rounded-md bg-gray-50">
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Prezzo Veicolo {watchReducedVAT ? '(IVA 4%)' : '(IVA 22%)'}</p>
                <p className="font-medium text-base">{formatCurrency(basePrice)}</p>
              </div>
              
              {accessoryTotalPrice > 0 && (
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Optional Aggiunti</p>
                  <p className="font-medium text-base">+ {formatCurrency(accessoryTotalPrice)}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Sconto</p>
                <p className="font-medium text-base">- {formatCurrency(watchDiscount || 0)}</p>
              </div>
              
              {watchHasTradeIn && watchTradeInValue > 0 && (
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Valore Permuta</p>
                  <p className="font-medium text-base">- {formatCurrency(watchTradeInValue)}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-gray-500 text-sm font-semibold">Prezzo Finale</p>
                <p className="font-bold text-lg text-primary">
                  {formatCurrency(finalPrice)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 text-base"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-base"
            >
              Crea Preventivo
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default QuoteForm;
