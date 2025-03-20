
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
      
      // Using EXACTLY the database column names from the schema
      console.log("Preparing order record with correct DB column names");
      const orderRecord = {
        vehicle_id: vehicle.id, // Correct DB column name
        dealer_id: reservationDealerId, // Correct DB column name
        customername: selectedDealerName, // Use customername as it appears in DB, not customer_name
        status: 'processing',
        orderdate: new Date().toISOString(), // Use orderdate as it appears in DB, not order_date
        model_name: vehicle.model, // Correct DB column name
        price: calculatedPrice || 0,
        plafond_dealer: dealerPlafond, // Correct DB column name
        // Default values for boolean fields
        is_licensable: false, 
        has_proforma: false, 
        is_paid: false, 
        is_invoiced: false, 
        has_conformity: false, 
        odl_generated: false, 
        transport_costs: 0, 
        restoration_costs: 0 
      };
      
      console.log("Inserting order with correct DB columns:", orderRecord);
      
      // Use the exact column names from the database schema
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderRecord)
        .select()
        .maybeSingle();
        
      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      console.log("Order created successfully:", orderData);

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Success message
      toast({
        title: "Prenotazione effettuata",
        description: `Il veicolo ${vehicle.model} è stato prenotato con successo.`,
      });

      // Complete reservation flow
      onReservationComplete();
    } catch (error) {
      console.error("Errore durante la creazione della prenotazione:", error);
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
