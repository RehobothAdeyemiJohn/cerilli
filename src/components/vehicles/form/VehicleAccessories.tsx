
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';
import { Accessory } from '@/types';

interface VehicleAccessoriesProps {
  control: Control<any>;
  compatibleAccessories: Accessory[];
  form: any;
}

const VehicleAccessories = ({ control, compatibleAccessories, form }: VehicleAccessoriesProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="accessories"
        render={() => (
          <FormItem>
            <FormLabel className="font-semibold text-base mb-2">Accessori Disponibili</FormLabel>
            <div className="space-y-2">
              {compatibleAccessories.map((accessory) => (
                <div key={accessory.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={form.getValues('accessories').includes(accessory.name)}
                    onCheckedChange={(checked) => {
                      const current = form.getValues('accessories');
                      const updated = checked
                        ? [...current, accessory.name]
                        : current.filter((name: string) => name !== accessory.name);
                      form.setValue('accessories', updated);
                    }}
                  />
                  <div className="flex items-center">
                    <FormLabel className="font-normal cursor-pointer">
                      {accessory.name} 
                      <span className="text-sm text-gray-600 ml-1">
                        (+€{accessory.priceWithVAT.toLocaleString('it-IT')})
                      </span>
                    </FormLabel>
                  </div>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleAccessories;
