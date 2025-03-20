
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Vehicle } from '@/types';
import { vehiclesApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';
import { VirtualReservationFormValues } from '../schema';
import { supabase } from '@/api/supabase/client';

export const useVirtualReservationSubmit = (
  vehicle: Vehicle,
  isAdmin: boolean,
  dealerId: string,
  dealerName: string,
  onReservationComplete: () => void,
  calculatedPrice?: number,
  filteredDealers?: any[]
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (values: VirtualReservationFormValues) => {
    if (!vehicle || !vehicle.id) {
      console.error("Invalid vehicle data");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the dealer ID either from form (admin) or user context
      const reservationDealerId = isAdmin ? values.dealerId : dealerId;

      if (!reservationDealerId) {
        throw new Error("Dealer ID is required for reservation");
      }

      // Find dealer name if admin selected a dealer
      let selectedDealerName = dealerName;
      if (isAdmin && filteredDealers && filteredDealers.length > 0) {
        const selectedDealer = filteredDealers.find(d => d.id === reservationDealerId);
        if (selectedDealer) {
          selectedDealerName = selectedDealer.companyName;
        }
      }

      // Prepare reservation data
      const reservationData = {
        vehicleId: vehicle.id,
        reservedBy: reservationDealerId,
        reservationDate: new Date().toISOString(),
        reservationStatus: 'pending',
        reservationDestination: values.reservationDestination || 'Conto Esposizione',
        reservedAccessories: values.accessories || [],
        virtualConfig: {
          trim: values.trim || '',
          fuelType: values.fuelType || '',
          exteriorColor: values.exteriorColor || '',
          transmission: values.transmission || '',
          accessories: values.accessories || [],
          price: calculatedPrice || 0,
          finalPrice: calculatedPrice || 0,
          dealerName: selectedDealerName
        }
      };

      // Update vehicle status to reserved with reservation data
      await vehiclesApi.update(vehicle.id, {
        status: 'reserved',
        reservedBy: reservationDealerId,
        reservedAccessories: values.accessories || [],
        virtualConfig: reservationData.virtualConfig,
      });

      // Get dealer info to store plafond_dealer at order creation time
      let dealerPlafond = null;
      
      if (reservationDealerId) {
        try {
          const { data: dealer } = await supabase
            .from('dealers')
            .select('*')
            .eq('id', reservationDealerId)
            .maybeSingle();
            
          if (dealer) {
            dealerPlafond = dealer.nuovo_plafond || dealer.credit_limit || 0;
          }
        } catch (e) {
          console.error('Error fetching dealer for plafond:', e);
        }
      }
      
      // Prepare order record using camelCase column names
      const orderRecord = {
        vehicleid: vehicle.id,
        dealerid: reservationDealerId,
        customername: selectedDealerName,
        status: 'processing',
        orderdate: new Date().toISOString(),
        dealername: selectedDealerName,
        modelname: vehicle.model,
        price: calculatedPrice || 0,
        plafonddealer: dealerPlafond,
        // Set default values for boolean fields
        islicensable: false,
        hasproforma: false,
        ispaid: false,
        isinvoiced: false,
        hasconformity: false,
        odlgenerated: false,
        transportcosts: 0,
        restorationcosts: 0
      };
      
      console.log("Attempting to insert order with camelCase names:", orderRecord);
      
      // Create order directly using exact camelCase column names
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderRecord)
        .select()
        .single();
        
      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created successfully:", orderData);

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Show success message
      toast({
        title: "Prenotazione effettuata",
        description: `Il veicolo ${vehicle.model} è stato prenotato con successo.`,
      });

      // Complete the reservation flow
      onReservationComplete();
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la prenotazione del veicolo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
