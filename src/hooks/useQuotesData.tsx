
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
  // Check if the user type is 'dealer' rather than checking the role
  const isDealerUser = user?.type === 'dealer';
  const dealerId = user?.dealerId;

  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterDealer, setFilterDealer] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterDealer, filterModel, searchQuery, itemsPerPage]);
  
  const { data: quotes = [], isLoading: isLoadingQuotes, refetch: refetchQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll(),
  });
  
  const { data: statusCountsData = { all: 0, pending: 0, approved: 0, rejected: 0, converted: 0 }, isLoading: isLoadingCounts } = useQuery({
    queryKey: ['quotesCount'],
    queryFn: () => quotesApi.getCountByStatus(),
  });
  
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
  });
  
  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
  });

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
  
  const models = Array.from(new Set(vehicles.map(vehicle => vehicle.model)))
    .map(model => ({ id: model, name: model }));
  
  const filteredQuotes = quotes.filter(quote => {
    if (activeTab !== 'all' && quote.status !== activeTab) {
      return false;
    }
    
    if (filterDealer !== 'all' && quote.dealerId !== filterDealer) {
      return false;
    }
    
    if (isDealerUser && dealerId && quote.dealerId !== dealerId) {
      return false;
    }
    
    if (filterModel !== 'all') {
      const vehicle = getVehicleById(quote.vehicleId);
      if (!vehicle || vehicle.model !== filterModel) {
        return false;
      }
    }
    
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
  
  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / itemsPerPage));
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const selectedVehicle = selectedQuote ? getVehicleById(selectedQuote.vehicleId) : null;
  
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
      if (!data.dealerId && dealers.length > 0) {
        data.dealerId = dealers[0].id;
      }
      
      console.log("Creazione preventivo con dealerId:", data.dealerId);
      
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
    
    filteredQuotes: paginatedQuotes,
    vehicles,
    dealers,
    models,
    statusCounts: statusCountsData,
    totalPages,
    
    isLoading,
    
    getVehicleById,
    getDealerName,
    getShortId,
    formatDate,
    getStatusBadgeClass,
    
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
