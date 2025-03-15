
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { vehiclesApi } from '@/api/supabase';

const reserveSchema = z.object({
  destinazione: z.string().min(1, {
    message: "È necessario specificare una destinazione per la prenotazione.",
  })
});

type ReserveFormValues = z.infer<typeof reserveSchema>;

interface ReserveVehicleFormProps {
  vehicle: Vehicle;
  onReservationComplete: () => void;
  onCancel: () => void;
}

const ReserveVehicleForm: React.FC<ReserveVehicleFormProps> = ({
  vehicle,
  onReservationComplete,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const dealerId = user?.dealerId || '';
  const dealerName = user?.dealerName || '';
  
  const form = useForm<ReserveFormValues>({
    resolver: zodResolver(reserveSchema),
    defaultValues: {
      destinazione: '',
    },
  });
  
  const onSubmit = async (data: ReserveFormValues) => {
    if (!dealerId || !dealerName) {
      toast({
        title: "Errore",
        description: "Dati del dealer mancanti. Impossibile procedere con la prenotazione.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log("Form data:", data);
    console.log("Reserving vehicle:", vehicle.id);
    console.log("Dealer ID:", dealerId);
    console.log("Dealer Name:", dealerName);
    
    try {
      // Call the Supabase API directly to reserve the vehicle
      await vehiclesApi.reserve(vehicle.id, dealerId, dealerName, [], undefined, data.destinazione);
      
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
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Prenota Veicolo</h2>
      <p className="mb-4">
        Stai prenotando: <strong>{vehicle.model} {vehicle.trim}</strong>
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <SelectItem value="Sede">Sede</SelectItem>
                    <SelectItem value="Fiera">Fiera</SelectItem>
                    <SelectItem value="Cliente">Cliente</SelectItem>
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
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Prenotazione in corso...' : 'Prenota'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReserveVehicleForm;
