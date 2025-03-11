
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
            <FormLabel>Accessori Disponibili</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compatibleAccessories.map((accessory) => (
                <div key={accessory.id} className="flex items-start space-x-3 space-y-0">
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
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {accessory.name}
                      <span className="ml-1 text-sm text-gray-500">
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
