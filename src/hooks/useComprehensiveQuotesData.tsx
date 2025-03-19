
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Quote, Vehicle, Dealer } from '@/types';
import { quotesApi, vehiclesApi, dealersApi, dealerContractsApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useComprehensiveQuotesData = () => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const queryClient = useQueryClient();
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State for filters
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterDealer, setFilterDealer] = useState<string>('');
  const [filterModel, setFilterModel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for dialog controls
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  
  // State for vehicle selection in manual quote
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isManualQuote, setIsManualQuote] = useState(false);
  
  // Fetch quotes
  const { data: quotes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['quotes'],
    queryFn: quotesApi.getAll
  });
  
  // Fetch vehicles and dealers for reference
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll
  });
  
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll
  });
  
  // Fetch quote status counts
  const { data: statusCounts = { pending: 0, approved: 0, rejected: 0, converted: 0 } } = useQuery({
    queryKey: ['quoteStatusCounts'],
    queryFn: quotesApi.getCountByStatus
  });
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ quoteId, status }: { quoteId: string; status: string }) => {
      return quotesApi.update(quoteId, { status: status as Quote['status'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStatusCounts'] });
      toast({
        title: 'Quote Updated',
        description: 'Quote status has been updated successfully.'
      });
      setViewDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating quote status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quote status.',
        variant: 'destructive'
      });
    }
  });
  
  // Reject quote mutation (with reason)
  const rejectQuoteMutation = useMutation({
    mutationFn: ({ quoteId, reason }: { quoteId: string; reason: string }) => {
      return quotesApi.update(quoteId, { 
        status: 'rejected', 
        rejectionReason: reason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStatusCounts'] });
      toast({
        title: 'Quote Rejected',
        description: 'Quote has been rejected successfully.'
      });
      setRejectDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error rejecting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject quote.',
        variant: 'destructive'
      });
    }
  });
  
  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: (quoteId: string) => {
      return quotesApi.delete(quoteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStatusCounts'] });
      toast({
        title: 'Quote Deleted',
        description: 'Quote has been deleted successfully.'
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quote.',
        variant: 'destructive'
      });
    }
  });
  
  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: (quoteData: Omit<Quote, 'id'>) => {
      return quotesApi.create(quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStatusCounts'] });
      toast({
        title: 'Quote Created',
        description: 'Quote has been created successfully.'
      });
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quote.',
        variant: 'destructive'
      });
    }
  });
  
  // Convert quote to contract mutation
  const convertToContractMutation = useMutation({
    mutationFn: async (quote: Quote) => {
      // First update the quote status to converted
      await quotesApi.update(quote.id, { status: 'converted' });
      
      // Then create a contract from this quote
      // For this, we need to create a minimal order object
      const order = {
        id: quote.id, // Reuse the quote ID for simplicity
        vehicleId: quote.vehicleId,
        dealerId: quote.dealerId,
        customerName: quote.customerName,
        status: 'processing' as const,
        orderDate: new Date().toISOString(),
        price: quote.finalPrice,
        isLicensable: false,
        hasProforma: false,
        isPaid: false,
        isInvoiced: false,
        hasConformity: false,
        transportCosts: 0,
        restorationCosts: 0,
        odlGenerated: false
      };
      
      return dealerContractsApi.createFromOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['quoteStatusCounts'] });
      toast({
        title: 'Quote Converted',
        description: 'Quote has been converted to a contract successfully.'
      });
      setContractDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error converting quote to contract:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert quote to contract.',
        variant: 'destructive'
      });
    }
  });

  // Filter quotes based on selected filters
  const filteredQuotes = quotes.filter(quote => {
    // Filter by tab (status)
    if (activeTab !== 'all' && quote.status !== activeTab) return false;
    
    // Filter by dealer
    if (filterDealer && quote.dealerId !== filterDealer) return false;
    
    // Filter by model
    if (filterModel && (!quote.vehicleInfo?.model || quote.vehicleInfo.model !== filterModel)) return false;
    
    // Filter by search text
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesCustomer = quote.customerName.toLowerCase().includes(searchLower);
      const matchesVehicle = quote.vehicleInfo?.model?.toLowerCase().includes(searchLower) || false;
      const matchesId = quote.id.toLowerCase().includes(searchLower);
      
      if (!matchesCustomer && !matchesVehicle && !matchesId) return false;
    }
    
    return true;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);
  
  // Extract unique models for filtering
  const models = [...new Set(quotes.map(q => q.vehicleInfo?.model).filter(Boolean))];
  
  // Helper functions
  const getVehicleById = (id: string): Vehicle | undefined => {
    return vehicles.find(v => v.id === id);
  };
  
  const getDealerName = (id: string): string => {
    const dealer = dealers.find(d => d.id === id);
    return dealer?.companyName || 'Unknown Dealer';
  };
  
  const getShortId = (id: string): string => {
    return id.substring(0, 8);
  };
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'converted': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Event handlers
  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewDialogOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      setSelectedQuote(quote);
      setDeleteDialogOpen(true);
    }
  };
  
  const handleUpdateStatus = (quoteId: string, status: string) => {
    updateStatusMutation.mutate({ quoteId, status });
  };
  
  const handleCreateQuote = (quoteData: any) => {
    createQuoteMutation.mutate(quoteData);
  };
  
  const handleRejectQuote = (reason: string) => {
    if (selectedQuote) {
      rejectQuoteMutation.mutate({ quoteId: selectedQuote.id, reason });
    }
  };
  
  const handleDeleteQuote = () => {
    if (selectedQuote) {
      deleteQuoteMutation.mutate(selectedQuote.id);
    }
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const handleOpenCreateQuoteDialog = () => {
    setIsManualQuote(true);
    setCreateDialogOpen(true);
  };
  
  const handleConvertToContract = (quote: Quote) => {
    setSelectedQuote(quote);
    setContractDialogOpen(true);
  };
  
  const handleUpdateQuote = async (quoteId: string, updates: Partial<Quote>) => {
    try {
      await quotesApi.update(quoteId, updates);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: 'Quote Updated',
        description: 'Quote details have been updated successfully.'
      });
      return true;
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quote details.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return {
    quotes,
    isLoading,
    error: error as Error,
    refetch,
    
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedQuotes,
    
    // Filters
    activeTab,
    setActiveTab,
    filterDealer,
    setFilterDealer,
    filterModel,
    setFilterModel,
    searchQuery,
    setSearchQuery,
    
    // Reference data
    dealers,
    vehicles,
    models,
    statusCounts,
    
    // Selected and state
    selectedQuote,
    setSelectedQuote,
    selectedVehicleId,
    setSelectedVehicleId,
    isManualQuote,
    setIsManualQuote,
    
    // Dialog controls
    viewDialogOpen,
    setViewDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    createDialogOpen,
    setCreateDialogOpen,
    contractDialogOpen,
    setContractDialogOpen,
    
    // Helper functions
    getVehicleById,
    getDealerName,
    getShortId,
    formatDate,
    getStatusBadgeClass,
    
    // Event handlers
    handleViewQuote,
    handleDeleteClick,
    handleUpdateStatus,
    handleCreateQuote,
    handleRejectQuote,
    handleDeleteQuote,
    handlePrevPage,
    handleNextPage,
    handleOpenCreateQuoteDialog,
    handleConvertToContract,
    handleUpdateQuote,
    
    // Mutation states
    isUpdateStatusPending: updateStatusMutation.isPending,
    isRejectPending: rejectQuoteMutation.isPending,
    isDeletePending: deleteQuoteMutation.isPending,
    isCreatePending: createQuoteMutation.isPending,
    isContractSubmitting: convertToContractMutation.isPending,
    
    // User info
    isAdmin
  };
};
