
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle, Dealer } from '@/types';
import { vehiclesApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';
import { VirtualReservationFormValues, createVirtualReservationSchema } from '../schema';

export const useVirtualReservationSubmit = (
  vehicle: Vehicle,
  isAdmin: boolean,
  userDealerId: string | undefined,
  userDealerName: string | undefined,
  onComplete: () => void,
  calculatedPrice: number,
  dealers: Dealer[]
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (values: VirtualReservationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get the selected dealer
      const selectedDealerId = isAdmin ? values.dealerId : userDealerId;
      
      if (!selectedDealerId) {
        toast({
          title: "Errore",
          description: "Seleziona un concessionario per procedere",
          variant: "destructive"
        });
        return;
      }
      
      const selectedDealer = dealers.find(d => d.id === selectedDealerId);
      
      if (!selectedDealer) {
        toast({
          title: "Errore",
          description: "Concessionario non trovato",
          variant: "destructive"
        });
        return;
      }
      
      // Check if the dealer has enough credit
      const reservationDestination = values.reservationDestination;
      
      if (reservationDestination === 'Conto Esposizione' && (selectedDealer.creditLimit || 0) < calculatedPrice) {
        toast({
          title: "Errore",
          description: "Credito insufficiente per effettuare la prenotazione in conto esposizione",
          variant: "destructive"
        });
        return;
      }
      
      // Prepare the virtual configuration to save
      const virtualConfig = {
        trim: values.trim || '',
        fuelType: values.fuelType || '',
        exteriorColor: values.exteriorColor || '',
        transmission: values.transmission || '',
        accessories: values.accessories || [],
        price: calculatedPrice
      };
      
      // Update the vehicle with the virtual reservation
      const updates: Partial<Vehicle> = {
        status: 'reserved',
        reservedBy: selectedDealer.id,
        reservedAccessories: values.accessories,
        reservationDestination: values.reservationDestination,
        reservationTimestamp: new Date().toISOString(),
        virtualConfig
      };
      
      await vehiclesApi.update(vehicle.id, updates);
      
      toast({
        title: "Prenotazione effettuata",
        description: `Veicolo prenotato con successo da ${selectedDealer.companyName}`,
      });
      
      // Call the completion callback
      onComplete();
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante la prenotazione: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
