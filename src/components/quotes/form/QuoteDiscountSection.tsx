
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';

const QuoteDiscountSection: React.FC = () => {
  const form = useFormContext();
  
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-md">
      <h3 className="text-md font-semibold">Sconti e IVA</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Discount Amount */}
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sconto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Inserisci sconto"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* License Plate Bonus */}
        <FormField
          control={form.control}
          name="licensePlateBonus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bonus Immatricolazione</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      {/* VAT Settings */}
      <div className="flex items-center space-x-2 mt-2">
        <FormField
          control={form.control}
          name="reducedVAT"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">IVA agevolata 4%</FormLabel>
            </FormItem>
          )}
        />
      </div>
      
      {/* Trade-In Toggle */}
      <div className="flex items-center space-x-2 mt-2">
        <FormField
          control={form.control}
          name="hasTradeIn"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">Permuta</FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default QuoteDiscountSection;
