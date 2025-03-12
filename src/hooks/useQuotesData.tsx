
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { Quote } from '@/types';
import { quotesApi } from '@/api/supabase/quotesApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { modelsApi } from '@/api/localStorage';
import { toast } from '@/hooks/use-toast';

export function useQuotesData() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [filterDealer, setFilterDealer] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  
  const queryClient = useQueryClient();
  
  // Query for status counts
  const { data: statusCounts = { all: 0, pending: 0, approved: 0, rejected: 0, converted: 0 } } = useQuery({
    queryKey: ['quotes-counts'],
    queryFn: () => quotesApi.getCountByStatus(),
    staleTime: 30000, // 30 seconds
  });
  
  // Query for quotes with pagination
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes', activeTab, currentPage, itemsPerPage],
    queryFn: () => quotesApi.getAll({ 
      limit: itemsPerPage, 
      page: currentPage 
    }),
    staleTime: 10000, // 10 seconds
  });
  
  // Query for vehicles (basic information)
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles-basic'],
    queryFn: () => vehiclesApi.getAll({
      select: 'id,model,trim',
    }),
    staleTime: 60000, // 1 minute
  });

  // Query for dealers
  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
    staleTime: 60000, // 1 minute
  });

  // Query for models
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: () => modelsApi.getAll(),
    staleTime: 60000, // 1 minute
  });
  
  // Create quote mutation
  const createMutation = useMutation({
    mutationFn: (quoteData: Omit<Quote, 'id'>) => quotesApi.create(quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setCreateDialogOpen(false);
      setActiveTab('pending');
      toast({
        title: 'Preventivo Creato',
        description: 'Il preventivo è stato creato con successo',
      });
    },
  });
  
  // Update quote mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Quote> }) => 
      quotesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setViewDialogOpen(false);
      setRejectDialogOpen(false);
      toast({
        title: 'Preventivo Aggiornato',
        description: 'Lo stato del preventivo è stato aggiornato con successo',
      });
    },
  });

  // Delete quote mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setDeleteDialogOpen(false);
      toast({
        title: 'Preventivo Eliminato',
        description: 'Il preventivo è stato eliminato con successo',
      });
    },
  });
  
  // Filter quotes based on active tab, dealer, model, and search query
  const filteredQuotes = quotes.filter(quote => {
    let matchesStatus = activeTab === 'all' || quote.status === activeTab;
    let matchesDealer = filterDealer === 'all' || quote.dealerId === filterDealer;
    
    let matchesModel = true;
    if (filterModel !== 'all') {
      const vehicle = vehicles.find(v => v.id === quote.vehicleId);
      matchesModel = vehicle?.model === filterModel;
    }
    
    let matchesSearch = true;
    if (searchQuery) {
      const vehicle = vehicles.find(v => v.id === quote.vehicleId);
      const lowerSearch = searchQuery.toLowerCase();
      matchesSearch = 
        quote.customerName.toLowerCase().includes(lowerSearch) ||
        quote.customerEmail.toLowerCase().includes(lowerSearch) ||
        (vehicle && vehicle.model.toLowerCase().includes(lowerSearch));
    }
    
    return matchesStatus && matchesDealer && matchesModel && matchesSearch;
  });
  
  // Helper to get vehicle by ID
  const getVehicleById = (id: string) => {
    return vehicles.find(v => v.id === id);
  };

  // Helper to get formatted dealer name
  const getDealerName = (dealerId: string) => {
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer ? dealer.companyName : 'N/D';
  };
  
  // Format an ID to be shorter for display (first 6 characters)
  const getShortId = (id: string) => {
    return id.substring(0, 6).toUpperCase();
  };
  
  // Format date to locale format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get CSS class for status badge
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle view quote action
  const handleViewQuote = (quote: Quote) => {
    const vehicle = getVehicleById(quote.vehicleId);
    if (vehicle) {
      setSelectedQuote(quote);
      setSelectedVehicle(vehicle);
      setViewDialogOpen(true);
    } else {
      toast({
        title: "Errore",
        description: "Impossibile trovare il veicolo associato al preventivo",
        variant: "destructive",
      });
    }
  };

  // Handle delete quote action
  const handleDeleteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };
  
  // Handle quote status update
  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    if (status === 'rejected') {
      const quote = quotes.find(q => q.id === id);
      if (quote) {
        setSelectedQuote(quote);
        setRejectDialogOpen(true);
      }
    } else {
      updateMutation.mutate({ id, updates: { status } });
    }
  };
  
  // Handle quote creation
  const handleCreateQuote = (data: any) => {
    createMutation.mutate({
      ...data,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      dealerId: 'current-user-dealer-id',
    });
  };
  
  // Handle quote rejection with reason
  const handleRejectQuote = (reason: string) => {
    if (selectedQuote) {
      updateMutation.mutate({ 
        id: selectedQuote.id, 
        updates: { 
          status: 'rejected' as Quote['status'],
          rejectionReason: reason
        } 
      });
    }
  };

  // Handle quote deletion
  const handleDeleteQuote = () => {
    if (selectedQuote) {
      deleteMutation.mutate(selectedQuote.id);
    }
  };
  
  // Pagination helpers
  const totalPages = Math.ceil(statusCounts[activeTab === 'all' ? 'all' : activeTab] / itemsPerPage);
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  return {
    // States
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
    selectedQuote,
    selectedVehicle,
    
    // Data
    quotes,
    filteredQuotes,
    vehicles,
    dealers,
    models,
    statusCounts,
    totalPages,
    
    // Loading states
    isLoading: isLoadingQuotes || isLoadingVehicles || isLoadingDealers,
    
    // Helpers
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
    handleNextPage
  };
}
