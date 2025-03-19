import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Quote, Vehicle } from '@/types';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { quotesApi } from '@/api/supabase';
import { vehiclesApi } from '@/api/supabase';
import { dealersApi } from '@/api/supabase';

export const useComprehensiveQuotesData = () => {
  const queryClient = useQueryClient();
  
  // State for UI
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterDealer, setFilterDealer] = useState<string>('');
  const [filterModel, setFilterModel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isManualQuote, setIsManualQuote] = useState<boolean>(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState<boolean>(false);

  // Queries for data
  const { data: quotes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll()
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll()
  });

  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll()
  });

  // Define mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ quoteId, status }: { quoteId: string; status: string }) => {
      return quotesApi.updateStatus(quoteId, status as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Stato preventivo aggiornato",
        description: "Lo stato del preventivo è stato aggiornato con successo"
      });
    },
    onError: (error) => {
      console.error('Error updating quote status:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato",
        variant: "destructive"
      });
    }
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: (quoteId: string) => {
      return quotesApi.delete(quoteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Preventivo eliminato",
        description: "Il preventivo è stato eliminato con successo"
      });
    },
    onError: (error) => {
      console.error('Error deleting quote:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del preventivo",
        variant: "destructive"
      });
    }
  });

  const createContractMutation = useMutation({
    mutationFn: (quote: Quote) => {
      // This is a placeholder - implement the actual contract creation
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Contratto creato",
        description: "Il contratto è stato creato con successo"
      });
    },
    onError: (error) => {
      console.error('Error creating contract:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del contratto",
        variant: "destructive"
      });
    }
  });

  // Helper functions
  const getVehicleById = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getDealerName = (dealerId: string) => {
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer ? dealer.companyName : 'Dealer non trovato';
  };

  const getShortId = (id: string) => {
    return id.substring(0, 8) + '...';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return 'Data non valida';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Compute derived values
  const filteredQuotes = useMemo(() => {
    let result = [...quotes];
    
    // Filter by tab (status)
    if (activeTab !== 'all') {
      result = result.filter(quote => quote.status === activeTab);
    }
    
    // Filter by dealer
    if (filterDealer) {
      result = result.filter(quote => quote.dealerId === filterDealer);
    }
    
    // Filter by model
    if (filterModel) {
      result = result.filter(quote => {
        const vehicle = getVehicleById(quote.vehicleId);
        return vehicle && vehicle.model === filterModel;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(quote => 
        quote.customerName.toLowerCase().includes(query) || 
        quote.id.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [quotes, activeTab, filterDealer, filterModel, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  
  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuotes, currentPage, itemsPerPage]);

  // Calculate status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = {
      all: quotes.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      converted: 0
    };
    
    quotes.forEach(quote => {
      counts[quote.status as keyof typeof counts] += 1;
    });
    
    return counts;
  }, [quotes]);

  // Get unique models from vehicles
  const models = useMemo(() => {
    const uniqueModels = new Set(vehicles.map(v => v.model));
    return Array.from(uniqueModels);
  }, [vehicles]);

  // Event handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };

  const handleUpdateStatus = (quoteId: string, status: string) => {
    updateStatusMutation.mutate({ quoteId, status });
    setViewDialogOpen(false);
  };

  const handleDeleteQuote = () => {
    if (selectedQuote) {
      deleteQuoteMutation.mutate(selectedQuote.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleRejectQuote = (reason: string) => {
    if (selectedQuote) {
      handleUpdateStatus(selectedQuote.id, 'rejected');
      // In a real app, you'd also save the rejection reason
      setRejectDialogOpen(false);
    }
  };

  const handleConvertToContract = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsContractDialogOpen(true);
    setViewDialogOpen(false);
  };

  const handleCloseContractDialog = () => {
    setIsContractDialogOpen(false);
    setSelectedQuote(null);
  };

  const handleCreateContract = () => {
    if (selectedQuote) {
      createContractMutation.mutate(selectedQuote);
      handleUpdateStatus(selectedQuote.id, 'converted');
      setIsContractDialogOpen(false);
    }
  };

  const handleOpenCreateQuoteDialog = (vehicleId: string = '', isManual: boolean = false) => {
    setSelectedVehicleId(vehicleId);
    setIsManualQuote(isManual);
    setCreateDialogOpen(true);
  };

  const handleCreateQuote = (quoteData: any) => {
    // In a real app, you'd call an API to create the quote
    setCreateDialogOpen(false);
    toast({
      title: "Preventivo creato",
      description: "Il preventivo è stato creato con successo"
    });
    refetch();
  };

  const handleUpdateQuote = (quoteData: any) => {
    // In a real app, you'd call an API to update the quote
    toast({
      title: "Preventivo aggiornato",
      description: "Il preventivo è stato aggiornato con successo"
    });
    refetch();
  };

  // Return everything needed by the component
  return {
    quotes,
    isLoading,
    error,
    refetch,
    
    // UI state
    activeTab,
    setActiveTab,
    filterDealer,
    setFilterDealer,
    filterModel,
    setFilterModel,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedVehicleId,
    setSelectedVehicleId,
    createDialogOpen,
    setCreateDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    
    // Derived data
    selectedVehicle: getVehicleById(selectedVehicleId),
    isManualQuote,
    setIsManualQuote,
    
    // Computed values
    filteredQuotes,
    vehicles,
    dealers,
    models,
    statusCounts,
    totalPages,
    paginatedQuotes,
    
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
    
    // Other
    selectedQuote,
    isDeleteDialogOpen: deleteDialogOpen,
    isContractDialogOpen,
    setIsContractDialogOpen,
    isContractSubmitting: createContractMutation.isPending,
    handleCloseContractDialog,
    handleCreateContract
  };
};
