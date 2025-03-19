
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { ordersApi } from '@/api/apiClient';
import { formatCurrency } from '@/lib/utils';

// Create a schema for the form
const orderDetailsSchema = z.object({
  isLicensable: z.boolean().default(false),
  hasProforma: z.boolean().default(false),
  isPaid: z.boolean().default(false),
  paymentDate: z.date().optional(),
  isInvoiced: z.boolean().default(false),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date().optional(),
  hasConformity: z.boolean().default(false),
  fundingType: z.string().optional(),
  chassis: z.string().optional(),
  transportCosts: z.number().default(0),
  restorationCosts: z.number().default(0),
  notes: z.string().optional(),
});

type OrderDetailsFormValues = z.infer<typeof orderDetailsSchema>;

interface OrderDetailsFormProps {
  order: Order;
  onSaved: () => void;
  onCancel: () => void;
}

const OrderDetailsForm: React.FC<OrderDetailsFormProps> = ({ order, onSaved, onCancel }) => {
  // Initialize the form with default values from the order details
  const form = useForm<OrderDetailsFormValues>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: {
      isLicensable: order.isLicensable || false,
      hasProforma: order.hasProforma || false,
      isPaid: order.isPaid || false,
      paymentDate: order.paymentDate ? new Date(order.paymentDate) : undefined,
      isInvoiced: order.isInvoiced || false,
      invoiceNumber: order.invoiceNumber || '',
      invoiceDate: order.invoiceDate ? new Date(order.invoiceDate) : undefined,
      hasConformity: order.hasConformity || false,
      fundingType: order.fundingType || '',
      chassis: order.chassis || '',
      transportCosts: order.transportCosts || 0,
      restorationCosts: order.restorationCosts || 0,
      notes: order.notes || '',
    },
  });

  const watchIsPaid = form.watch('isPaid');
  const watchIsInvoiced = form.watch('isInvoiced');

  const onSubmit = async (data: OrderDetailsFormValues) => {
    try {
      console.log("Updating order details:", data);
      
      // Format dates to ISO strings
      const updatedData = {
        ...data,
        paymentDate: data.paymentDate ? data.paymentDate.toISOString() : undefined,
        invoiceDate: data.invoiceDate ? data.invoiceDate.toISOString() : undefined,
      };
      
      await ordersApi.update(order.id, updatedData);
      
      console.log("Order details updated successfully");
      toast({
        title: "Dettagli aggiornati",
        description: "I dettagli dell'ordine sono stati aggiornati con successo.",
      });
      
      onSaved();
    } catch (error) {
      console.error("Error updating order details:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dei dettagli dell'ordine.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="text-md font-semibold mb-3">Informazioni Ordine</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p>Numero Ordine:</p>
                <p className="font-medium">{order.progressiveNumber ? `#${order.progressiveNumber.toString().padStart(3, '0')}` : order.id.substring(0, 6)}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <p>Cliente:</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <p>Modello:</p>
                <p className="font-medium">{order.modelName || (order.vehicle ? order.vehicle.model : '-')}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <p>Data Ordine:</p>
                <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <p>Prezzo:</p>
                <p className="font-medium">{formatCurrency(order.price || 0)}</p>
              </div>
            </div>
          </div>
          
          {/* Right column: Flags and statuses */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="isLicensable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border rounded-md">
                  <FormLabel className="cursor-pointer">Targabile</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasProforma"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border rounded-md">
                  <FormLabel className="cursor-pointer">Proforma Presente</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border rounded-md">
                  <FormLabel className="cursor-pointer">Pagato</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isInvoiced"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border rounded-md">
                  <FormLabel className="cursor-pointer">Fatturato</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasConformity"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border rounded-md">
                  <FormLabel className="cursor-pointer">Prova di Conformità</FormLabel>
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
        </div>
        
        {/* Additional fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment details */}
          {watchIsPaid && (
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data di Pagamento</FormLabel>
                  <DatePicker 
                    date={field.value} 
                    onSelect={field.onChange}
                    disabled={!watchIsPaid}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Invoice details */}
          {watchIsInvoiced && (
            <>
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero Fattura</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Es. 2023/0123"
                        {...field}
                        disabled={!watchIsInvoiced}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Fattura</FormLabel>
                    <DatePicker 
                      date={field.value} 
                      onSelect={field.onChange}
                      disabled={!watchIsInvoiced}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Chassis */}
          <FormField
            control={form.control}
            name="chassis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telaio (se diverso)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Numero telaio"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Inserire solo se diverso dal telaio originale
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Funding Type */}
          <FormField
            control={form.control}
            name="fundingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalità Finanziamento</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona modalità" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nessun finanziamento</SelectItem>
                    <SelectItem value="Contanti">Contanti</SelectItem>
                    <SelectItem value="Bonifico">Bonifico</SelectItem>
                    <SelectItem value="Finanziamento">Finanziamento</SelectItem>
                    <SelectItem value="Leasing">Leasing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Costs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="transportCosts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costi di Trasporto (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="restorationCosts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costi di Ripristino (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Note aggiuntive..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Annulla
          </Button>
          <Button type="submit">Salva Modifiche</Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderDetailsForm;
