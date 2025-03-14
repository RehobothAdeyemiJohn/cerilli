
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
    <div className="space-y-4 bg-[#e1e1e2] p-4 rounded-md">
      <h3 className="text-md font-semibold mb-2">Informazioni Cliente</h3>
      
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Nome Cliente *</FormLabel>
              <FormControl>
                <Input placeholder="Inserisci nome cliente" {...field} className="text-sm py-1" />
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
              <FormLabel className="text-xs">Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="cliente@esempio.com" {...field} className="text-sm py-1" />
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
              <FormLabel className="text-xs">Telefono *</FormLabel>
              <FormControl>
                <Input placeholder="+39 123 456 7890" {...field} className="text-sm py-1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Dealer Selection for Admin Users */}
      {isAdmin && (
        <FormField
          control={form.control}
          name="dealerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Dealer</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="text-sm py-1">
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
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Non-admin users with a dealerId - show readonly field */}
      {!isAdmin && dealerId && dealers && (
        <div>
          <FormLabel className="text-xs">Dealer</FormLabel>
          <div className="border rounded-md p-2 bg-gray-50 text-sm">
            {dealers.find(d => d.id === dealerId)?.companyName || 'Dealer assegnato'}
          </div>
          <input type="hidden" {...form.register('dealerId')} value={dealerId} />
        </div>
      )}
    </div>
  );
};

export default QuoteCustomerInfo;
