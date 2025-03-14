
import React from 'react';
import { Vehicle } from '@/types';
import { Accessory } from '@/types';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormContext } from 'react-hook-form';

interface QuoteVehicleInfoProps {
  vehicle: Vehicle;
  compatibleAccessories?: Accessory[];
}

const QuoteVehicleInfo = ({ vehicle, compatibleAccessories = [] }: QuoteVehicleInfoProps) => {
  const form = useFormContext();

  // Filter accessories that are already included in the vehicle
  const availableAccessories = compatibleAccessories.filter(
    accessory => !vehicle.accessories?.includes(accessory.name)
  );

  return (
    <div className="bg-[#e1e1e2] p-4 rounded-md">
      <h3 className="text-md font-semibold mb-2">Informazioni Veicolo</h3>
      <div className="grid grid-cols-1 gap-3">
        {/* Model and Trim in the same row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Modello</p>
            <p className="font-medium">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Allestimento</p>
            <p className="font-medium">{vehicle.trim}</p>
          </div>
        </div>
        
        {/* Engine and Color in the same row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Motore</p>
            <p className="font-medium">{vehicle.fuelType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Colore</p>
            <p className="font-medium">{vehicle.exteriorColor}</p>
          </div>
        </div>
        
        {/* Telaio */}
        <div>
          <p className="text-xs text-gray-500">Telaio</p>
          <p className="font-medium">{vehicle.telaio || 'N/A'}</p>
        </div>
        
        {/* Optional Disponibili section */}
        {availableAccessories.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <h3 className="font-medium text-sm mb-2">Optional Disponibili</h3>
            <div className="grid grid-cols-1 gap-2">
              {availableAccessories.map((accessory) => (
                <FormField
                  key={accessory.id}
                  control={form.control}
                  name="selectedAccessories"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <Checkbox
                        checked={field.value?.includes(accessory.name)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const updated = checked
                            ? [...current, accessory.name]
                            : current.filter((name) => name !== accessory.name);
                          field.onChange(updated);
                        }}
                      />
                      <div className="space-y-0.5 leading-none">
                        <FormLabel className="text-xs">
                          {accessory.name}
                          <span className="ml-1 text-xs text-gray-500">
                            (+€{accessory.priceWithVAT?.toLocaleString('it-IT')})
                          </span>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteVehicleInfo;
