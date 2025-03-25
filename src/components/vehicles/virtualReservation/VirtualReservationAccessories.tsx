
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { Accessory } from '@/types';
import { VirtualReservationFormValues } from './schema';

interface VirtualReservationAccessoriesProps {
  form: UseFormReturn<any>;
  compatibleAccessories: Accessory[];
}

const VirtualReservationAccessories = ({ 
  form, 
  compatibleAccessories 
}: VirtualReservationAccessoriesProps) => {
  if (!compatibleAccessories.length || !form.watch('trim')) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2">
      <FormLabel>Optional Disponibili</FormLabel>
      <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
        {compatibleAccessories.map((accessory) => (
          <FormField
            key={accessory.id}
            control={form.control}
            name="accessories"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(accessory.name)}
                    onCheckedChange={(checked) => {
                      const currentValue = [...(field.value || [])];
                      if (checked) {
                        field.onChange([...currentValue, accessory.name]);
                      } else {
                        field.onChange(currentValue.filter(value => value !== accessory.name));
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal text-sm">
                  {accessory.name}
                  <span className="ml-1 text-xs text-gray-500">
                    (+€{accessory.price.toLocaleString('it-IT')})
                  </span>
                </FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default VirtualReservationAccessories;
