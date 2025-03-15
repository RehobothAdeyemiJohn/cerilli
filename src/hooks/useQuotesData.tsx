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
  const isDealerUser = user?.type === 'dealer' || user?.type === 'vendor';
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
  const [isManualQuote, setIsManualQuote] = useState<boolean>(false);
  
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
    console.log("Searching for vehicle with ID:", id);
    const vehicle = vehicles.find(vehicle => vehicle.id === id);
    console.log("Found vehicle:", vehicle);
    return vehicle;
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
  
  const handleOpenCreateQuoteDialog = (vehicleId?: string) => {
    if (vehicleId) {
      setSelectedVehicleId(vehicleId);
      setIsManualQuote(false);
    } else {
      setSelectedVehicleId(null);
      setIsManualQuote(true);
    }
    setCreateDialogOpen(true);
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
      // Make sure we have a dealer ID
      if (!data.dealerId && dealers.length > 0) {
        data.dealerId = dealers[0].id;
      }
      
      console.log("Creazione preventivo con dealerId:", data.dealerId);
      
      // For manual quotes, check if we need to create a temporary vehicle first
      if (data.manualEntry && data.vehicleData) {
        console.log("Creating manual quote with vehicleData:", data.vehicleData);
        
        try {
          // First, create a temporary vehicle record
          const vehicleData = {
            model: data.model || data.vehicleData.model,
            trim: data.trim || data.vehicleData.trim,
            fuelType: data.fuelType || data.vehicleData.fuelType,
            exteriorColor: data.exteriorColor || data.vehicleData.exteriorColor,
            price: data.price || data.vehicleData.price,
            location: "Preventivo Manuale", // Default location for manual quotes
            status: "available" as const,
            dateAdded: new Date().toISOString(),
            telaio: "MANUALE" + Math.floor(Math.random() * 10000), // Generate a random telaio number
            accessories: [] as string[]
          };
          
          console.log("Creating temporary vehicle:", vehicleData);
          
          // Create the vehicle first
          const newVehicle = await vehiclesApi.create(vehicleData);
          console.log("Temporary vehicle created:", newVehicle);
          
          // Now create the quote with the new vehicle ID
          const quoteData: Omit<Quote, 'id'> = {
            vehicleId: newVehicle.id,
            dealerId: data.dealerId,
            customerName: data.customerName,
            customerEmail: data.customerEmail || '',
            customerPhone: data.customerPhone || '',
            price: data.price || 0,
            discount: data.discount || 0,
            finalPrice: data.finalPrice || 0,
            createdAt: new Date().toISOString(),
            status: 'pending' as Quote['status'],
            notes: data.notes || '',
            manualEntry: true
          };
          
          await quotesApi.create(quoteData);
          
          toast({
            title: "Preventivo creato",
            description: "Il preventivo manuale è stato creato con successo.",
          });
          
          refetchQuotes();
          setCreateDialogOpen(false);
          setIsManualQuote(false);
          
        } catch (error) {
          console.error("Error creating manual quote:", error);
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante la creazione del preventivo manuale.",
            variant: "destructive",
          });
        }
      } else {
        // Regular quote with an existing vehicle
        const quoteData: Omit<Quote, 'id'> = {
          vehicleId: data.vehicleId,
          dealerId: data.dealerId,
          customerName: data.customerName,
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || '',
          price: data.price || 0,
          discount: data.discount || 0,
          finalPrice: data.finalPrice || 0,
          createdAt: new Date().toISOString(),
          status: 'pending' as Quote['status'],
          notes: data.notes || '',
          manualEntry: Boolean(data.manualEntry)
        };
        
        await quotesApi.create(quoteData);
        
        toast({
          title: "Preventivo creato",
          description: "Il preventivo è stato creato con successo.",
        });
        
        refetchQuotes();
        setCreateDialogOpen(false);
        setIsManualQuote(false);
      }
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
    isManualQuote,
    setIsManualQuote,
    
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
    handleNextPage,
    handleOpenCreateQuoteDialog
  };
};
