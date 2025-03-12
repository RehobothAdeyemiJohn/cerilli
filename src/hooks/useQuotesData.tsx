
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '@/api/supabase/quotesApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useToast } from '@/hooks/use-toast';
import { Quote } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useQuotesData = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isDealerUser = user?.role === 'dealer';
  const dealerId = user?.dealerId;

  // States for filtering and pagination
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterDealer, setFilterDealer] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // States for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterDealer, filterModel, searchQuery, itemsPerPage]);
  
  // Get quotes data
  const { data: quotes = [], isLoading: isLoadingQuotes, refetch: refetchQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll(),
  });
  
  // Get quotes count by status
  const { data: statusCountsData = { all: 0, pending: 0, approved: 0, rejected: 0, converted: 0 }, isLoading: isLoadingCounts } = useQuery({
    queryKey: ['quotesCount'],
    queryFn: () => quotesApi.getCountByStatus(),
  });
  
  // Get vehicles data for creating quotes
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
  });
  
  // Get dealers data
  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
  });

  // Helper functions
  const getVehicleById = (id: string) => {
    return vehicles.find(vehicle => vehicle.id === id);
  };
  
  const getDealerName = (id: string) => {
    const dealer = dealers.find(dealer => dealer.id === id);
    return dealer ? dealer.companyName : 'N/A';
  };
  
  const getShortId = (id: string) => {
    return id.substring(0, 8);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Generate models array from vehicles
  const models = Array.from(new Set(vehicles.map(vehicle => vehicle.model)))
    .map(model => ({ id: model, name: model }));
  
  // Filter quotes based on active filters
  const filteredQuotes = quotes.filter(quote => {
    // Filter by status (tab)
    if (activeTab !== 'all' && quote.status !== activeTab) {
      return false;
    }
    
    // Filter by dealer (for admin users)
    if (filterDealer !== 'all' && quote.dealerId !== filterDealer) {
      return false;
    }
    
    // For dealer users, only show their quotes
    if (isDealerUser && dealerId && quote.dealerId !== dealerId) {
      return false;
    }
    
    // Filter by vehicle model
    if (filterModel !== 'all') {
      const vehicle = getVehicleById(quote.vehicleId);
      if (!vehicle || vehicle.model !== filterModel) {
        return false;
      }
    }
    
    // Search by customer name or vehicle model
    if (searchQuery) {
      const vehicle = getVehicleById(quote.vehicleId);
      const lowerSearch = searchQuery.toLowerCase();
      const matchesCustomer = quote.customerName?.toLowerCase().includes(lowerSearch);
      const matchesVehicle = vehicle?.model?.toLowerCase().includes(lowerSearch);
      
      if (!matchesCustomer && !matchesVehicle) {
        return false;
      }
    }
    
    return true;
  });
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / itemsPerPage));
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get selected vehicle details
  const selectedVehicle = selectedQuote ? getVehicleById(selectedQuote.vehicleId) : null;
  
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
  
  const handleUpdateStatus = async (quoteId: string, newStatus: Quote['status'], rejectionReason?: string) => {
    try {
      const updates: Partial<Quote> = { status: newStatus };
      
      if (rejectionReason) {
        updates.rejectionReason = rejectionReason;
      }
      
      await quotesApi.update(quoteId, updates);
      
      toast({
        title: "Stato aggiornato",
        description: "Lo stato del preventivo è stato aggiornato con successo.",
      });
      
      refetchQuotes();
      setViewDialogOpen(false);
      setRejectDialogOpen(false);
    } catch (error) {
      console.error("Error updating quote status:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dello stato.",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateQuote = async (data: any) => {
    try {
      // Se l'utente è un admin o superadmin, usa un dealerId valido dal primo dealer disponibile
      if ((user?.role === 'admin' || user?.role === 'superAdmin') && dealers.length > 0) {
        data.dealerId = dealers[0].id;
      }
      
      // Per dealers, assicuriamo che venga usato il loro ID
      if (user?.role === 'dealer' && user?.dealerId) {
        data.dealerId = user.dealerId;
      }
      
      // Se ancora non c'è dealerId, usa quello dal form o il primo disponibile
      if (!data.dealerId && dealers.length > 0) {
        data.dealerId = dealers[0].id;
      }
      
      console.log("Creazione preventivo con dealerId:", data.dealerId);
      
      // Imposta data di creazione e stato iniziale
      data.createdAt = new Date().toISOString();
      data.status = 'pending';
      
      await quotesApi.create(data);
      
      toast({
        title: "Preventivo creato",
        description: "Il preventivo è stato creato con successo.",
      });
      
      refetchQuotes();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del preventivo.",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectQuote = async (reason: string) => {
    if (!selectedQuote) return;
    
    await handleUpdateStatus(selectedQuote.id, 'rejected', reason);
  };
  
  const handleDeleteQuote = async () => {
    if (!selectedQuote) return;
    
    try {
      await quotesApi.delete(selectedQuote.id);
      
      toast({
        title: "Preventivo eliminato",
        description: "Il preventivo è stato eliminato con successo.",
      });
      
      refetchQuotes();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del preventivo.",
        variant: "destructive",
      });
    }
  };
  
  const isLoading = isLoadingQuotes || isLoadingVehicles || isLoadingDealers || isLoadingCounts;
  
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
    filteredQuotes: paginatedQuotes,
    vehicles,
    dealers,
    models,
    statusCounts: statusCountsData,
    totalPages,
    
    // Loading states
    isLoading,
    
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
};
