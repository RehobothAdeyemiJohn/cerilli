
import { Dealer, Order } from '@/types';

/**
 * Calcola il credito disponibile per un dealer basato sul creditLimit
 * @param dealer Il dealer per cui calcolare il credito disponibile
 * @param currentOrder L'ordine corrente (da escludere dai calcoli in caso di aggiornamento)
 * @returns L'importo di credito disponibile o null se il limite di credito non è definito
 */
export const calculateAvailableCredit = (dealer: Dealer, currentOrder?: Order): number | null => {
  // Utilizza direttamente il creditLimit come valore di riferimento
  return dealer.creditLimit !== undefined ? dealer.creditLimit : 300000;
};

/**
 * Determina se un ordine può essere effettuato in base al credito disponibile del dealer
 * @param dealer Il dealer che effettua l'ordine
 * @param orderAmount L'importo dell'ordine
 * @returns True se l'ordine può essere effettuato, false altrimenti
 */
export const canPlaceOrder = (dealer: Dealer, orderAmount: number): boolean => {
  const availableCredit = calculateAvailableCredit(dealer);
  
  // Se non c'è un limite di credito definito, consenti sempre l'ordine
  if (availableCredit === null) return true;
  
  // Altrimenti, controlla se l'importo dell'ordine è minore o uguale al credito disponibile
  return orderAmount <= availableCredit;
};

/**
 * Formatta l'importo del plafond per la visualizzazione
 * @param dealer Il dealer di cui formattare il plafond (o il valore numerico direttamente)
 * @returns Il valore formattato come stringa con simbolo dell'euro
 */
export const formatPlafond = (dealer: Dealer | number | undefined | null): string => {
  if (dealer === undefined || dealer === null) return '0 €';
  
  // Se è un numero, formatta direttamente
  if (typeof dealer === 'number') return `${dealer.toLocaleString()} €`;
  
  // Altrimenti, assumi che sia un oggetto dealer e usa il nuovo_plafond se disponibile
  // altrimenti fallback sul creditLimit
  const plafondValue = dealer.nuovo_plafond !== undefined ? 
    dealer.nuovo_plafond : 
    (dealer.creditLimit || 0);
    
  return `${plafondValue.toLocaleString()} €`;
};
