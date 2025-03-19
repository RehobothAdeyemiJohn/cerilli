
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Vehicle } from '@/types';
import { vehiclesApi } from '@/api/supabase';
import { ordersApi } from '@/api/apiClient';
import { ZodFormattedError } from 'zod';
import { VirtualReservationFormValues } from '../schema';

export const useVirtualReservationSubmit = (
  vehicle: Vehicle,
  isAdmin: boolean,
  dealerId: string,
  dealerName: string,
  onReservationComplete: () => void,
  calculatedPrice: number,
  filteredDealers: any[] = []
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: VirtualReservationFormValues) => {
    // For admin, use selected dealer. For dealer, use their own ID
    const finalDealerId = isAdmin ? values.dealerId : dealerId;
    
    // If dealer ID is missing, show error
    if (!finalDealerId) {
      toast({
        title: "Errore",
        description: "Seleziona un concessionario prima di procedere.",
        variant: "destructive",
      });
      return;
    }
    
    // For admin, get dealer name from selected dealer
    let finalDealerName = dealerName;
    let dealerPlafond = null;
    if (isAdmin && values.dealerId) {
      const selectedDealer = filteredDealers.find(d => d.id === values.dealerId);
      finalDealerName = selectedDealer ? selectedDealer.companyName : '';
      
      // Get the dealer plafond value
      dealerPlafond = selectedDealer ? (selectedDealer.nuovo_plafond || selectedDealer.creditLimit || 0) : 0;
    } else if (!isAdmin) {
      // For dealer users, get their own plafond
      const selectedDealer = filteredDealers.find(d => d.id === dealerId);
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
    
    setIsSubmitting(true);
    
    console.log("Form data:", values);
    console.log("Reserving virtual vehicle:", vehicle.id);
    console.log("Dealer ID:", finalDealerId);
    console.log("Dealer Name:", finalDealerName);
    console.log("Calculated price:", calculatedPrice);
    console.log("Dealer Plafond:", dealerPlafond);
    
    try {
      // Prepare virtual config
      const virtualConfig = {
        model: vehicle.model,
        trim: values.trim,
        fuelType: values.fuelType,
        exteriorColor: values.exteriorColor,
        transmission: values.transmission,
        accessories: values.accessories || [],
        price: calculatedPrice || 0
      };
      
      // Call the API to reserve the vehicle
      await vehiclesApi.reserve(
        vehicle.id,
        finalDealerId,
        finalDealerName,
        values.accessories || [],
        virtualConfig,
        values.reservationDestination
      );
      
      // Create an order for the reserved virtual vehicle
      try {
        console.log("Creating order for the reserved virtual vehicle");
        await ordersApi.create({
          vehicleId: vehicle.id,
          dealerId: finalDealerId,
          customerName: finalDealerName,
          status: 'processing',
          orderDate: new Date().toISOString(),
          price: calculatedPrice || 0,
          // New fields
          dealerName: finalDealerName,
          modelName: vehicle.model,
          plafondDealer: dealerPlafond
        });
        console.log("Order created successfully");
      } catch (orderError) {
        console.error("Error creating order:", orderError);
        // Continue even if order creation fails, as the vehicle is already reserved
        toast({
          title: "Attenzione",
          description: "Veicolo prenotato ma si è verificato un problema nella creazione dell'ordine.",
          variant: "destructive",
        });
      }
      
      toast({
        title: "Veicolo Virtuale Prenotato",
        description: `${vehicle.model} ${values.trim || ''} è stato prenotato con successo.`,
      });
      
      console.log("Virtual vehicle reserved successfully");
      onReservationComplete();
    } catch (error) {
      console.error("Error reserving virtual vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione del veicolo virtuale.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { onSubmit, isSubmitting };
};
