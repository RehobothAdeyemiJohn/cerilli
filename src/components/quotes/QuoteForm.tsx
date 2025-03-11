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
import { Plus } from 'lucide-react';

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
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium">Informazioni Veicolo</h3>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Modello</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Allestimento</p>
            <p className="font-medium">{vehicle.trim}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Colore</p>
            <p className="font-medium">{vehicle.exteriorColor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Prezzo</p>
            <p className="font-medium text-primary">{formatCurrency(vehicle.price)}</p>
          </div>
          {vehicle.transmission && (
            <div>
              <p className="text-sm text-gray-500">Cambio</p>
              <p className="font-medium">{vehicle.transmission}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Carburante</p>
            <p className="font-medium">{vehicle.fuelType}</p>
          </div>
        </div>
        
        {vehicle.accessories && vehicle.accessories.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-1">Optional</p>
            <div className="grid grid-cols-3 gap-2">
              {vehicle.accessories.map((accessory, idx) => (
                <div key={idx} className="text-sm flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
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
                  <FormLabel>Nome Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci nome cliente" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cliente@esempio.com" {...field} />
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
                  <FormLabel>Telefono</FormLabel>
                  <FormControl>
                    <Input placeholder="+39 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sconto (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>IVA agevolata</FormLabel>
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
                    <FormLabel>
                      Permuta
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {showTradeIn && (
              <div className="grid grid-cols-3 gap-4 pl-7 mb-4">
                <FormField
                  control={form.control}
                  name="tradeInBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Fiat" {...field} />
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
                      <FormLabel>Modello</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. Panda" {...field} />
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
                      <FormLabel>Anno</FormLabel>
                      <FormControl>
                        <Input placeholder="Es. 2018" {...field} />
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
                      <FormLabel>Chilometri</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Es. 50000" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                      <FormLabel>Valore permuta (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
            <div className="flex justify-between mb-2">
              <span>Prezzo Veicolo {watchReducedVAT ? '(IVA 4%)' : '(IVA 22%)'}:</span>
              <span>{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Sconto:</span>
              <span>- {formatCurrency(watchDiscount || 0)}</span>
            </div>
            {watchHasTradeIn && watchTradeInValue > 0 && (
              <div className="flex justify-between mb-2">
                <span>Valore Permuta:</span>
                <span>- {formatCurrency(watchTradeInValue)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Prezzo Finale:</span>
              <span className="text-primary">
                {formatCurrency(finalPrice)}
              </span>
            </div>
          </div>

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
              Crea Preventivo
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default QuoteForm;
