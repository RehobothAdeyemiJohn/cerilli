
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { OrderDetails, Vehicle } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { orderDetailsApi } from '@/api/supabase/orderDetailsApi';
import { useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const orderDetailsSchema = z.object({
  previousChassis: z.string().optional(),
  chassis: z.string().optional(),
  isLicensable: z.boolean().default(false),
  hasProforma: z.boolean().default(false),
  isPaid: z.boolean().default(false),
  paymentDate: z.string().optional().nullable(),
  isInvoiced: z.boolean().default(false),
  invoiceNumber: z.string().optional().nullable(),
  invoiceDate: z.string().optional().nullable(),
  hasConformity: z.boolean().default(false),
  fundingType: z.enum(['Factor', 'Captive', 'Acquisto Diretto']).optional().nullable(),
  transportCosts: z.coerce.number().default(0),
  restorationCosts: z.coerce.number().default(0),
});

type OrderDetailsFormValues = z.infer<typeof orderDetailsSchema>;

interface OrderDetailsFormProps {
  orderId: string;
  orderDetails?: OrderDetails | null;
  vehicle?: Vehicle;
  onGenerateODL?: (details: OrderDetails) => void;
  onSuccess?: () => void;
  readOnly?: boolean;
}

const OrderDetailsForm = ({
  orderId,
  orderDetails,
  vehicle,
  onGenerateODL,
  onSuccess,
  readOnly = false,
}: OrderDetailsFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasGeneratedODL, setHasGeneratedODL] = useState(orderDetails?.odlGenerated || false);

  const form = useForm<OrderDetailsFormValues>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: {
      previousChassis: orderDetails?.previousChassis || vehicle?.previousChassis || '',
      chassis: orderDetails?.chassis || vehicle?.telaio || '',
      isLicensable: orderDetails?.isLicensable || false,
      hasProforma: orderDetails?.hasProforma || false,
      isPaid: orderDetails?.isPaid || false,
      paymentDate: orderDetails?.paymentDate ? new Date(orderDetails.paymentDate).toLocaleDateString('it-IT') : '',
      isInvoiced: orderDetails?.isInvoiced || false,
      invoiceNumber: orderDetails?.invoiceNumber || '',
      invoiceDate: orderDetails?.invoiceDate ? new Date(orderDetails.invoiceDate).toLocaleDateString('it-IT') : '',
      hasConformity: orderDetails?.hasConformity || false,
      fundingType: orderDetails?.fundingType || null,
      transportCosts: orderDetails?.transportCosts || 0,
      restorationCosts: orderDetails?.restorationCosts || 0,
    },
  });

  useEffect(() => {
    if (orderDetails || vehicle) {
      form.reset({
        previousChassis: orderDetails?.previousChassis || vehicle?.previousChassis || '',
        chassis: orderDetails?.chassis || vehicle?.telaio || '',
        isLicensable: orderDetails?.isLicensable || false,
        hasProforma: orderDetails?.hasProforma || false,
        isPaid: orderDetails?.isPaid || false,
        paymentDate: orderDetails?.paymentDate ? new Date(orderDetails.paymentDate).toLocaleDateString('it-IT') : '',
        isInvoiced: orderDetails?.isInvoiced || false,
        invoiceNumber: orderDetails?.invoiceNumber || '',
        invoiceDate: orderDetails?.invoiceDate ? new Date(orderDetails.invoiceDate).toLocaleDateString('it-IT') : '',
        hasConformity: orderDetails?.hasConformity || false,
        fundingType: orderDetails?.fundingType || null,
        transportCosts: orderDetails?.transportCosts || 0,
        restorationCosts: orderDetails?.restorationCosts || 0,
      });
      setHasGeneratedODL(orderDetails?.odlGenerated || false);
    }
  }, [orderDetails, vehicle, form]);

  const onSubmit = async (values: OrderDetailsFormValues) => {
    try {
      setIsSubmitting(true);

      // Format dates for the database (YYYY-MM-DD)
      const formatDate = (dateStr: string | null | undefined): string | undefined => {
        if (!dateStr) return undefined;
        
        try {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } catch (e) {
          console.error('Error parsing date:', dateStr, e);
          return undefined;
        }
      };

      const formattedDetails = {
        orderId,
        previousChassis: values.previousChassis,
        chassis: values.chassis,
        isLicensable: values.isLicensable,
        hasProforma: values.hasProforma,
        isPaid: values.isPaid,
        paymentDate: formatDate(values.paymentDate),
        isInvoiced: values.isInvoiced,
        invoiceNumber: values.invoiceNumber,
        invoiceDate: formatDate(values.invoiceDate),
        hasConformity: values.hasConformity,
        fundingType: values.fundingType as 'Factor' | 'Captive' | 'Acquisto Diretto' | undefined,
        transportCosts: values.transportCosts,
        restorationCosts: values.restorationCosts,
        odlGenerated: hasGeneratedODL
      };

      console.log('Saving order details:', formattedDetails);

      let result;
      if (orderDetails?.id) {
        result = await orderDetailsApi.update(orderDetails.id, formattedDetails);
      } else {
        result = await orderDetailsApi.create(formattedDetails);
      }

      toast({
        title: "Dettagli dell'ordine salvati con successo",
      });

      queryClient.invalidateQueries({ queryKey: ['orderDetails', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (error) {
      console.error('Error saving order details:', error);
      toast({
        title: "Errore durante il salvataggio",
        description: "Controlla i dati inseriti e riprova",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateODL = async () => {
    try {
      setIsSubmitting(true);
      
      // First save the form data
      const values = form.getValues();
      const savedDetails = await onSubmit(values);
      
      if (!savedDetails || !savedDetails.id) {
        throw new Error('Failed to save order details');
      }
      
      console.log('Generating ODL for order details ID:', savedDetails.id);
      
      // Then generate the ODL
      const updatedDetails = await orderDetailsApi.generateODL(savedDetails.id);
      setHasGeneratedODL(true);
      
      toast({
        title: "ODL generato con successo",
      });
      
      if (onGenerateODL) {
        onGenerateODL(updatedDetails);
      }
      
      queryClient.invalidateQueries({ queryKey: ['orderDetails', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error('Error generating ODL:', error);
      toast({
        title: "Errore durante la generazione dell'ODL",
        description: "Controlla i dati inseriti e riprova",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchIsPaid = form.watch('isPaid');
  const watchIsInvoiced = form.watch('isInvoiced');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amministrazione</CardTitle>
        <CardDescription>
          Dettagli amministrativi dell'ordine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="previousChassis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RIF Telaio precedente</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="chassis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telaio</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="isLicensable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Targabile</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hasProforma"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Proformata</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Saldata</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isInvoiced"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readOnly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Fatturata</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watchIsPaid && (
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data pagamento (GG/MM/AAAA)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="GG/MM/AAAA" readOnly={readOnly} />
                        </FormControl>
                        <FormDescription>
                          Inserire nel formato GG/MM/AAAA
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {watchIsInvoiced && (
                  <>
                    <FormField
                      control={form.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numero fattura</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly={readOnly} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="invoiceDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data fattura (GG/MM/AAAA)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="GG/MM/AAAA" readOnly={readOnly} />
                          </FormControl>
                          <FormDescription>
                            Inserire nel formato GG/MM/AAAA
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="hasConformity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Conformità</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fundingType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Plafond</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        className="flex flex-col space-y-1"
                        disabled={readOnly}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Factor" />
                          </FormControl>
                          <FormLabel className="font-normal">Factor</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Captive" />
                          </FormControl>
                          <FormLabel className="font-normal">Captive</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Acquisto Diretto" />
                          </FormControl>
                          <FormLabel className="font-normal">Acquisto Diretto</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transportCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costi di Trasporto (€)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly={readOnly} />
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
                        <Input type="number" {...field} readOnly={readOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {!readOnly && (
              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvataggio...' : 'Salva'}
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleGenerateODL} 
                  disabled={isSubmitting || hasGeneratedODL}
                  variant={hasGeneratedODL ? "outline" : "default"}
                >
                  {hasGeneratedODL ? 'ODL Già Generato' : 'GENERA ODL'}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OrderDetailsForm;
