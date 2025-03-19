
import { useMemo } from 'react';
import { Order } from '@/types';

export const useOrdersModels = (ordersData: Order[]) => {
  return useMemo(() => {
    const models = new Set<string>();
    ordersData.forEach(order => {
      if (order.vehicle?.model) {
        models.add(order.vehicle.model);
      }
    });
    return Array.from(models);
  }, [ordersData]);
};

export const formatPlafond = (dealer: any) => {
  if (!dealer) return '0 €';
  // Utilizziamo il nuovo plafond invece del credit_limit
  return dealer.nuovoPlafond ? `${dealer.nuovoPlafond.toLocaleString()} €` : '0 €';
};
