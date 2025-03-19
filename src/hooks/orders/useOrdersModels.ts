
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
  
  // Detailed logging to troubleshoot the plafond issue
  console.log('DEALER OBJECT STRUCTURE:', dealer);
  console.log('Dealer in formatPlafond:', {
    id: dealer.id, 
    companyName: dealer.companyName,
    nuovoPlafond: dealer.nuovoPlafond,
    creditLimit: dealer.creditLimit
  });
  
  // Check if nuovo_plafond is a direct property or nested
  if (dealer.nuovoPlafond !== undefined && dealer.nuovoPlafond !== null) {
    console.log(`Using nuovo_plafond for ${dealer.companyName}: ${dealer.nuovoPlafond}`);
    return `${dealer.nuovoPlafond.toLocaleString()} €`;
  }
  
  // Check if the value might be in a nested property or differently named
  if (dealer.nuovo_plafond !== undefined && dealer.nuovo_plafond !== null) {
    console.log(`Using nuovo_plafond (alternative) for ${dealer.companyName}: ${dealer.nuovo_plafond}`);
    return `${dealer.nuovo_plafond.toLocaleString()} €`;
  }
  
  // Fallback to credit_limit if nuovo_plafond is not available
  console.log(`Falling back to credit_limit for ${dealer.companyName}: ${dealer.creditLimit}`);
  return dealer.creditLimit ? `${dealer.creditLimit.toLocaleString()} €` : '0 €';
};
