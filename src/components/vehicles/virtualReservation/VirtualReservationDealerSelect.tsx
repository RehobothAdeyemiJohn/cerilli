
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dealer } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { VirtualReservationFormValues } from './useVirtualReservation';

interface VirtualReservationDealerSelectProps {
  form: UseFormReturn<VirtualReservationFormValues>;
  dealers: Dealer[];
  isAdmin: boolean;
}

const VirtualReservationDealerSelect = ({ 
  form, 
  dealers, 
  isAdmin 
}: VirtualReservationDealerSelectProps) => {
  if (!isAdmin) return null;
  
  return (
    <FormField
      control={form.control}
      name="dealerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Concessionario</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un concessionario" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {dealers.map(dealer => (
                <SelectItem key={dealer.id} value={dealer.id}>
                  {dealer.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VirtualReservationDealerSelect;
