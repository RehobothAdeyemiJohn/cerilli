
import { useState, useEffect } from 'react';
import { VehicleModel, VehicleTrim, FuelType, ExteriorColor, Transmission, Accessory } from '@/types';
import { calculateVehiclePrice } from '@/api/localStorage';

export const useCalculatePrice = (
  modelObj: VehicleModel | null,
  watchTrim: string,
  watchFuelType: string,
  watchColor: string,
  watchTransmission: string,
  watchAccessories: string[],
  trims: VehicleTrim[],
  fuelTypes: FuelType[],
  colors: ExteriorColor[],
  transmissions: Transmission[],
  accessories: Accessory[]
) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // Update price calculation
  useEffect(() => {
    const updatePrice = async () => {
      if (!modelObj || !watchTrim || !watchFuelType || !watchColor || !watchTransmission) {
        setCalculatedPrice(0);
        return;
      }

      const trimObj = trims.find(t => t.name === watchTrim);
      const fuelTypeObj = fuelTypes.find(f => f.name === watchFuelType);
      
      const colorParts = watchColor.match(/^(.+) \((.+)\)$/);
      const colorName = colorParts ? colorParts[1] : watchColor;
      const colorType = colorParts ? colorParts[2] : '';
      const colorObj = colors.find(c => c.name === colorName && c.type === colorType);
      
      const transmissionObj = transmissions.find(t => t.name === watchTransmission);

      if (trimObj && fuelTypeObj && colorObj && transmissionObj) {
        try {
          const selectedAccessoryIds = watchAccessories
            .map(name => {
              const acc = accessories.find(a => a.name === name);
              return acc ? acc.id : '';
            })
            .filter(id => id !== '');

          const price = await calculateVehiclePrice(
            modelObj.id,
            trimObj.id,
            fuelTypeObj.id,
            colorObj.id,
            transmissionObj.id,
            selectedAccessoryIds
          );
          
          setCalculatedPrice(price);
        } catch (error) {
          console.error('Error calculating price:', error);
          setCalculatedPrice(0);
        }
      } else {
        setCalculatedPrice(0);
      }
    };

    updatePrice();
  }, [
    modelObj, 
    watchTrim, 
    watchFuelType, 
    watchColor, 
    watchTransmission, 
    watchAccessories, 
    trims, 
    fuelTypes, 
    colors, 
    transmissions, 
    accessories
  ]);

  return calculatedPrice;
};
