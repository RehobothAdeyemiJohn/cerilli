
import React from 'react';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormContext } from 'react-hook-form';

interface QuoteAccessoriesProps {
  accessories: string[];
  compatibleAccessories: string[];
  showAllAccessories: boolean;
  setShowAllAccessories: React.Dispatch<React.SetStateAction<boolean>>;
}

const QuoteAccessories: React.FC<QuoteAccessoriesProps> = ({ 
  accessories, 
  compatibleAccessories, 
  showAllAccessories, 
  setShowAllAccessories 
}) => {
  const form = useFormContext();

  // Filter out accessories that are already included in the vehicle's stock configuration
  const availableAccessories = compatibleAccessories.filter(
    accessory => !accessories.includes(accessory)
  );

  if (availableAccessories.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-2">
      <h3 className="font-medium text-sm mb-2">Optional Disponibili</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableAccessories.map((accessory, index) => (
          <FormField
            key={index}
            control={form.control}
            name="selectedAccessories"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <Checkbox
                  checked={field.value?.includes(accessory)}
                  onCheckedChange={(checked) => {
                    const current = field.value || [];
                    const updated = checked
                      ? [...current, accessory]
                      : current.filter((name) => name !== accessory);
                    field.onChange(updated);
                  }}
                />
                <div className="space-y-0.5 leading-none">
                  <FormLabel className="text-xs">
                    {accessory}
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
