import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api/apiClient';
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

  // Fetch base orders data with frequent updates
  const {
    data: ordersData = [],
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    staleTime: 0, // Always consider data stale to force refresh
    refetchInterval: 300, // Refetch every 0.3 seconds
    refetchOnWindowFocus: true,
    retry: 5, // Retry 5 times before failing
  });

  useEffect(() => {
    console.log("Orders data changed:", ordersData);
  }, [ordersData]);

  // Create a default OrderDetails object
  const createDefaultOrderDetails = (orderId: string): OrderDetails => {
    console.log(`Creating default OrderDetails for order ${orderId} due to missing or malformed data`);
    return {
      id: '',
      orderId: orderId,
      isLicensable: false,
      hasProforma: false,
      isPaid: false,
      isInvoiced: false,
      hasConformity: false,
      transportCosts: 0,
      restorationCosts: 0,
      odlGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // Fetch order details directly from the orderDetailsApi
  const fetchOrderDetails = async () => {
    console.log("Fetching all order details directly from orderDetailsApi");
    try {
      const allOrderDetails = await orderDetailsApi.getAll();
      console.log("All order details retrieved:", allOrderDetails);
      return allOrderDetails;
    } catch (error) {
      console.error("Error fetching all order details:", error);
      return [];
    }
  };

  // First query: Get all order details directly
  const { 
    data: allOrderDetails = [],
    isLoading: isLoadingAllDetails,
    error: allDetailsError,
    refetch: refetchAllOrderDetails
  } = useQuery({
    queryKey: ['allOrderDetails'],
    queryFn: fetchOrderDetails,
    staleTime: 0,
    refetchInterval: 300, // Refetch every 0.3 seconds
  });

  // Function to combine orders with their details
  const combineOrdersWithDetails = (orders: Order[], details: OrderDetails[]) => {
    console.log(`Combining ${orders.length} orders with ${details.length} details`);
    
    return orders.map(order => {
      // Find matching details for this order
      const orderDetail = details.find(detail => detail.orderId === order.id);
      
      if (orderDetail) {
        console.log(`Found details for order ${order.id}:`, orderDetail);
        return {
          ...order,
          details: orderDetail
        };
      } else {
        console.log(`No details found for order ${order.id}, creating default`);
        return {
          ...order,
          details: null
        };
      }
    });
  };

  // Combine orders with details
  const ordersWithDetails = combineOrdersWithDetails(ordersData, allOrderDetails);

  // Effect to refresh data when dialog closes
  useEffect(() => {
    if (!isDetailsDialogOpen) {
      console.log('OrderDetailsDialog closed, refreshing orders data');
      refetchOrders();
      refetchAllOrderDetails();
    }
  }, [isDetailsDialogOpen, refetchOrders, refetchAllOrderDetails]);

  // Effect to refresh data when we navigate to the orders page
  useEffect(() => {
    if (location.pathname === '/orders') {
      console.log('Orders page navigated to, refreshing orders data');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['allOrderDetails'] });
      
      // Force immediate refetch
      refetchOrders();
      refetchAllOrderDetails();
    }
  }, [location.pathname, queryClient, refetchOrders, refetchAllOrderDetails]);

  // Add an additional effect to periodically refresh data on the orders page with higher frequency
  useEffect(() => {
    if (location.pathname === '/orders') {
      const intervalId = setInterval(() => {
        console.log('Periodic refresh of orders and details data');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['allOrderDetails'] });
        refetchOrders();
        refetchAllOrderDetails();
      }, 250); // Refresh every 0.25 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [location.pathname, queryClient, refetchOrders, refetchAllOrderDetails]);

  // Function to invalidate and refresh all order-related data
  const refreshAllOrderData = () => {
    console.log("Manual refresh of all order data requested");
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
    queryClient.invalidateQueries({ queryKey: ['allOrderDetails'] });
    queryClient.invalidateQueries({ queryKey: ['ordersWithDetails'] });
    queryClient.invalidateQueries({ queryKey: ['dealers'] });
    refetchOrders();
    refetchAllOrderDetails();
  };

  // Filter orders based on specified criteria
  const filterOrders = (orders: typeof ordersWithDetails, status?: string) => {
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

  // Format the order number with padding using the progressive_number from database
  const getOrderNumber = (order: Order): string => {
    if (!order || !order.id) return "#000";
    
    // Use the database progressive number if available, otherwise fallback
    if (order.progressiveNumber) {
      return `#${order.progressiveNumber.toString().padStart(3, '0')}`;
    }
    
    // Fallback to index-based calculation for backward compatibility
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
    ordersWithDetails,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    allOrders,
    isLoading: isLoadingOrders || isLoadingAllDetails,
    error: ordersError || allDetailsError,
    refreshAllOrderData,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    refetchOrders,
    refetchAllOrderDetails,
    getOrderNumber
  };
};
