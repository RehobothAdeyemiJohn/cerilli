
import { useState, useEffect } from 'react';
import { 
  VehicleModel, 
  VehicleTrim, 
  FuelType, 
  ExteriorColor, 
  Transmission, 
  Accessory 
} from '@/types';

export const useCalculatePrice = (
  modelObj: VehicleModel | undefined,
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
  const [priceComponents, setPriceComponents] = useState<any>({});

  useEffect(() => {
    const calculatePrice = () => {
      if (modelObj && watchTrim && watchFuelType && watchColor && watchTransmission) {
        // Find objects for selected options
        const trimObj = trims.find(t => t.name === watchTrim);
        
        // For fuel type
        const fuelTypeObj = fuelTypes.find(f => f.name === watchFuelType);
        
        // For color, handle possible format like "ColorName (Type)"
        const colorParts = watchColor.match(/^(.+) \((.+)\)$/);
        const colorName = colorParts ? colorParts[1] : watchColor;
        const colorType = colorParts ? colorParts[2] : '';
        const colorObj = colors.find(c => c.name === colorName && c.type === colorType);
        
        // For transmission
        const transmissionObj = transmissions.find(t => t.name === watchTransmission);

        // Get accessories price
        const accessoriesPrice = watchAccessories
          .map(name => {
            const acc = accessories.find(a => a.name === name);
            return acc ? acc.priceWithVAT : 0;
          })
          .reduce((sum, price) => sum + price, 0);

        // Calculate total price if all required objects are found
        if (trimObj && fuelTypeObj && colorObj && transmissionObj) {
          const components = {
            basePrice: modelObj.basePrice,
            trimPrice: trimObj.basePrice,
            fuelTypeAdjustment: fuelTypeObj.priceAdjustment,
            colorAdjustment: colorObj.priceAdjustment,
            transmissionAdjustment: transmissionObj.priceAdjustment,
            accessoriesPrice
          };

          const totalPrice = modelObj.basePrice +
                            trimObj.basePrice +
                            fuelTypeObj.priceAdjustment +
                            colorObj.priceAdjustment +
                            transmissionObj.priceAdjustment +
                            accessoriesPrice;

          setPriceComponents(components);
          setCalculatedPrice(totalPrice);
          return;
        }
      }
      
      // If any required value is missing, reset price
      setPriceComponents({});
      setCalculatedPrice(0);
    };

    calculatePrice();
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

  return { calculatedPrice, priceComponents };
};
