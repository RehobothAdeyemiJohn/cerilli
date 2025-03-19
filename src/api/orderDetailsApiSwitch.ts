
import { orderDetailsApi as supabaseOrderDetailsApi } from './supabase/orderDetailsApi';

// Always use Supabase implementation for order details
export const orderDetailsApi = supabaseOrderDetailsApi;
