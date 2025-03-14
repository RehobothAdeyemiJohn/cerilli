
import React from 'react';
import { Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormContext } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';

interface QuoteVehicleInfoProps {
  vehicle: Vehicle;
  compatibleAccessories?: any[];
}

const QuoteVehicleInfo: React.FC<QuoteVehicleInfoProps> = ({ 
  vehicle, 
  compatibleAccessories = []
}) => {
  const form = useFormContext();
  const selectedAccessories = form.watch('selectedAccessories') || [];

  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h3 className="text-md font-semibold mb-4">Informazioni Veicolo</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Modello</div>
          <div className="font-medium">{vehicle.model}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Allestimento</div>
          <div className="font-medium">{vehicle.trim}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Motore</div>
          <div className="font-medium">{vehicle.fuelType}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500">Colore</div>
          <div className="font-medium">{vehicle.exteriorColor}</div>
        </div>
        
        {vehicle.telaio && (
          <div>
            <div className="text-sm text-gray-500">Telaio</div>
            <div className="font-medium">{vehicle.telaio}</div>
          </div>
        )}
      </div>
      
      {/* Optional Accessories */}
      {compatibleAccessories && compatibleAccessories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Optional Disponibili</h4>
          <div className="space-y-2">
            {compatibleAccessories.map((accessory) => (
              <FormField
                key={accessory.id}
                control={form.control}
                name="selectedAccessories"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={accessory.id}
                      className="flex flex-row items-center space-x-2 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(accessory.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, accessory.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== accessory.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <div className="flex-1 flex justify-between items-center">
                        <FormLabel className="text-sm cursor-pointer">
                          {accessory.name}
                        </FormLabel>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(accessory.price)}
                        </span>
                      </div>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteVehicleInfo;
