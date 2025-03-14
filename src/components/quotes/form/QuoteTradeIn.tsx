
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
  const hasTradeIn = form.watch('hasTradeIn');

  return (
    <div className="border-t pt-2">
      <div className="flex items-center space-x-2 mb-3">
        <Checkbox 
          id="hasTradeIn" 
          checked={hasTradeIn} 
          onCheckedChange={(checked) => {
            form.setValue('hasTradeIn', !!checked);
            setShowTradeIn(!!checked);
          }} 
        />
        <label
          htmlFor="hasTradeIn"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Permuta
        </label>
      </div>

      {showTradeIn && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="tradeInBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Marca</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-sm py-1" />
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
                    <Input {...field} className="text-sm py-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="tradeInYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Anno</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="text-sm py-1" />
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
                  <FormLabel className="text-xs">Km</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
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
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="tradeInValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Valore Permuta (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
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
              name="tradeInHandlingFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Gestione Usato (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="text-sm py-1 bg-purple-50" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteTradeIn;
