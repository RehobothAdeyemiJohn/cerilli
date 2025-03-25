
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleTrim, FuelType, ExteriorColor, Transmission } from '@/types';
import { VirtualReservationFormValues } from '../useVirtualReservation';

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
    <div className="space-y-4">
      <h4 className="text-base font-medium">Configurazione Veicolo</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Trim selection */}
        <FormField
          control={form.control}
          name="trim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allestimento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona allestimento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {compatibleTrims.map((trim) => (
                    <SelectItem key={trim.id} value={trim.name}>
                      {trim.name} (+€{trim.basePrice.toLocaleString('it-IT')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Fuel type selection */}
        <FormField
          control={form.control}
          name="fuelType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alimentazione</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona alimentazione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {compatibleFuelTypes.map((fuelType) => (
                    <SelectItem key={fuelType.id} value={fuelType.name}>
                      {fuelType.name} (+€{fuelType.price_adjustment.toLocaleString('it-IT')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Color selection */}
        <FormField
          control={form.control}
          name="exteriorColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colore esterno</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona colore" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {compatibleColors.map((color) => (
                    <SelectItem key={color.id} value={color.name}>
                      {color.name} (+€{color.price_adjustment.toLocaleString('it-IT')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Transmission selection */}
        <FormField
          control={form.control}
          name="transmission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cambio</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona cambio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {compatibleTransmissions.map((transmission) => (
                    <SelectItem key={transmission.id} value={transmission.name}>
                      {transmission.name} (+€{transmission.price_adjustment.toLocaleString('it-IT')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default VirtualReservationConfigurator;
