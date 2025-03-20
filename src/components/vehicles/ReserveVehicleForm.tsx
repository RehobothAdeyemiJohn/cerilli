
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dealersApi, vehiclesApi } from '@/api/supabase';
import { ordersApi } from '@/api/apiClient';
import { toast } from '@/hooks/use-toast';
import { Vehicle } from '@/types';

const formSchema = z.object({
  dealerId: z.string().optional(),
  destinazione: z.string().optional(),
});

type ReserveFormValues = z.infer<typeof formSchema>;

const ReserveVehicleForm = ({ 
  vehicle, 
  onCancel, 
  onReservationComplete,
  isSubmitting: externalIsSubmitting = false
}: { 
  vehicle: Vehicle; 
  onCancel: () => void; 
  onReservationComplete: () => void;
  isSubmitting?: boolean;
}) => {
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const { user } = useAuth();
  const dealerId = user?.dealerId || '';
  const dealerName = user?.dealerName || '';
  const isAdmin = user?.type === 'admin';
  
  const { data: dealers = [], isLoading: loadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin,
  });
  
  const activeDealers = dealers.filter(dealer => dealer.isActive);
  
  const form = useForm<ReserveFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerId: '',
      destinazione: 'Stock Dealer',
    },
  });
  
  const onSubmit = async (data: ReserveFormValues) => {
    const finalDealerId = isAdmin ? data.dealerId : dealerId;
    
    if (!finalDealerId) {
      toast({
        title: "Errore",
        description: "Seleziona un concessionario prima di procedere.",
        variant: "destructive",
      });
      return;
    }
    
    let finalDealerName = dealerName;
    let dealerPlafond = null;
    if (isAdmin && data.dealerId) {
      const selectedDealer = activeDealers.find(d => d.id === data.dealerId);
      finalDealerName = selectedDealer ? selectedDealer.companyName : '';
      
      dealerPlafond = selectedDealer ? (selectedDealer.nuovo_plafond || selectedDealer.creditLimit || 0) : 0;
    } else if (!isAdmin) {
      const selectedDealer = activeDealers.find(d => d.id === dealerId);
      dealerPlafond = selectedDealer ? (selectedDealer.nuovo_plafond || selectedDealer.creditLimit || 0) : 0;
    }
    
    if (!finalDealerName) {
      toast({
        title: "Errore",
        description: "Dati del dealer mancanti. Impossibile procedere con la prenotazione.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLocalSubmitting(true);
    
    console.log("Form data:", data);
    console.log("Reserving vehicle:", vehicle.id);
    console.log("Dealer ID:", finalDealerId);
    console.log("Dealer Name:", finalDealerName);
    console.log("Dealer Plafond:", dealerPlafond);
    
    try {
      await vehiclesApi.reserve(vehicle.id, finalDealerId, finalDealerName, [], undefined, data.destinazione);
      
      let orderId = '';
      try {
        console.log("Creating order for the reserved vehicle");
        const orderResponse = await ordersApi.create({
          vehicleId: vehicle.id,
          dealerId: finalDealerId,
          customerName: finalDealerName, // This will be stored in customername column in DB
          status: 'processing',
          orderDate: new Date().toISOString(),
          // Don't pass dealerName explicitly, it's mapped to customername
          modelName: vehicle.model,
          plafondDealer: dealerPlafond
        });
        
        console.log("Order created successfully:", orderResponse);
        orderId = orderResponse.id;
      } catch (orderError) {
        console.error("Error creating order or order details:", orderError);
        toast({
          title: "Attenzione",
          description: "Veicolo prenotato ma si è verificato un problema nella creazione dell'ordine.",
          variant: "destructive",
        });
      }
      
      toast({
        title: "Veicolo Prenotato",
        description: `${vehicle.model} è stato prenotato con successo.`,
      });
      
      onReservationComplete();
    } catch (error: any) {
      console.error("Error reserving vehicle:", error);
      toast({
        title: "Errore",
        description: error?.message || "Si è verificato un errore durante la prenotazione del veicolo.",
        variant: "destructive",
      });
    } finally {
      setIsLocalSubmitting(false);
    }
  };
  
  const isFormSubmitting = externalIsSubmitting || isLocalSubmitting;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Prenota {vehicle.model}</CardTitle>
        <CardDescription>Inserisci i dettagli della prenotazione</CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isAdmin && (
            <FormField
              control={form.control}
              name="dealerId"
              render={({ field }) => (
                <FormItem className="p-4 pb-0">
                  <FormLabel>Seleziona Concessionario</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={loadingDealers || isFormSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un concessionario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeDealers.map((dealer) => (
                        <SelectItem key={dealer.id} value={dealer.id}>
                          {dealer.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Scegli il concessionario che effettuerà la prenotazione
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="destinazione"
            render={({ field }) => (
              <FormItem className="p-4 pb-0">
                <FormLabel>Destinazione</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isFormSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona destinazione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Stock Dealer">Stock Dealer</SelectItem>
                    <SelectItem value="Vendita">Vendita</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Indica la destinazione del veicolo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <CardFooter className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isFormSubmitting}
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isFormSubmitting}
            >
              {isFormSubmitting ? 'Prenotazione in corso...' : 'Prenota'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ReserveVehicleForm;
