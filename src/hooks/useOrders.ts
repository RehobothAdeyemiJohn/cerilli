
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase';
import { dealersApi } from '@/api/supabase';
import { Order, Dealer } from '@/types';
import { useToast } from './use-toast';

export const useOrders = (filters = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  
  // Setup the query for orders
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      try {
        const orders = await ordersApi.getAll();
        console.log("Retrieved orders:", orders);
        // Apply filters (simplified implementation)
        return orders;
      } catch (err) {
        console.error("Error fetching orders in useOrders hook:", err);
        throw err;
      }
    }
  });
  
  // Update the ordersList state when data changes
  useEffect(() => {
    if (data) {
      console.log("Setting orders list with data:", data);
      setOrdersList(data);
    }
  }, [data]);
  
  // Custom function to get dealers
  const getDealers = async () => {
    return await dealersApi.getAll();
  };
  
  // Mock function for generating PDF preview
  const generatePdfPreview = async (order: Order) => {
    // In a real implementation, this would call a backend API
    console.log('Generating PDF preview for order:', order);
    
    // Mock PDF data (this would normally come from the backend)
    const textEncoder = new TextEncoder();
    return textEncoder.encode('Mock PDF data');
  };
  
  // Mock function for generating order delivery form
  const generateOrderDeliveryForm = async (orderId: string) => {
    // In a real implementation, this would call a backend API
    console.log('Generating order delivery form for order:', orderId);
    
    // Mock PDF data (this would normally come from the backend)
    const textEncoder = new TextEncoder();
    return textEncoder.encode('Mock Order Delivery Form PDF data');
  };
  
  // Return the enhanced API and query results
  return {
    ordersList,
    isLoading,
    error,
    refetchOrders: refetch,
    getDealers,
    generatePdfPreview,
    generateOrderDeliveryForm,
    ...ordersApi
  };
};
