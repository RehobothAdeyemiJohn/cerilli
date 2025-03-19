
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/api/supabase';
import { DealerContract, Quote } from '@/types';
import { toast } from '@/hooks/use-toast';

// Since dealerContractsApi is missing, let's temporarily define a mock version
const mockDealerContractsApi = {
  create: async (contractData: any) => {
    console.log('Creating contract with data:', contractData);
    return {
      id: 'mock-contract-id',
      ...contractData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

export const useQuotesData = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isContractSubmitting, setIsContractSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { 
    data: quotes = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll(),
  });
  
  const { mutate: deleteQuote } = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(true);
      return quotesApi.delete(id);
    },
    onSuccess: () => {
      toast({
        title: "Preventivo eliminato",
        description: "Il preventivo è stato eliminato con successo",
      });
      setIsDeleteDialogOpen(false);
      setDeleteQuoteId(null);
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (error) => {
      console.error("Error deleting quote:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del preventivo",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  });
  
  const handleDeleteButtonClick = (id: string) => {
    setDeleteQuoteId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteQuoteConfirm = () => {
    if (deleteQuoteId) {
      deleteQuote(deleteQuoteId);
    }
  };
  
  const handleOpenContractDialog = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsContractDialogOpen(true);
  };
  
  const handleCloseContractDialog = () => {
    setIsContractDialogOpen(false);
    setSelectedQuote(null);
  };

  // Fix the property names in the contract creation
  const handleCreateContract = async () => {
    if (!selectedQuote) return;
    
    try {
      setIsContractSubmitting(true);
      
      const contractData = {
        dealer_id: selectedQuote.dealerId,
        car_id: selectedQuote.vehicleId,
        contract_date: new Date().toISOString(),
        status: 'attivo',
        contract_details: {
          quoteId: selectedQuote.id,
          customerName: selectedQuote.customerName,
          finalPrice: selectedQuote.finalPrice,
          createdAt: selectedQuote.createdAt
        }
      };
      
      const result = await mockDealerContractsApi.create(contractData);
      
      if (result) {
        toast({
          title: "Contratto creato",
          description: "Il contratto è stato creato con successo"
        });
        
        // Update the quote status to reflect the contract creation
        await quotesApi.update(selectedQuote.id, {
          status: 'converted'
        });
        
        // Refresh quotes data
        await queryClient.invalidateQueries({ queryKey: ['quotes'] });
        
        // Close the dialog
        setIsContractDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del contratto",
        variant: "destructive"
      });
    } finally {
      setIsContractSubmitting(false);
    }
  };
  
  return {
    quotes,
    isLoading,
    error,
    refetch,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteQuoteId,
    setDeleteQuoteId,
    isDeleting,
    setIsDeleting,
    handleDeleteButtonClick,
    handleDeleteQuoteConfirm,
    isContractDialogOpen,
    setIsContractDialogOpen,
    selectedQuote,
    setSelectedQuote,
    handleOpenContractDialog,
    handleCloseContractDialog,
    handleCreateContract,
    isContractSubmitting
  };
};
