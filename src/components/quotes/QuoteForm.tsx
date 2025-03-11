
import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

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
});

interface QuoteFormProps {
  vehicle: Vehicle;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const QuoteForm = ({ vehicle, onSubmit, onCancel }: QuoteFormProps) => {
  const [showTradeIn, setShowTradeIn] = useState(false);
  
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
    },
  });

  const watchDiscount = form.watch('discount') || 0;
  const watchTradeInValue = form.watch('tradeInValue') || 0;
  const watchHasTradeIn = form.watch('hasTradeIn');
  const watchReducedVAT = form.watch('reducedVAT');
  
  const vatRate = watchReducedVAT ? 0.04 : 0.22;
  const basePrice = useMemo(() => {
    const priceWithoutVAT = vehicle.price / 1.22;
    return Math.round(priceWithoutVAT * (1 + vatRate));
  }, [vehicle.price, vatRate]);

  const finalPrice = Math.max(0, basePrice - watchDiscount - (watchHasTradeIn ? watchTradeInValue : 0));

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const quoteData = {
      ...values,
      vehicleId: vehicle.id,
      price: basePrice,
      finalPrice: finalPrice,
      vatRate: vatRate,
    };
    onSubmit(quoteData);
  };

  return (
    <div className="w-full max-w-none text-base">
      <div className="mb-6 p-6 bg-gray-50 rounded-md">
        <h3 className="font-medium text-lg mb-3">Informazioni Veicolo</h3>
        <div className="grid grid-cols-3 gap-6">
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
          <div className="mt-5">
            <p className="text-gray-500 mb-2">Optional</p>
            <div className="grid grid-cols-3 gap-3">
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Nome Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci nome cliente" {...field} className="text-base py-3" />
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
                    <Input type="email" placeholder="cliente@esempio.com" {...field} className="text-base py-3" />
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
                    <Input placeholder="+39 123 456 7890" {...field} className="text-base py-3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-6 border-t pt-6">
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
                      className="text-base py-3"
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
                <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
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

          <div className="border-t pt-6">
            <FormField
              control={form.control}
              name="hasTradeIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-5">
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
              <div className="grid grid-cols-3 gap-6 pl-8 mb-5">
                <FormField
                  control={form.control}
                  name="tradeInBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Fiat" {...field} className="text-base py-3" />
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
                        <Input placeholder="Es. Panda" {...field} className="text-base py-3" />
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
                        <Input placeholder="Es. 2018" {...field} className="text-base py-3" />
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
                          className="text-base py-3"
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
                          className="text-base py-3"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="pt-6 border-t">
            <div className="flex justify-between mb-3 text-base">
              <span>Prezzo Veicolo {watchReducedVAT ? '(IVA 4%)' : '(IVA 22%)'}:</span>
              <span className="font-medium">{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between mb-3 text-base">
              <span>Sconto:</span>
              <span className="font-medium">- {formatCurrency(watchDiscount || 0)}</span>
            </div>
            {watchHasTradeIn && watchTradeInValue > 0 && (
              <div className="flex justify-between mb-3 text-base">
                <span>Valore Permuta:</span>
                <span className="font-medium">- {formatCurrency(watchTradeInValue)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-3 mt-3 text-lg">
              <span>Prezzo Finale:</span>
              <span className="text-primary">
                {formatCurrency(finalPrice)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 border border-gray-200 rounded-md hover:bg-gray-50 text-base"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-primary text-white rounded-md hover:bg-primary/90 text-base"
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
