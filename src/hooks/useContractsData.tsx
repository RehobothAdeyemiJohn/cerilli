
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DealerContract, Order } from '@/types';
import { dealerContractsApi } from '@/api/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useContractsData = () => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const queryClient = useQueryClient();
  const [selectedContract, setSelectedContract] = useState<DealerContract | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);

  // Fetch contracts
  const { data: contracts = [], isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: dealerContractsApi.getAll
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: (order: Order) => {
      // Ensure we're using the correct properties that match the expected fields in the contract creation process
      return dealerContractsApi.createFromOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: 'Contract Created',
        description: 'Contract has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating contract:', error);
      toast({
        title: 'Error',
        description: 'Failed to create contract.',
        variant: 'destructive',
      });
    }
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: (contractId: string) => {
      return dealerContractsApi.delete(contractId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: 'Contract Deleted',
        description: 'Contract has been deleted successfully.',
      });
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting contract:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contract.',
        variant: 'destructive',
      });
    }
  });

  const handleViewDetails = (contract: DealerContract) => {
    setSelectedContract(contract);
  };

  const handleDeleteContract = (contractId: string) => {
    setContractToDelete(contractId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (contractToDelete) {
      deleteContractMutation.mutate(contractToDelete);
    }
  };

  return {
    contracts,
    isLoading,
    error: error as Error,
    selectedContract,
    setSelectedContract,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleViewDetails,
    handleDeleteContract,
    handleDeleteConfirm,
    createContract: createContractMutation.mutate,
    isContractSubmitting: createContractMutation.isPending,
    deleteContractPending: deleteContractMutation.isPending,
    isAdmin
  };
};
