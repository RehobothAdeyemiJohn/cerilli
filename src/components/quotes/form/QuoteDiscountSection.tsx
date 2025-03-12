
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';

const QuoteDiscountSection: React.FC = () => {
  const form = useFormContext();

  return (
    <div className="grid grid-cols-2 gap-3 border-t pt-2">
      <FormField
        control={form.control}
        name="discount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Sconto (€)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0" 
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="text-sm py-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="reducedVAT"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-xs">IVA agevolata</FormLabel>
              <p className="text-xs text-muted-foreground">
                Applica IVA al 4% (Legge 104)
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default QuoteDiscountSection;
