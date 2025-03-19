
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
  
  // Log dealer object to debug
  console.log('formatPlafond called with dealer:', dealer);
  
  // Primo controllo - accesso diretto al nuovo_plafond (snake_case dal database)
  if (dealer.nuovo_plafond !== undefined && dealer.nuovo_plafond !== null) {
    console.log('Usando nuovo_plafond (snake_case):', dealer.nuovo_plafond);
    return `${dealer.nuovo_plafond.toLocaleString()} €`;
  }
  
  // Secondo controllo - accesso al nuovoPlafond (camelCase)
  if (dealer.nuovoPlafond !== undefined && dealer.nuovoPlafond !== null) {
    console.log('Usando nuovoPlafond (camelCase):', dealer.nuovoPlafond);
    return `${dealer.nuovoPlafond.toLocaleString()} €`;
  }
  
  // Fallback al vecchio creditLimit
  if (dealer.creditLimit !== undefined && dealer.creditLimit !== null) {
    console.log('Usando creditLimit come fallback:', dealer.creditLimit);
    return `${dealer.creditLimit.toLocaleString()} €`;
  }
  
  console.log('Nessun valore di plafond trovato, ritorno 0 €');
  return '0 €';
};
