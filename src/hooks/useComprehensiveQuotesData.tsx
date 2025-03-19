
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/api/supabase';
import { Quote } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface QuotesFilter {
  status?: string;
  dealerId?: string | null;
  searchText?: string;
  date?: Date | null;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export const useComprehensiveQuotesData = (
  userDealerId?: string | null,
  filters: QuotesFilter = {}
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    total: 0
  });

  // Query to fetch quotes with filters
  const {
    data: quotes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['quotes', userDealerId, filters],
    queryFn: async () => {
      // First get all quotes to calculate counts
      const allQuotes = await quotesApi.getAll();
      
      // Calculate status counts
      const counts = allQuotes.reduce((acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        acc.total++;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0, completed: 0, total: 0 });
      
      setStatusCounts(counts);
      
      // Now apply filters
      let filteredQuotes = [...allQuotes];
      
      // Filter by dealer
      if (userDealerId && !filters.dealerId) {
        filteredQuotes = filteredQuotes.filter(q => q.dealerId === userDealerId);
      } else if (filters.dealerId) {
        filteredQuotes = filteredQuotes.filter(q => q.dealerId === filters.dealerId);
      }
      
      // Filter by status
      if (filters.status) {
        filteredQuotes = filteredQuotes.filter(q => q.status === filters.status);
      }
      
      // Filter by search text
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        filteredQuotes = filteredQuotes.filter(q => 
          q.vehicleInfo?.model?.toLowerCase().includes(searchLower) ||
          q.customerName?.toLowerCase().includes(searchLower) ||
          q.customerEmail?.toLowerCase().includes(searchLower)
        );
      }
      
      // Filter by date
      if (filters.date) {
        const filterDate = new Date(filters.date);
        filterDate.setHours(0, 0, 0, 0);
        
        filteredQuotes = filteredQuotes.filter(q => {
          const quoteDate = new Date(q.createdAt);
          quoteDate.setHours(0, 0, 0, 0);
          return quoteDate.getTime() === filterDate.getTime();
        });
      }
      
      // Sort quotes
      if (filters.sortBy) {
        filteredQuotes.sort((a, b) => {
          if (filters.sortBy === 'createdAt') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (filters.sortBy === 'price') {
            return (b.finalPrice || 0) - (a.finalPrice || 0);
          }
          return 0;
        });
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return filteredQuotes.slice(startIndex, endIndex);
    }
  });

  // Create a new quote
  const { mutateAsync: createQuote, isPending: isCreating } = useMutation({
    mutationFn: async (quoteData: Omit<Quote, 'id'>) => {
      return await quotesApi.create(quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Preventivo creato",
        description: "Il preventivo è stato creato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete a quote
  const { mutateAsync: deleteQuote, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      return await quotesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Preventivo eliminato",
        description: "Il preventivo è stato eliminato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update a quote status
  const { mutateAsync: updateQuoteStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ quoteId, status, rejectionReason }: { 
      quoteId: string; 
      status: string; 
      rejectionReason?: string 
    }) => {
      const updates: any = { status };
      if (rejectionReason) {
        updates.rejectionReason = rejectionReason;
      }
      return await quotesApi.update(quoteId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Stato aggiornato",
        description: "Lo stato del preventivo è stato aggiornato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Create a contract from a quote
  const { mutateAsync: createContract, isPending: isContractSubmitting } = useMutation({
    mutationFn: async (quote: Quote) => {
      // Here you would call the API to create a contract
      // This is just a placeholder for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await quotesApi.update(quote.id, { status: 'converted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Contratto creato",
        description: "Il contratto è stato creato con successo dal preventivo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Wrap updateQuoteStatus to match the expected signature in components
  const updateQuoteStatusWrapper = async (quoteId: string, status: string, rejectionReason?: string) => {
    return await updateQuoteStatus({ quoteId, status, rejectionReason });
  };

  return {
    quotes,
    isLoading,
    error,
    refetch,
    statusCounts,
    createQuote,
    isCreating,
    deleteQuote,
    isDeleting,
    updateQuoteStatus: updateQuoteStatusWrapper,
    isUpdating,
    createContract,
    isContractSubmitting
  };
};
