
import { Dealer, Order } from '@/types';

/**
 * Calculates the available credit for a dealer based on their credit limit and the order amount
 * @param dealer The dealer to calculate available credit for
 * @param currentOrder The current order (to exclude from calculations if updating)
 * @returns The available credit amount or null if credit limit is not defined
 */
export const calculateAvailableCredit = (dealer: Dealer, currentOrder?: Order): number | null => {
  if (dealer.creditLimit === undefined || dealer.creditLimit === null) {
    return null;
  }
  
  // For now, we're just returning the credit limit
  // In a full implementation, this would subtract all existing orders for this dealer
  // and potentially exclude the current order if it's being updated
  
  return dealer.creditLimit;
};

/**
 * Determines if an order can be placed based on the dealer's available credit
 * @param dealer The dealer placing the order
 * @param orderAmount The amount of the order
 * @returns True if the order can be placed, false otherwise
 */
export const canPlaceOrder = (dealer: Dealer, orderAmount: number): boolean => {
  const availableCredit = calculateAvailableCredit(dealer);
  
  if (availableCredit === null) {
    // If credit limit is not defined, allow the order
    return true;
  }
  
  return availableCredit >= orderAmount;
};
