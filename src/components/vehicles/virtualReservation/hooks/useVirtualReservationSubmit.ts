
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
      
      // CRITICAL: Assicurati che i nomi delle colonne corrispondano esattamente 
      // a quelli della tabella nel database
      const orderRecord = {
        vehicleid: vehicle.id, // DB column name
        dealerid: reservationDealerId, // DB column name
        customername: selectedDealerName, // DB column name (NON usare dealername!)
        status: 'processing',
        orderdate: new Date().toISOString(), // DB column name
        model_name: vehicle.model, // DB column name (Usa model_name, non modelname)
        price: calculatedPrice || 0,
        plafond_dealer: dealerPlafond, // DB column name (Usa plafond_dealer, non plafonddealer)
        // Imposta valori predefiniti per i campi booleani
        is_licensable: false, // DB column name
        has_proforma: false, // DB column name
        is_paid: false, // DB column name
        is_invoiced: false, // DB column name
        has_conformity: false, // DB column name
        odl_generated: false, // DB column name
        transport_costs: 0, // DB column name
        restoration_costs: 0 // DB column name
      };
      
      console.log("Inserimento ordine con le colonne corrette del DB:", orderRecord);
      
      // Utilizza i nomi esatti delle colonne del database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderRecord)
        .select()
        .maybeSingle(); // Usa maybeSingle invece di single per evitare errori
        
      if (orderError) {
        console.error("Errore durante la creazione dell'ordine:", orderError);
        throw orderError;
      }

      console.log("Ordine creato con successo:", orderData);

      // Aggiorna le query per ricaricare i dati
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Mostra messaggio di successo
      toast({
        title: "Prenotazione effettuata",
        description: `Il veicolo ${vehicle.model} è stato prenotato con successo.`,
      });

      // Completa il flusso di prenotazione
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
