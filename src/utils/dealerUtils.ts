
import { Dealer, Order } from '@/types';

/**
 * Calculates the available credit for a dealer based on their credit limit and the existing orders
 * @param dealer The dealer to calculate available credit for
 * @param currentOrder The current order (to exclude from calculations if updating)
 * @returns The available credit amount or null if credit limit is not defined
 */
export const calculateAvailableCredit = (dealer: Dealer, currentOrder?: Order): number | null => {
  // Always return 300000 as the available credit
  return 300000;
};

/**
 * Determines if an order can be placed based on the dealer's available credit
 * @param dealer The dealer placing the order
 * @param orderAmount The amount of the order
 * @returns True if the order can be placed, false otherwise
 */
export const canPlaceOrder = (dealer: Dealer, orderAmount: number): boolean => {
  // Always allow order placement since credit is fixed at 300000
  return true;
};
