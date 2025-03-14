
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

interface QuoteCustomerInfoProps {
  isAdmin: boolean;
  dealers: any[];
  userId?: string;
  dealerId?: string;
}

const QuoteCustomerInfo: React.FC<QuoteCustomerInfoProps> = ({ 
  isAdmin, 
  dealers,
  userId,
  dealerId
}) => {
  const form = useFormContext();

  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h3 className="text-md font-semibold mb-4">Informazioni Cliente</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Cliente *</FormLabel>
                <FormControl>
                  <Input placeholder="Inserisci nome cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="cliente@esempio.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono *</FormLabel>
                <FormControl>
                  <Input placeholder="+39 123 456 7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Dealer Selection */}
        <div className="mt-2">
          <FormField
            control={form.control}
            name="dealerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dealer</FormLabel>
                {isAdmin ? (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona Dealer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dealers.map((dealer) => (
                        <SelectItem key={dealer.id} value={dealer.id}>
                          {dealer.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="border rounded-md p-2 bg-background">
                    {dealers.find(d => d.id === dealerId)?.companyName || 'Dealer assegnato'}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default QuoteCustomerInfo;
