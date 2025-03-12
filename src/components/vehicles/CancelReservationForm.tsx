
import React from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';

// Create the form schema - only dealers need to provide a reason
const createCancelReservationSchema = (isDealer: boolean) => {
  if (isDealer) {
    return z.object({
      cancellationReason: z.string().min(3, {
        message: "La motivazione deve essere di almeno 3 caratteri",
      }),
    });
  }
  
  return z.object({
    cancellationReason: z.string().optional(),
  });
};

interface CancelReservationFormProps {
  vehicle: Vehicle;
  onSubmit: (data?: { cancellationReason: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CancelReservationForm = ({ 
  vehicle, 
  onSubmit, 
  onCancel,
  isSubmitting 
}: CancelReservationFormProps) => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  // Create schema based on user type
  const cancelReservationSchema = createCancelReservationSchema(isDealer);
  
  // Form default values
  const defaultValues = {
    cancellationReason: '',
  };
  
  const form = useForm<z.infer<typeof cancelReservationSchema>>({
    resolver: zodResolver(cancelReservationSchema),
    defaultValues,
  });
  
  const handleSubmit = (data: z.infer<typeof cancelReservationSchema>) => {
    onSubmit(data);
  };
  
  // For admin users, allow direct cancellation without reason
  const handleDirectCancel = () => {
    if (isAdmin) {
      onSubmit();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold">Annulla Prenotazione</h3>
        <p className="text-sm text-gray-500">
          Stai annullando la prenotazione per {vehicle.model} {vehicle.trim || ''}
          {vehicle.reservedBy ? ` prenotato da ${vehicle.reservedBy}` : ''}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {isDealer && (
            <FormField
              control={form.control}
              name="cancellationReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivazione Cancellazione*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci la motivazione per la cancellazione della prenotazione"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {isAdmin && (
            <>
              <FormField
                control={form.control}
                name="cancellationReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivazione Cancellazione (opzionale)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Inserisci la motivazione per la cancellazione della prenotazione (opzionale)"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <p className="text-sm text-gray-500">
                In qualità di amministratore, puoi annullare la prenotazione senza fornire una motivazione.
              </p>
            </>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            
            {isAdmin && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDirectCancel}
                disabled={isSubmitting}
              >
                Cancella Prenotazione
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Elaborazione...' : 'Conferma'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CancelReservationForm;
