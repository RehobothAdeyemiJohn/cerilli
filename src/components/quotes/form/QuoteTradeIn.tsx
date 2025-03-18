
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { Grid } from '@/components/ui/grid';

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
    <div className="border border-blue-200 rounded-md p-4 mb-4 bg-blue-50">
      <div className="space-y-3">
        {/* First row: Brand, Model, Plate in the same row */}
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="tradeInBrand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Modello</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tradeInPlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Targa</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Second row: Year and KM */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="tradeInYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anno</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <FormLabel>Km</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Third row: Trade-in Value and Handling Fee */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="tradeInValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valore Permuta (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormLabel>Gestione Usato (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="bg-purple-50" 
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
