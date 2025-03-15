
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealerContractsApi } from '@/api/supabase/dealerContractsApi';
import { DealerContract, Order } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useContractsData = () => {
  const queryClient = useQueryClient();
  const [selectedContract, setSelectedContract] = useState<DealerContract | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  
  // Fetch contracts data
  const {
    data: contracts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dealerContracts'],
    queryFn: dealerContractsApi.getAll,
    staleTime: 0,
  });

  // Create contract from order
  const createContractMutation = useMutation({
    mutationFn: async ({ orderId, contractDetails }: { orderId: string, contractDetails: any }) => {
      return dealerContractsApi.createFromOrder(orderId, contractDetails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerContracts'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Contratto creato",
        description: "Il contratto è stato creato con successo",
      });
    },
    onError: (error: any) => {
      console.error('Error creating contract:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante la creazione del contratto",
        variant: "destructive"
      });
    }
  });

  // Delete contract
  const deleteContractMutation = useMutation({
    mutationFn: (contractId: string) => dealerContractsApi.delete(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerContracts'] });
      toast({
        title: "Contratto eliminato",
        description: "Il contratto è stato eliminato con successo",
      });
      setContractToDelete(null);
    },
    onError: (error: any) => {
      console.error('Error deleting contract:', error);
      toast({
        title: "Errore",
        description: error.message || "Si è verificato un errore durante l'eliminazione del contratto",
        variant: "destructive"
      });
    }
  });

  const handleViewDetails = (contract: DealerContract) => {
    setSelectedContract(contract);
    setIsDetailsDialogOpen(true);
  };

  const handleCreateContract = (order: Order, contractDetails: any) => {
    createContractMutation.mutate({ 
      orderId: order.id, 
      contractDetails 
    });
  };

  const handleDeleteContract = (contractId: string) => {
    setContractToDelete(contractId);
  };

  const confirmDeleteContract = () => {
    if (contractToDelete) {
      deleteContractMutation.mutate(contractToDelete);
    }
  };

  return {
    contracts,
    isLoading,
    error,
    refetch,
    selectedContract,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    handleViewDetails,
    handleCreateContract,
    handleDeleteContract,
    confirmDeleteContract,
    isCreatingContract: createContractMutation.isPending,
    isDeletingContract: deleteContractMutation.isPending
  };
};
