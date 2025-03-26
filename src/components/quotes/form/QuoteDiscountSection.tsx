
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

const QuoteDiscountSection: React.FC = () => {
  const form = useFormContext();
  
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">Sconti (€)</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Discount Amount */}
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
              <FormLabel>Premio Targa (€)</FormLabel>
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
      
      <div className="grid grid-cols-2 gap-4">
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
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
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
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default QuoteDiscountSection;
