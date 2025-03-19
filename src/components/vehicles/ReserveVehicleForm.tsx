import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { vehiclesApi } from '@/api/supabase';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase/dealersApi';
import { ordersApi } from '@/api/apiClient'; 
import { orderDetailsApi } from '@/api/orderDetailsApiSwitch';

const reserveSchema = z.object({
  dealerId: z.string().optional(),
  destinazione: z.string().min(1, {
    message: "È necessario specificare una destinazione per la prenotazione.",
  })
});

type ReserveFormValues = z.infer<typeof reserveSchema>;

interface ReserveVehicleFormProps {
  vehicle: Vehicle;
  onReservationComplete: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReserveVehicleForm: React.FC<ReserveVehicleFormProps> = ({
  vehicle,
  onReservationComplete,
  onCancel,
  isSubmitting
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
    resolver: zodResolver(reserveSchema),
    defaultValues: {
      dealerId: isAdmin ? '' : dealerId,
      destinazione: '',
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
          customerName: finalDealerName,
          status: 'processing',
          orderDate: new Date().toISOString(),
          dealerName: finalDealerName,
          modelName: vehicle.model,
          plafondDealer: dealerPlafond
        });
        
        console.log("Order created successfully:", orderResponse);
        orderId = orderResponse.id;
        
        if (orderId) {
          console.log("Creating order details for the order:", orderId);
          const orderDetailsResponse = await orderDetailsApi.create({
            orderId: orderId,
            isLicensable: false,
            hasProforma: false,
            isPaid: false,
            isInvoiced: false,
            hasConformity: false,
            odlGenerated: false,
            transportCosts: 0,
            restorationCosts: 0
          });
          
          console.log("Order details created successfully:", orderDetailsResponse);
        }
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
        description: `${vehicle.model} ${vehicle.trim || ''} è stato prenotato con successo.`,
      });
      
      console.log("Vehicle reserved successfully");
      onReservationComplete();
    } catch (error) {
      console.error("Error reserving vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione del veicolo.",
        variant: "destructive",
      });
    } finally {
      setIsLocalSubmitting(false);
    }
  };
  
  const isFormSubmitting = isSubmitting || isLocalSubmitting;
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Prenota Veicolo</h2>
      <p className="mb-4">
        Stai prenotando: <strong>{vehicle.model} {vehicle.trim}</strong>
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isAdmin && (
            <FormField
              control={form.control}
              name="dealerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concessionario</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona concessionario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeDealers.map(dealer => (
                        <SelectItem key={dealer.id} value={dealer.id}>{dealer.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="destinazione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destinazione</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona destinazione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Conto Esposizione">Conto Esposizione</SelectItem>
                    <SelectItem value="Stock">Stock</SelectItem>
                    <SelectItem value="Contratto Abbinato">Contratto Abbinato</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
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
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReserveVehicleForm;
