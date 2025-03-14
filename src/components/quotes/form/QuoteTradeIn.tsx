
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

interface QuoteTradeInProps {
  showTradeIn: boolean;
  setShowTradeIn: (show: boolean) => void;
}

const QuoteTradeIn: React.FC<QuoteTradeInProps> = ({ showTradeIn, setShowTradeIn }) => {
  const form = useFormContext();
  const hasTradeIn = form.watch('hasTradeIn');

  // Always show trade-in form when hasTradeIn is true
  React.useEffect(() => {
    if (hasTradeIn) {
      setShowTradeIn(true);
    } else {
      setShowTradeIn(false);
    }
  }, [hasTradeIn, setShowTradeIn]);

  if (!hasTradeIn) {
    return null;
  }

  return (
    <div className="border border-blue-200 rounded-md p-3 mb-3 bg-blue-50">
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
    </div>
  );
};

export default QuoteTradeIn;
