
import { useMemo } from 'react';
import { Vehicle, VehicleModel, VehicleTrim, FuelType, ExteriorColor, Transmission } from '@/types';

export const useCompatibleItems = (
  vehicle: Vehicle,
  modelObj: VehicleModel | null,
  trims: VehicleTrim[],
  fuelTypes: FuelType[],
  colors: ExteriorColor[],
  transmissions: Transmission[]
) => {
  // Compute compatible items safely with useMemo
  return useMemo(() => {
    if (!modelObj || !trims || !fuelTypes || !colors || !transmissions) {
      return {
        compatibleTrims: [],
        compatibleFuelTypes: [],
        compatibleColors: [],
        compatibleTransmissions: []
      };
    }

    return {
      compatibleTrims: trims.filter(trim => 
        !trim.compatibleModels || 
        trim.compatibleModels.length === 0 || 
        trim.compatibleModels.includes(modelObj.id)
      ),
      compatibleFuelTypes: fuelTypes.filter(fuel => 
        !fuel.compatibleModels || 
        fuel.compatibleModels.length === 0 || 
        fuel.compatibleModels.includes(modelObj.id)
      ),
      compatibleColors: colors.filter(color => 
        !color.compatibleModels || 
        color.compatibleModels.length === 0 || 
        color.compatibleModels.includes(modelObj.id)
      ),
      compatibleTransmissions: transmissions.filter(trans => 
        !trans.compatibleModels || 
        trans.compatibleModels.length === 0 || 
        trans.compatibleModels.includes(modelObj.id)
      )
    };
  }, [modelObj, trims, fuelTypes, colors, transmissions]);
};
