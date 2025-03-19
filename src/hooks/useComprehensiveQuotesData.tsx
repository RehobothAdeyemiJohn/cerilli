
import { useState, useEffect } from 'react';
import { useQuotesData } from './useQuotesData';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi, dealersApi } from '@/api/supabase';
import { Quote, Vehicle, Dealer } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const useComprehensiveQuotesData = () => {
  // Get the base quotes data
  const baseQuotesData = useQuotesData();
  
  // Additional state for quotes page functionality
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
  
  // Fetch vehicles data
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesApi.getAll(),
  });
  
  // Fetch dealers data
  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
  });
  
  // Compute derived data
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const models = [...new Set(vehicles.map(v => v.model))];
  
  // Filter quotes based on active tab and filters
  const filteredQuotes = baseQuotesData.quotes.filter(quote => {
    // Filter by status (tab)
    if (activeTab !== 'all' && quote.status !== activeTab) return false;
    
    // Filter by dealer
    if (filterDealer && quote.dealerId !== filterDealer) return false;
    
    // Filter by model (check vehicle info if available)
    if (filterModel && quote.vehicleInfo?.model !== filterModel) return false;
    
    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        quote.customerName.toLowerCase().includes(searchLower) ||
        quote.id.toLowerCase().includes(searchLower) ||
        (quote.vehicleInfo?.model || '').toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Calculate status counts
  const statusCounts = {
    all: baseQuotesData.quotes.length,
    pending: baseQuotesData.quotes.filter(q => q.status === 'pending').length,
    approved: baseQuotesData.quotes.filter(q => q.status === 'approved').length,
    rejected: baseQuotesData.quotes.filter(q => q.status === 'rejected').length,
    converted: baseQuotesData.quotes.filter(q => q.status === 'converted').length,
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);
  
  // Helper functions
  const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
  
  const getDealerName = (id: string) => {
    const dealer = dealers.find(d => d.id === id);
    return dealer ? dealer.companyName : 'Unknown Dealer';
  };
  
  const getShortId = (id: string) => id.substring(0, 8);
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: it });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const getStatusBadgeClass = (status: Quote['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Event handlers
  const handleViewQuote = (quote: Quote) => {
    baseQuotesData.setSelectedQuote(quote);
    setViewDialogOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    baseQuotesData.handleDeleteButtonClick(id);
    setDeleteDialogOpen(true);
  };
  
  const handleUpdateStatus = async (id: string, status: Quote['status']) => {
    try {
      await baseQuotesData.quotesApi.update(id, { status });
      await baseQuotesData.refetch();
      toast({
        title: "Status aggiornato",
        description: `Il preventivo è stato ${status === 'approved' ? 'approvato' : status === 'rejected' ? 'rifiutato' : 'aggiornato'} con successo`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del preventivo",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateQuote = () => {
    // Implementation would depend on the form data
    console.log("Create quote with vehicle:", selectedVehicle);
    setCreateDialogOpen(false);
  };
  
  const handleRejectQuote = () => {
    if (baseQuotesData.selectedQuote) {
      handleUpdateStatus(baseQuotesData.selectedQuote.id, 'rejected');
      setRejectDialogOpen(false);
    }
  };
  
  const handleDeleteQuote = () => {
    baseQuotesData.handleDeleteQuoteConfirm();
    setDeleteDialogOpen(false);
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const handleOpenCreateQuoteDialog = (vehicleId: string, isManual: boolean = false) => {
    setSelectedVehicleId(vehicleId);
    setIsManualQuote(isManual);
    setCreateDialogOpen(true);
  };
  
  const handleConvertToContract = (quote: Quote) => {
    baseQuotesData.handleOpenContractDialog(quote);
  };
  
  const handleUpdateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      await baseQuotesData.quotesApi.update(id, updates);
      await baseQuotesData.refetch();
      toast({
        title: "Preventivo aggiornato",
        description: "Il preventivo è stato aggiornato con successo",
      });
      return true;
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del preventivo",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    ...baseQuotesData,
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
    selectedVehicle,
    isManualQuote,
    setIsManualQuote,
    
    filteredQuotes,
    vehicles,
    dealers,
    models,
    statusCounts,
    totalPages,
    paginatedQuotes,
    
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
    handleNextPage,
    handleOpenCreateQuoteDialog,
    handleConvertToContract,
    handleUpdateQuote
  };
};

// Import this where it's needed in your Quotes.tsx
