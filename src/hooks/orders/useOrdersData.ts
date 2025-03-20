
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/apiClient';
import { Order } from '@/types';
import { useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useOrdersData = (filters: {
  isLicensable: boolean | null;
  hasProforma: boolean | null;
  isPaid: boolean | null;
  isInvoiced: boolean | null;
  hasConformity: boolean | null;
  dealerId: string | null;
  model: string | null;
}) => {
  const queryClient = useQueryClient();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const location = useLocation();

  // Fetch orders data with frequent updates
  const {
    data: ordersData = [],
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        console.log("Fetching orders data...");
        const orders = await ordersApi.getAll();
        console.log("Orders data fetched successfully:", orders);
        return orders;
      } catch (error) {
        console.error("Error fetching orders in useOrdersData hook:", error);
        toast({
          title: "Errore nel caricamento ordini",
          description: "Si è verificato un errore durante il caricamento degli ordini.",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 0, // Always consider data stale to force refresh
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true
  });

  // Effect to refresh data when dialog closes
  useEffect(() => {
    if (!isDetailsDialogOpen) {
      console.log('OrderDetailsDialog closed, refreshing orders data');
      refetchOrders();
    }
  }, [isDetailsDialogOpen, refetchOrders]);

  // Effect to refresh data when we navigate to the orders page
  useEffect(() => {
    if (location.pathname === '/orders') {
      console.log('Orders page navigated to, refreshing orders data');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      refetchOrders();
    }
  }, [location.pathname, queryClient, refetchOrders]);

  // Function to invalidate and refresh all order-related data
  const refreshAllOrderData = () => {
    console.log("Manual refresh of all order data requested");
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    refetchOrders();
  };

  // Filter orders based on specified criteria
  const filterOrders = (orders: Order[], status?: string) => {
    let filtered = orders;
    
    if (status && status !== 'all') {
      filtered = filtered.filter(o => o.status === status);
    }
    
    // Apply detailed filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null) {
        switch (key) {
          case 'isLicensable':
          case 'hasProforma':
          case 'isPaid':
          case 'isInvoiced':
          case 'hasConformity':
            filtered = filtered.filter(order => 
              order[key as keyof Order] === true
            );
            break;
          case 'dealerId':
            if (value) {
              filtered = filtered.filter(order => order.dealerId === value);
            }
            break;
          case 'model':
            if (value) {
              filtered = filtered.filter(order => 
                order.vehicle && order.vehicle.model === value
              );
            }
            break;
        }
      }
    });
    
    return filtered;
  };

  // Apply filters to create different views
  const processingOrders = filterOrders(ordersData, 'processing');
  const deliveredOrders = filterOrders(ordersData, 'delivered');
  const cancelledOrders = filterOrders(ordersData, 'cancelled');
  const allOrders = filterOrders(ordersData);

  // Format the order number with padding
  const getOrderNumber = (order: Order): string => {
    if (!order || !order.id) return "#000";
    
    // Use the database progressive number if available
    if (order.progressiveNumber) {
      return `#${order.progressiveNumber.toString().padStart(3, '0')}`;
    }
    
    // Fallback to index-based calculation
    const sortedOrders = [...ordersData].sort((a, b) => {
      const dateA = new Date(a.orderDate || 0).getTime();
      const dateB = new Date(b.orderDate || 0).getTime();
      return dateA - dateB;
    });
    
    const index = sortedOrders.findIndex(o => o.id === order.id);
    return `#${(index + 1).toString().padStart(3, '0')}`;
  };

  return {
    ordersData,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrders,
    isLoading: isLoadingOrders,
    error: ordersError,
    refreshAllOrderData,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    refetchOrders,
    getOrderNumber
  };
};
