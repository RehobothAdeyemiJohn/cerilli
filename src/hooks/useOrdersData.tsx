
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
    staleTime: 0, // Always consider data stale to force refresh
    refetchInterval: 500, // Refetch every 0.5 seconds for real-time updates
    refetchOnWindowFocus: true,
  });

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

  // Fetch order details for each order
  const fetchOrderDetails = async (orders: Order[]) => {
    console.log(`Fetching details for ${orders.length} orders`);
    
    const ordersWithDetailsFull = await Promise.all(
      orders.map(async (order) => {
        try {
          const details = await orderDetailsApi.getByOrderId(order.id);
          console.log(`Details for order ${order.id}:`, details);
          
          // Check for valid details structure or create default if malformed
          if (details) {
            // Create a normalized details object
            let normalizedDetails: OrderDetails | null = null;
            
            if (typeof details === 'object') {
              // Check if it's the malformed structure with _type and value properties
              const detailsAny = details as any;
              if (detailsAny._type === "undefined" && detailsAny.value === "undefined") {
                console.log(`Found malformed details for order ${order.id} with _type and value both "undefined"`);
                normalizedDetails = createDefaultOrderDetails(order.id);
              } 
              // Case 1: details is already a valid OrderDetails object
              else if ('odlGenerated' in details) {
                normalizedDetails = details as OrderDetails;
              }
              // Case 2: details has a nested value property
              else if (detailsAny.value && 
                      typeof detailsAny.value === 'object' && 
                      'odlGenerated' in detailsAny.value) {
                normalizedDetails = detailsAny.value as OrderDetails;
              }
              // Any other unhandled format
              else {
                console.log(`Unrecognized details format for order ${order.id}:`, details);
                normalizedDetails = createDefaultOrderDetails(order.id);
              }
            }
            
            return {
              ...order,
              details: normalizedDetails
            };
          } else {
            console.log(`Missing details for order ${order.id}`);
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
    refetchInterval: 500, // Refetch every 0.5 seconds for real-time updates
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
    if (location.pathname === '/orders') {
      console.log('Orders page navigated to, refreshing orders data');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersWithDetails'] });
      
      // Force immediate refetch
      refetchOrders();
      if (ordersData.length > 0) {
        refetchOrdersWithDetails();
      }
    }
  }, [location.pathname, queryClient, refetchOrders, refetchOrdersWithDetails, ordersData.length]);

  // Add an additional effect to periodically refresh data on the orders page
  useEffect(() => {
    if (location.pathname === '/orders') {
      const intervalId = setInterval(() => {
        console.log('Periodic refresh of orders data');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        refetchOrders();
      }, 2000);
      
      return () => clearInterval(intervalId);
    }
  }, [location.pathname, queryClient, refetchOrders]);

  // Function to invalidate and refresh all order-related data
  const refreshAllOrderData = () => {
    console.log("Manual refresh of all order data requested");
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
    queryClient.invalidateQueries({ queryKey: ['ordersWithDetails'] });
    queryClient.invalidateQueries({ queryKey: ['dealers'] });
    refetchOrders();
    refetchOrdersWithDetails();
  };

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
    refetchOrdersWithDetails,
    getOrderNumber
  };
};
