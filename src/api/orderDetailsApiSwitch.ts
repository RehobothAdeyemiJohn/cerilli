
import { orderDetailsApi as supabaseOrderDetailsApi } from './supabase/orderDetailsApi';

// Log which implementation is being used
console.log('Using Supabase implementation for order details API');

// Always use Supabase implementation for order details
export const orderDetailsApi = supabaseOrderDetailsApi;
