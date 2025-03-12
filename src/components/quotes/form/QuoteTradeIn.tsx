
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormContext } from 'react-hook-form';

interface QuoteTradeInProps {
  showTradeIn: boolean;
  setShowTradeIn: (show: boolean) => void;
}

const QuoteTradeIn: React.FC<QuoteTradeInProps> = ({ showTradeIn, setShowTradeIn }) => {
  const form = useFormContext();

  return (
    <div className="border-t pt-2">
      <FormField
        control={form.control}
        name="hasTradeIn"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-2 space-y-0 mb-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  setShowTradeIn(!!checked);
                }}
              />
            </FormControl>
            <div className="space-y-0.5 leading-none">
              <FormLabel className="text-xs">
                Permuta
              </FormLabel>
            </div>
          </FormItem>
        )}
      />

      {showTradeIn && (
        <div className="grid grid-cols-5 gap-2 pl-5 mb-2">
          <FormField
            control={form.control}
            name="tradeInBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Fiat" {...field} className="text-sm py-1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tradeInModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Modello</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Panda" {...field} className="text-sm py-1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tradeInYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Anno</FormLabel>
                <FormControl>
                  <Input placeholder="Es. 2018" {...field} className="text-sm py-1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tradeInKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Chilometri</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Es. 50000" 
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
            name="tradeInValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Valore permuta (€)</FormLabel>
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
        </div>
      )}
    </div>
  );
};

export default QuoteTradeIn;
