
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
  // Debug log
  useEffect(() => {
    // console.log("VehicleAccessories rendered with:", {
    //   formAccessories: form.getValues('accessories'),
    //   compatibleAccessories
    // });
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
                compatibleAccessories.map((accessory) => {
                  // Get current accessories array
                  const currentAccessories = Array.isArray(form.getValues('accessories')) 
                    ? form.getValues('accessories') 
                    : [];
                  
                  // Check if this accessory is selected
                  const isChecked = currentAccessories.includes(accessory.name);
                  
                  // console.log(`Rendering accessory ${accessory.name}, selected: ${isChecked}`);
                  
                  return (
                    <div key={accessory.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          // Get current accessories (ensuring it's an array)
                          const current = Array.isArray(form.getValues('accessories')) 
                            ? form.getValues('accessories') 
                            : [];
                            
                          // Update the array based on checkbox state
                          const updated = checked
                            ? [...current, accessory.name]
                            : current.filter((name: string) => name !== accessory.name);
                          
                          // Set the updated array in the form
                          form.setValue('accessories', updated, { shouldValidate: true, shouldDirty: true });
                          // console.log("Updated accessories:", updated);
                        }}
                      />
                      <div className="flex items-center">
                        <FormLabel className="font-normal cursor-pointer">
                          {accessory.name} 
                          <span className="text-sm text-gray-600 ml-1">
                            (+€{accessory.price ? accessory.price : '0'})
                          </span>
                        </FormLabel>
                      </div>
                    </div>
                  );
                })
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
