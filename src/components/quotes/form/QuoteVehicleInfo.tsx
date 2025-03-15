
import { useState } from 'react';
import { Vehicle } from '@/types';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFormContext } from 'react-hook-form';
import QuoteAccessories from './QuoteAccessories';

interface QuoteVehicleInfoProps {
  vehicle: Vehicle;
  compatibleAccessories: string[];
}

const QuoteVehicleInfo = ({ vehicle, compatibleAccessories }: QuoteVehicleInfoProps) => {
  const [showAllAccessories, setShowAllAccessories] = useState(false);
  const { control, setValue, watch } = useFormContext();
  
  // Safely format price with fallback
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '0';
    return price.toLocaleString('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  return (
    <Card className="bg-gray-50">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <h3 className="text-md font-semibold">Informazioni Veicolo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Model */}
            <FormField
              control={control}
              name="model"
              defaultValue={vehicle.model}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modello</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-gray-100" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Trim */}
            <FormField
              control={control}
              name="trim"
              defaultValue={vehicle.trim}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allestimento</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-gray-100" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Exterior Color */}
            <FormField
              control={control}
              name="exteriorColor"
              defaultValue={vehicle.exteriorColor}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colore Esterno</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-gray-100" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Fuel Type */}
            <FormField
              control={control}
              name="fuelType"
              defaultValue={vehicle.fuelType}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alimentazione</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-gray-100" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Transmission */}
            <FormField
              control={control}
              name="transmission"
              defaultValue={vehicle.transmission}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trasmissione</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-gray-100" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={control}
              name="location"
              defaultValue={vehicle.location}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicazione</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-gray-100" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Telaio */}
            <FormField
              control={control}
              name="telaio"
              defaultValue={vehicle.telaio}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telaio</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly className="bg-gray-100" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Price */}
            <FormField
              control={control}
              name="price"
              defaultValue={vehicle.price}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prezzo Base</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      value={formatPrice(vehicle.price)} 
                      readOnly 
                      className="bg-gray-100 font-semibold" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          {/* Separator */}
          <Separator className="my-4" />
          
          {/* Accessories Section */}
          {vehicle?.accessories && (
            <QuoteAccessories 
              accessories={vehicle.accessories} 
              compatibleAccessories={compatibleAccessories}
              showAllAccessories={showAllAccessories}
              setShowAllAccessories={setShowAllAccessories}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteVehicleInfo;
