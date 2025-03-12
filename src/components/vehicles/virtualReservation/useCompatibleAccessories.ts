
import { useState, useEffect } from 'react';
import { Vehicle, Accessory, VehicleModel } from '@/types';
import { accessoriesApi } from '@/api/localStorage';

export const useCompatibleAccessories = (
  vehicle: Vehicle,
  watchTrim: string,
  modelObj: VehicleModel | null,
  trims: any[]
) => {
  const [compatibleAccessories, setCompatibleAccessories] = useState<Accessory[]>([]);

  // Update accessories when trim changes
  useEffect(() => {
    const updateCompatibleAccessories = async () => {
      if (!vehicle?.model || !watchTrim || !modelObj) {
        setCompatibleAccessories([]);
        return;
      }

      const trimObj = trims.find(t => t.name === watchTrim);
      
      if (trimObj) {
        try {
          const compatibles = await accessoriesApi.getCompatible(modelObj.id, trimObj.id);
          setCompatibleAccessories(compatibles || []);
        } catch (error) {
          console.error('Error fetching compatible accessories:', error);
          setCompatibleAccessories([]);
        }
      } else {
        setCompatibleAccessories([]);
      }
    };

    updateCompatibleAccessories();
  }, [vehicle?.model, watchTrim, modelObj, trims]);

  return compatibleAccessories;
};
