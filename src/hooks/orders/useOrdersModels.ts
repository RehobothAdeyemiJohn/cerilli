
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
  
  // Utilizziamo il nuovo plafond dalla colonna nuovo_plafond
  if (dealer.nuovoPlafond !== undefined && dealer.nuovoPlafond !== null) {
    return `${dealer.nuovoPlafond.toLocaleString()} €`;
  }
  
  // Fallback al credit_limit se nuovo_plafond non è disponibile
  return dealer.creditLimit ? `${dealer.creditLimit.toLocaleString()} €` : '0 €';
};
