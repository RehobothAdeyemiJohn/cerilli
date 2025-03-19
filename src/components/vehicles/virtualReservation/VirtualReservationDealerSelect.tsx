
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dealer } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

interface VirtualReservationDealerSelectProps {
  form: UseFormReturn<any>;
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
      form.setValue('dealerId', user.dealerId);
    }
  }, [isAdmin, user, form]);
  
  // If not admin, show the dealer name but make it non-editable
  if (!isAdmin) {
    return (
      <div className="mb-4">
        <div className="font-medium text-sm mb-1">Concessionario</div>
        <div className="bg-gray-100 border border-gray-200 p-2 rounded text-gray-800">
          {user?.dealerName || 'Concessionario non identificato'}
        </div>
      </div>
    );
  }
  
  // For admin, show the selector
  return (
    <FormField
      control={form.control}
      name="dealerId"
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
