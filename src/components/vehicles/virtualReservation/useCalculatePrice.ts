
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
      if (!modelObj) {
        setCalculatedPrice(0);
        setPriceComponents({});
        return;
      }

      // Find objects for selected options
      const trimObj = trims.find(t => t.name === watchTrim);
      const fuelTypeObj = fuelTypes.find(f => f.name === watchFuelType);
      
      // For color, handle possible format like "ColorName (Type)"
      const colorParts = watchColor ? watchColor.match(/^(.+?)( \(.+\))?$/) : null;
      const colorName = colorParts ? colorParts[1] : watchColor;
      const colorObj = colors.find(c => c.name === colorName || c.name === watchColor);
      
      // For transmission
      const transmissionObj = transmissions.find(t => t.name === watchTransmission);

      // Get accessories price - improved handling
      let accessoriesPrice = 0;
      if (watchAccessories && Array.isArray(watchAccessories) && watchAccessories.length > 0) {
        console.log("Calculating accessories price for:", watchAccessories);
        
        accessoriesPrice = watchAccessories.reduce((sum, accessoryName) => {
          const accessory = accessories.find(a => a.name === accessoryName);
          if (accessory) {
            console.log(`Found accessory ${accessoryName} with price ${accessory.price}`);
            return sum + (accessory.price || 0);
          }
          console.log(`Accessory ${accessoryName} not found in available accessories`);
          return sum;
        }, 0);
        
        console.log("Total accessories price:", accessoriesPrice);
      }

      console.log("Selected items:", {
        model: modelObj?.name,
        trim: watchTrim,
        trimObj,
        fuelType: watchFuelType,
        fuelTypeObj,
        color: watchColor,
        colorObj,
        transmission: watchTransmission,
        transmissionObj,
        accessories: watchAccessories,
        accessoriesPrice
      });

      // Calculate total price if all required objects are found
      if (modelObj && trimObj && fuelTypeObj && colorObj && transmissionObj) {
        const components = {
          basePrice: modelObj.basePrice,
          trimPrice: trimObj.basePrice,
          fuelTypeAdjustment: fuelTypeObj.price_adjustment,
          colorAdjustment: colorObj.price_adjustment,
          transmissionAdjustment: transmissionObj.price_adjustment,
          accessoriesPrice
        };

        const totalPrice = modelObj.basePrice +
                          trimObj.basePrice +
                          fuelTypeObj.price_adjustment +
                          colorObj.price_adjustment +
                          transmissionObj.price_adjustment +
                          accessoriesPrice;

        console.log("Price calculation components:", components);
        console.log("Total calculated price:", totalPrice);

        setPriceComponents(components);
        setCalculatedPrice(totalPrice);
        return;
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
