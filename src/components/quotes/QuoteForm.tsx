import React, { useState, useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, Accessory, Dealer } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { accessoriesApi } from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  dealerId: z.string().optional(),
});

interface QuoteFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const QuoteForm = ({ vehicle, onSubmit, onCancel, isSubmitting = false }: QuoteFormProps) => {
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const { data: accessories = [] } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });
  
  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll
  });
  
  useEffect(() => {
    const getVehicleAccessories = async () => {
      if (vehicle?.model && vehicle?.trim) {
        // Get accessories compatible with this model
        const modelObj = await accessoriesApi.getCompatible(vehicle.model, vehicle.trim);
        setCompatibleAccessories(modelObj);
      }
    };
    
    if (vehicle) {
      getVehicleAccessories();
    }
  }, [vehicle?.model, vehicle?.trim]);
  
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
      dealerId: user?.dealerId || (dealers && dealers.length > 0 ? dealers[0].id : undefined),
    },
  });

  // Update dealerId when dealers data is loaded and user is not a dealer
  useEffect(() => {
    if (dealers && dealers.length > 0 && !user?.dealerId) {
      form.setValue('dealerId', dealers[0].id);
    } else if (user?.dealerId) {
      form.setValue('dealerId', user.dealerId);
    }
  }, [dealers, user?.dealerId, form]);

  const watchDiscount = form.watch('discount') || 0;
  const watchTradeInValue = form.watch('tradeInValue') || 0;
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchReducedVAT = form.watch('reducedVAT');
  const watchVehicleAccessories = form.watch('vehicleAccessories');
  
  const vatRate = watchReducedVAT ? 0.04 : 0.22;
  const basePrice = useMemo(() => {
    if (!vehicle) return 0;
    const priceWithoutVAT = vehicle.price / 1.22;
    return Math.round(priceWithoutVAT * (1 + vatRate));
  }, [vehicle?.price, vatRate]);

  const accessoryTotalPrice = useMemo(() => {
    return watchVehicleAccessories.reduce((total, accName) => {
      const accessory = compatibleAccessories.find(a => a.name === accName);
      return total + (accessory?.priceWithVAT || 0);
    }, 0);
  }, [watchVehicleAccessories, compatibleAccessories]);

  const finalPrice = Math.max(0, basePrice + accessoryTotalPrice - watchDiscount - (watchHasTradeIn ? watchTradeInValue : 0));

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!vehicle) {
      // Handle vehicle selection in the future
      return;
    }
    
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

  // If no vehicle is provided, we should show a selection screen in the future
  if (!vehicle) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-medium mb-4">Selezione Veicolo</h3>
        <p className="text-gray-500 mb-4">
          In questa sezione sarà possibile selezionare un veicolo per il preventivo.
          Questa funzionalità è in sviluppo.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Torna Indietro
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full text-sm">
      <div className="mb-3 p-2 bg-gray-50 rounded-md">
        <h3 className="font-medium text-base mb-1">Informazioni Veicolo</h3>
        <div className="grid grid-cols-6 gap-2">
          <div>
            <p className="text-xs text-gray-500">Modello</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Allestimento</p>
            <p className="font-medium">{vehicle.trim}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Colore</p>
            <p className="font-medium">{vehicle.exteriorColor}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prezzo</p>
            <p className="font-medium text-primary">{formatCurrency(vehicle.price)}</p>
          </div>
          {vehicle.transmission && (
            <div>
              <p className="text-xs text-gray-500">Cambio</p>
              <p className="font-medium">{vehicle.transmission}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Carburante</p>
            <p className="font-medium">{vehicle.fuelType}</p>
          </div>
        </div>
        
        {vehicle.accessories && vehicle.accessories.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Optional Inclusi</p>
            <div className="grid grid-cols-3 gap-1">
              {vehicle.accessories.map((accessory, idx) => (
                <div key={idx} className="text-xs flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1"></span>
                  {accessory}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          {/* Dealer Selection for Admin Users */}
          {isAdmin && (
            <FormField
              control={form.control}
              name="dealerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Dealer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm py-1">
                        <SelectValue placeholder="Seleziona Dealer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dealers.map((dealer) => (
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
          
          {/* Non-admin users with a dealerId - show readonly field */}
          {!isAdmin && user?.dealerId && dealers && (
            <div className="mb-4">
              <FormLabel className="text-xs">Dealer</FormLabel>
              <div className="border rounded-md p-2 bg-gray-50 text-sm">
                {dealers.find(d => d.id === user.dealerId)?.companyName || 'Dealer assegnato'}
              </div>
              <input type="hidden" {...form.register('dealerId')} value={user.dealerId} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Nome Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci nome cliente" {...field} className="text-sm py-1" />
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
                  <FormLabel className="text-xs">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@esempio.com" {...field} className="text-sm py-1" />
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
                  <FormLabel className="text-xs">Telefono</FormLabel>
                  <FormControl>
                    <Input placeholder="+39 123 456 7890" {...field} className="text-sm py-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t pt-2">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Sconto (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="text-sm py-1"
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
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs">IVA agevolata</FormLabel>
                    <p className="text-xs text-muted-foreground">
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
            <div className="border-t pt-2">
              <h3 className="font-medium text-sm mb-2">Optional Disponibili</h3>
              <div className="grid grid-cols-2 gap-2">
                {compatibleAccessories.map((accessory) => (
                  <FormField
                    key={accessory.id}
                    control={form.control}
                    name="vehicleAccessories"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2 space-y-0">
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
                        <div className="space-y-0.5 leading-none">
                          <FormLabel className="text-xs">
                            {accessory.name}
                            <span className="ml-1 text-xs text-gray-500">
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

          <div className="border-t pt-2">
            <FormField
              control={form.control}
              name="hasTradeIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 mb-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setShowTradeIn(!!checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-0.5 leading-none">
                    <FormLabel className="text-xs">
                      Permuta
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {showTradeIn && (
              <div className="grid grid-cols-5 gap-2 pl-5 mb-2">
                <FormField
                  control={form.control}
                  name="tradeInBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Fiat" {...field} className="text-sm py-1" />
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
                      <FormLabel className="text-xs">Modello</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Panda" {...field} className="text-sm py-1" />
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
                      <FormLabel className="text-xs">Anno</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. 2018" {...field} className="text-sm py-1" />
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
                      <FormLabel className="text-xs">Chilometri</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Es. 50000" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-sm py-1"
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
                      <FormLabel className="text-xs">Valore permuta (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-sm py-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <div className="grid grid-cols-4 gap-2 border p-2 rounded-md bg-gray-50">
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500">Prezzo Veicolo {watchReducedVAT ? '(IVA 4%)' : '(IVA 22%)'}</p>
                <p className="font-medium text-sm">{formatCurrency(basePrice)}</p>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500">Optional Aggiunti</p>
                <p className="font-medium text-sm">+ {formatCurrency(accessoryTotalPrice)}</p>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500">Sconto / Permuta</p>
                <p className="font-medium text-sm">- {formatCurrency((watchDiscount || 0) + (watchHasTradeIn ? watchTradeInValue : 0))}</p>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500 font-semibold">Prezzo Finale</p>
                <p className="font-bold text-sm text-primary">
                  {formatCurrency(finalPrice)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creazione...
                </>
              ) : (
                'Crea Preventivo'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default QuoteForm;
