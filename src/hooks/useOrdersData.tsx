import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/supabase/ordersApi';
import { orderDetailsApi } from '@/api/orderDetailsApiSwitch';
import { Order, OrderDetails } from '@/types';
import { useLocation } from 'react-router-dom';

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

  // Fetch base orders data
  const {
    data: ordersData = [],
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    staleTime: 0,
  });

  // Fetch order details for each order
  const fetchOrderDetails = async (orders: Order[]) => {
    console.log(`Fetching details for ${orders.length} orders`);
    
    const ordersWithDetailsFull = await Promise.all(
      orders.map(async (order) => {
        try {
          const details = await orderDetailsApi.getByOrderId(order.id);
          console.log(`Details for order ${order.id}:`, details);
          
          // Check if the details actually have the ODL generated flag
          if (details && typeof details === 'object' && 'odlGenerated' in details) {
            return {
              ...order,
              details: details
            };
          } else {
            console.log(`Invalid details format for order ${order.id}:`, details);
            return {
              ...order,
              details: null
            };
          }
        } catch (error) {
          console.error(`Error fetching details for order ${order.id}:`, error);
          return {
            ...order,
            details: null
          };
        }
      })
    );
    
    return ordersWithDetailsFull;
  };

  const { 
    data: ordersWithDetails = [], 
    isLoading: isLoadingDetails,
    error: detailsError,
    refetch: refetchOrdersWithDetails 
  } = useQuery({
    queryKey: ['ordersWithDetails'],
    queryFn: () => fetchOrderDetails(ordersData),
    enabled: ordersData.length > 0,
    staleTime: 0,
  });

  // Effect to refresh data when dialog closes
  useEffect(() => {
    if (!isDetailsDialogOpen) {
      console.log('OrderDetailsDialog closed, refreshing orders data');
      refetchOrders();
      if (ordersData.length > 0) {
        refetchOrdersWithDetails();
      }
    }
  }, [isDetailsDialogOpen, refetchOrders, refetchOrdersWithDetails, ordersData.length]);

  // Effect to refresh data when we navigate to the orders page
  useEffect(() => {
    console.log('Orders page navigated to, refreshing orders data');
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['ordersWithDetails'] });
    refetchOrders();
    if (ordersData.length > 0) {
      refetchOrdersWithDetails();
    }
  }, [location.pathname, queryClient, refetchOrders, refetchOrdersWithDetails, ordersData.length]);

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
              order.details && order.details[key as keyof OrderDetails] === true
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
  const processingOrders = filterOrders(ordersWithDetails, 'processing');
  const deliveredOrders = filterOrders(ordersWithDetails, 'delivered');
  const cancelledOrders = filterOrders(ordersWithDetails, 'cancelled');
  const allOrders = filterOrders(ordersWithDetails);

  // Function to invalidate and refresh all order-related data
  const refreshAllOrderData = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
    queryClient.invalidateQueries({ queryKey: ['ordersWithDetails'] });
    refetchOrders();
    refetchOrdersWithDetails();
  };

  return {
    ordersData,
    ordersWithDetails,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrders,
    isLoading: isLoadingOrders || isLoadingDetails,
    error: ordersError || detailsError,
    refreshAllOrderData,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    refetchOrders,
    refetchOrdersWithDetails
  };
};
