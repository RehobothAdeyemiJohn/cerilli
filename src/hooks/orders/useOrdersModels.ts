
import { useMemo } from 'react';
import { Order } from '@/types';
import { formatPlafond } from '@/utils/dealerUtils';

export const useOrdersModels = (ordersData: Order[]) => {
  return useMemo(() => {
    const models = new Set<string>();
    ordersData.forEach(order => {
      if (order.modelName) {
        models.add(order.modelName);
      } else if (order.vehicle?.model) {
        models.add(order.vehicle.model);
      }
    });
    return Array.from(models);
  }, [ordersData]);
};
