
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Vehicle } from '@/types';
import { vehiclesApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';
import { VirtualReservationFormValues } from '../schema';

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
        dealerId: reservationDealerId,
        dealerName: selectedDealerName,
        trim: values.trim || '',
        fuelType: values.fuelType || '',
        exteriorColor: values.exteriorColor || '',
        transmission: values.transmission || '',
        accessories: values.accessories || [],
        reservationDate: new Date().toISOString(),
        reservationStatus: 'pending',
        destination: values.reservationDestination || 'Conto Esposizione',
        finalPrice: calculatedPrice || 0
      };

      // Create the reservation
      await vehiclesApi.createReservation(reservationData);

      // Update vehicle status to reserved
      await vehiclesApi.update(vehicle.id, {
        status: 'reserved',
        dealerId: reservationDealerId,
        updatedAt: new Date().toISOString()
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
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
