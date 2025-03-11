
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { colorsApi, transmissionsApi, fuelTypesApi } from '@/api/localStorage';

interface VehicleSpecificationsProps {
  control: Control<any>;
}

const VehicleSpecifications = ({ control }: VehicleSpecificationsProps) => {
  const { data: colors = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll
  });

  const { data: transmissions = [] } = useQuery({
    queryKey: ['transmissions'],
    queryFn: transmissionsApi.getAll
  });

  const { data: fuelTypes = [] } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="fuelType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alimentazione</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tipo di alimentazione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fuelTypes.map((fuelType) => (
                    <SelectItem key={fuelType.id} value={fuelType.name}>
                      {fuelType.name}
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
          name="exteriorColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colore Esterno</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il colore" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={`${color.name} (${color.type})`}>
                      {color.name} ({color.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="transmission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cambio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tipo di cambio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {transmissions.map((transmission) => (
                    <SelectItem key={transmission.id} value={transmission.name}>
                      {transmission.name}
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
          name="telaio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero Telaio</FormLabel>
              <FormControl>
                <Input placeholder="es. WBA12345678901234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default VehicleSpecifications;
