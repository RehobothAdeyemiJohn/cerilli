
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dealer } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { VirtualReservationFormValues } from './useVirtualReservation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

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
  const { user } = useAuth();
  
  // If user is a dealer, automatically set the dealerId
  useEffect(() => {
    if (!isAdmin && user?.dealerId) {
      // Type assertion to handle the extended FormValues with optional dealerId
      form.setValue('dealerId' as any, user.dealerId);
    }
  }, [isAdmin, user, form]);
  
  // If not admin, don't show the selector
  if (!isAdmin) return null;
  
  return (
    <FormField
      control={form.control}
      name={'dealerId' as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Concessionario</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value as string}
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
