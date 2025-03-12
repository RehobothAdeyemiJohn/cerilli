
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { VirtualReservationFormValues } from './useVirtualReservation';

interface VirtualReservationDestinationProps {
  form: UseFormReturn<VirtualReservationFormValues>;
}

const VirtualReservationDestination = ({ form }: VirtualReservationDestinationProps) => {
  return (
    <FormField
      control={form.control}
      name="reservationDestination"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Destinazione</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una destinazione" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Contratto Abbinato">Contratto Abbinato</SelectItem>
              <SelectItem value="Stock Dealer">Stock Dealer</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VirtualReservationDestination;
