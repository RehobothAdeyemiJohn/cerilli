
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { VirtualReservationFormValues } from './useVirtualReservation';
import { VehicleTrim, FuelType, ExteriorColor, Transmission } from '@/types';

interface VirtualReservationConfiguratorProps {
  form: UseFormReturn<VirtualReservationFormValues>;
  compatibleTrims: VehicleTrim[];
  compatibleFuelTypes: FuelType[];
  compatibleColors: ExteriorColor[];
  compatibleTransmissions: Transmission[];
}

const VirtualReservationConfigurator = ({
  form,
  compatibleTrims,
  compatibleFuelTypes,
  compatibleColors,
  compatibleTransmissions
}: VirtualReservationConfiguratorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="trim"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Allestimento</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un allestimento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {compatibleTrims.map(trim => (
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
        control={form.control}
        name="fuelType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alimentazione</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un'alimentazione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {compatibleFuelTypes.map(fuelType => (
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
        control={form.control}
        name="exteriorColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Colore Esterno</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un colore" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {compatibleColors.map(color => (
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
      
      <FormField
        control={form.control}
        name="transmission"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cambio</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un cambio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {compatibleTransmissions.map(transmission => (
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
    </div>
  );
};

export default VirtualReservationConfigurator;
