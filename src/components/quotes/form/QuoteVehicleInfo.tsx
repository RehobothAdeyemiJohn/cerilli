
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';
import { Vehicle } from '@/types';

interface QuoteVehicleInfoProps {
  vehicle: Vehicle;
  compatibleAccessories: any[];
}

const QuoteVehicleInfo = ({ vehicle, compatibleAccessories }: QuoteVehicleInfoProps) => {
  const form = useFormContext();
  const watchAccessories = form.watch('accessories') || [];

  // Calculate accessory total
  const accessoryTotal = () => {
    return (watchAccessories || []).reduce((sum, name) => {
      const accessory = compatibleAccessories.find(a => a.name === name);
      return sum + (accessory ? accessory.price : 0);
    }, 0);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h3 className="text-md font-semibold mb-4">Informazioni Veicolo</h3>
      
      <div className="space-y-2">
        {/* Vehicle Basic Info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-gray-500">Modello</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Allestimento</p>
            <p className="font-medium">{vehicle.trim}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-gray-500">Motore</p>
            <p className="font-medium">{vehicle.fuelType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Colore</p>
            <p className="font-medium">{vehicle.exteriorColor}</p>
          </div>
        </div>
        
        {vehicle.transmission && (
          <div>
            <p className="text-sm text-gray-500">Cambio</p>
            <p className="font-medium">{vehicle.transmission}</p>
          </div>
        )}
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">Prezzo di Listino</p>
          <p className="font-medium">{formatCurrency(vehicle.price)}</p>
        </div>
      </div>
      
      {/* Accessories Section */}
      {compatibleAccessories && compatibleAccessories.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="mb-2">
            <FormLabel>Optional Disponibili</FormLabel>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2 bg-white">
            {compatibleAccessories.map((accessory) => (
              <FormField
                key={accessory.id}
                control={form.control}
                name="accessories"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={accessory.id}
                      className="flex flex-row items-start space-x-3 space-y-0 bg-white p-2 rounded"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(accessory.name)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, accessory.name])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== accessory.name
                                  )
                                )
                          }}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center w-full">
                        <FormLabel className="font-normal cursor-pointer">
                          {accessory.name}
                        </FormLabel>
                        <span className="text-sm">€{accessory.price.toLocaleString('it-IT')}</span>
                      </div>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>
          
          {watchAccessories.length > 0 && (
            <div className="mt-2 text-right">
              <span className="text-sm font-medium">Totale Optional: {formatCurrency(accessoryTotal())}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuoteVehicleInfo;
