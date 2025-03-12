
import { orderDetailsApi as supabaseOrderDetailsApi } from './supabase/orderDetailsApi';

// Only use Supabase for order details
export const orderDetailsApi = supabaseOrderDetailsApi;
