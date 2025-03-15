
import { Dealer, Order } from '@/types';

/**
 * Calculates the available credit for a dealer based on their credit limit and the existing orders
 * @param dealer The dealer to calculate available credit for
 * @param currentOrder The current order (to exclude from calculations if updating)
 * @returns The available credit amount or null if credit limit is not defined
 */
export const calculateAvailableCredit = (dealer: Dealer, currentOrder?: Order): number | null => {
  if (dealer.creditLimit === undefined || dealer.creditLimit === null) {
    return null;
  }
  
  // If we're looking at the individual order details, we don't subtract this order's value
  const orderAmountToExclude = currentOrder?.vehicle?.price || 0;
  
  // Start with the credit limit
  let availableCredit = dealer.creditLimit;
  
  // If the dealer has orders, we should subtract them from the credit
  if (dealer.orders && Array.isArray(dealer.orders)) {
    // Only consider delivered orders for credit limit calculation
    const deliveredOrders = dealer.orders.filter(order => 
      order.status === 'delivered' && order.id !== currentOrder?.id
    );
    
    console.log('Delivered orders for plafond calculation:', deliveredOrders);
    
    // Subtract the price of each delivered vehicle from the credit limit
    deliveredOrders.forEach(order => {
      if (order.vehicle && order.vehicle.price) {
        availableCredit -= order.vehicle.price;
        console.log(`Subtracting ${order.vehicle.price} from credit limit for order ${order.id}`);
      }
    });
  }
  
  console.log(`Final available credit for dealer ${dealer.companyName}:`, availableCredit);
  return availableCredit;
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
