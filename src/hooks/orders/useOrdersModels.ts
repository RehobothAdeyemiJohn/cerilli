
import { useMemo } from 'react';
import { Order } from '@/types';
import { formatPlafond } from '@/utils/dealerUtils';

export const useOrdersModels = (ordersData: Order[]) => {
  return useMemo(() => {
    // Log tutti gli ordini per debug
    console.log('Tutti gli ordini in useOrdersModels:', ordersData);
    
    const models = new Set<string>();
    ordersData.forEach(order => {
      if (order.modelName) {
        models.add(order.modelName);
      } else if (order.vehicle?.model) {
        models.add(order.vehicle.model);
      }
    });
    
    const modelArray = Array.from(models);
    console.log('Modelli estratti dagli ordini:', modelArray);
    
    return modelArray;
  }, [ordersData]);
};
