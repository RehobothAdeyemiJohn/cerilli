
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { trimsApi, fuelTypesApi } from '@/api/localStorage';

interface VehicleDetailsInfoProps {
  control: Control<any>;
}

const VehicleDetailsInfo = ({ control }: VehicleDetailsInfoProps) => {
  const { data: trims = [] } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });

  const { data: fuelTypes = [] } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="trim"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allestimento</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona l'allestimento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {trims.map((trim) => (
                  <SelectItem key={trim.id} value={trim.name}>
                    {trim.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stato</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona lo stato" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="available">Disponibile</SelectItem>
                <SelectItem value="reserved">Prenotato</SelectItem>
                <SelectItem value="sold">Venduto</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleDetailsInfo;
