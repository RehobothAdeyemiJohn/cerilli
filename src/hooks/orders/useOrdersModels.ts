
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
  
  // Log the actual dealer data to inspect values
  console.log('Dealer in formatPlafond:', {
    id: dealer.id, 
    companyName: dealer.companyName,
    nuovoPlafond: dealer.nuovoPlafond,
    creditLimit: dealer.creditLimit
  });
  
  // Utilizziamo il nuovo plafond dalla colonna nuovo_plafond
  if (dealer.nuovoPlafond !== undefined && dealer.nuovoPlafond !== null) {
    console.log(`Using nuovo_plafond for ${dealer.companyName}: ${dealer.nuovoPlafond}`);
    return `${dealer.nuovoPlafond.toLocaleString()} €`;
  }
  
  // Fallback al credit_limit se nuovo_plafond non è disponibile
  console.log(`Falling back to credit_limit for ${dealer.companyName}: ${dealer.creditLimit}`);
  return dealer.creditLimit ? `${dealer.creditLimit.toLocaleString()} €` : '0 €';
};
