
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
  
  // Use the correct field from Supabase (nuovo_plafond)
  const plafondValue = dealer.nuovo_plafond !== undefined 
    ? dealer.nuovo_plafond 
    : (dealer.nuovoPlafond !== undefined ? dealer.nuovoPlafond : dealer.creditLimit);
  
  if (plafondValue !== undefined && plafondValue !== null) {
    return `${plafondValue.toLocaleString()} €`;
  }
  
  return dealer.creditLimit ? `${dealer.creditLimit.toLocaleString()} €` : '0 €';
};
