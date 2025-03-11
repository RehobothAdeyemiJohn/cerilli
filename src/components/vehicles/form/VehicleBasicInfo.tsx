
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { modelsApi } from '@/api/localStorage';

interface VehicleBasicInfoProps {
  control: Control<any>;
  locations: string[];
  isVirtualStock: boolean;
}

const VehicleBasicInfo = ({ control, locations, isVirtualStock }: VehicleBasicInfoProps) => {
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posizione</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona la posizione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
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
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modello</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona il modello" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleBasicInfo;
