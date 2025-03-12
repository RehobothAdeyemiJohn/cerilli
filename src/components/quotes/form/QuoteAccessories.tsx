
import React from 'react';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Accessory } from '@/types';
import { useFormContext } from 'react-hook-form';

interface QuoteAccessoriesProps {
  compatibleAccessories: Accessory[];
}

const QuoteAccessories: React.FC<QuoteAccessoriesProps> = ({ compatibleAccessories }) => {
  const form = useFormContext();

  if (compatibleAccessories.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-2">
      <h3 className="font-medium text-sm mb-2">Optional Disponibili</h3>
      <div className="grid grid-cols-2 gap-2">
        {compatibleAccessories.map((accessory) => (
          <FormField
            key={accessory.id}
            control={form.control}
            name="vehicleAccessories"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <Checkbox
                  checked={field.value?.includes(accessory.name)}
                  onCheckedChange={(checked) => {
                    const current = field.value || [];
                    const updated = checked
                      ? [...current, accessory.name]
                      : current.filter((name) => name !== accessory.name);
                    field.onChange(updated);
                  }}
                />
                <div className="space-y-0.5 leading-none">
                  <FormLabel className="text-xs">
                    {accessory.name}
                    <span className="ml-1 text-xs text-gray-500">
                      (+€{accessory.priceWithVAT.toLocaleString('it-IT')})
                    </span>
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default QuoteAccessories;
