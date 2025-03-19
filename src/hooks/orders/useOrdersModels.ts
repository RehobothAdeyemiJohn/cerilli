
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

// Versione semplificata che usa solo il campo base creditLimit
export const formatPlafond = (dealer: any) => {
  if (!dealer) return '0 €';
  
  // Log dealer object per debug
  console.log('formatPlafond chiamato con dealer:', dealer);
  
  // Controlla se il creditLimit esiste e ritorna il valore formattato
  if (dealer.creditLimit !== undefined && dealer.creditLimit !== null) {
    return `${dealer.creditLimit.toLocaleString()} €`;
  }
  
  // Se non troviamo il creditLimit, ritorniamo zero
  return '0 €';
};
