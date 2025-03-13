
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
import { orderDetailsApi } from '@/api/orderDetailsApiSwitch';
import { useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from 'lucide-react';

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
        description: "I dati sono stati salvati nel database",
      });

      // Invalidate both orderDetails and orders queries to ensure the UI is updated
      queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      console.log('Order details saved, result:', result);

      if (onSuccess) {
        console.log('Calling onSuccess callback');
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
      
      const values = form.getValues();
      const savedDetails = await onSubmit(values);
      
      if (!savedDetails || !savedDetails.id) {
        throw new Error('Failed to save order details');
      }
      
      console.log('Generating ODL for order details ID:', savedDetails.id);
      
      const updatedDetails = await orderDetailsApi.generateODL(savedDetails.id);
      setHasGeneratedODL(true);
      
      toast({
        title: "ODL generato con successo",
        description: "L'ODL è stato generato correttamente",
      });
      
      if (onGenerateODL) {
        onGenerateODL(updatedDetails);
      }
      
      queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
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
    <Card className="shadow-sm border bg-white">
      <CardHeader className="bg-gray-50 border-b rounded-t-lg pb-4">
        <CardTitle className="text-xl font-bold text-gray-800">Amministrazione</CardTitle>
        <CardDescription className="text-gray-600">
          Dettagli amministrativi dell'ordine
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="previousChassis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">RIF Telaio precedente</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly={readOnly} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700 font-medium">Telaio</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly={readOnly} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Stato documentazione</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <FormField
                    control={form.control}
                    name="isLicensable"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={readOnly}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm cursor-pointer">Targabile</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasProforma"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={readOnly}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm cursor-pointer">Proformata</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPaid"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={readOnly}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm cursor-pointer">Saldata</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isInvoiced"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={readOnly}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm cursor-pointer">Fatturata</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasConformity"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={readOnly}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm cursor-pointer">Conformità</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {watchIsPaid && (
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Data pagamento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="GG/MM/AAAA" readOnly={readOnly} className="border-gray-300" />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500">
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
                          <FormLabel className="text-gray-700 font-medium">Numero fattura</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly={readOnly} className="border-gray-300" />
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
                          <FormLabel className="text-gray-700 font-medium">Data fattura</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="GG/MM/AAAA" readOnly={readOnly} className="border-gray-300" />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Inserire nel formato GG/MM/AAAA
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <FormField
                  control={form.control}
                  name="fundingType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-gray-700">Plafond</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                          disabled={readOnly}
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="Factor" />
                            </FormControl>
                            <FormLabel className="font-medium cursor-pointer">Factor</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="Captive" />
                            </FormControl>
                            <FormLabel className="font-medium cursor-pointer">Captive</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 border rounded-md p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                            <FormControl>
                              <RadioGroupItem value="Acquisto Diretto" />
                            </FormControl>
                            <FormLabel className="font-medium cursor-pointer">Acquisto Diretto</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="transportCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Costi di Trasporto (€)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly={readOnly} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700 font-medium">Costi di Ripristino (€)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly={readOnly} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      
      {!readOnly && (
        <CardFooter className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-4">
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="min-w-36 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva'}
          </Button>
          
          <Button 
            type="button" 
            onClick={handleGenerateODL} 
            disabled={isSubmitting || hasGeneratedODL}
            variant={hasGeneratedODL ? "outline" : "default"}
            className={`min-w-36 px-6 font-medium ${hasGeneratedODL 
              ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
              : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {hasGeneratedODL ? (
              <span className="flex items-center">
                <Check className="mr-1 h-4 w-4" />
                ODL Generato
              </span>
            ) : 'GENERA ODL'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default OrderDetailsForm;
