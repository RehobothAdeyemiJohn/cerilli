
import React, { useEffect } from 'react';
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
  // Log for debugging
  useEffect(() => {
    console.log("Current accessories in form:", form.getValues('accessories'));
    console.log("Compatible accessories:", compatibleAccessories);
  }, [compatibleAccessories, form]);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="accessories"
        render={() => (
          <FormItem>
            <FormLabel className="font-semibold text-base mb-2">Accessori Disponibili</FormLabel>
            <div className="space-y-2">
              {compatibleAccessories.length > 0 ? (
                compatibleAccessories.map((accessory) => (
                  <div key={accessory.id} className="flex items-center space-x-3">
                    <Checkbox
                      checked={form.getValues('accessories').includes(accessory.name)}
                      onCheckedChange={(checked) => {
                        const current = form.getValues('accessories') || [];
                        const updated = checked
                          ? [...current, accessory.name]
                          : current.filter((name: string) => name !== accessory.name);
                        form.setValue('accessories', updated, { shouldValidate: true, shouldDirty: true });
                        console.log("Updated accessories:", updated);
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
                ))
              ) : (
                <div className="text-gray-500 italic">
                  Nessun accessorio compatibile disponibile per questo modello e allestimento
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleAccessories;
