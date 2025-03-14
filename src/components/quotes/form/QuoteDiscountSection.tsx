
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';

const QuoteDiscountSection: React.FC = () => {
  const form = useFormContext();

  return (
    <div>
      {/* Permuta Switch - top of the form */}
      <FormField
        control={form.control}
        name="hasTradeIn"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md mb-4 border p-3">
            <div className="space-y-0.5">
              <FormLabel>Permuta</FormLabel>
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

      {/* IVA agevolata Switch */}
      <FormField
        control={form.control}
        name="reducedVAT"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 mb-4">
            <div className="space-y-0.5 flex-1">
              <FormLabel className="inline-block">IVA agevolata</FormLabel>
              <p className="text-xs text-green-700 inline-block ml-2">
                Applica IVA al 4% (Legge 104 art.3 com.3)
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
      
      {/* Pricing Fields - Single Row Layout */}
      <div className="grid grid-cols-4 gap-3">
        {/* Discount */}
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sconto (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Premio Targa */}
        <FormField
          control={form.control}
          name="licensePlateBonus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Premio Targa (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="bg-blue-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Premio Permuta */}
        <FormField
          control={form.control}
          name="tradeInBonus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Premio Permuta (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="bg-blue-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Kit Sicurezza */}
        <FormField
          control={form.control}
          name="safetyKit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kit Sicurezza (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="bg-yellow-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Display the current VAT rate */}
      <div className="mt-2 text-xs text-right text-gray-500">
        Aliquota IVA: {form.watch('reducedVAT') ? '4%' : '22%'}
      </div>
    </div>
  );
};

export default QuoteDiscountSection;
