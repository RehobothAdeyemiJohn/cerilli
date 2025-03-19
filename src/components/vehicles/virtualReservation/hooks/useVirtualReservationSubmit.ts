
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Define a simple schema for the form
const formSchema = z.object({
  trim: z.string().optional(),
  dealerId: z.string().optional(),
  accessories: z.array(z.string()).optional(),
  fuelType: z.string().optional(),
  exteriorColor: z.string().optional(),
  transmission: z.string().optional(),
  reservationDestination: z.enum(['Conto Esposizione', 'Stock', 'Contratto Abbinato']).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export const useVirtualReservationSubmit = (onSuccess: () => void, vehicleId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting virtual reservation:', values, 'for vehicle ID:', vehicleId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Prenotazione inviata',
        description: 'La prenotazione virtuale è stata inviata con successo',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting virtual reservation:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'invio della prenotazione',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
};

export default useVirtualReservationSubmit;
