
import React from 'react';
import { ContractsTable } from './ContractsTable';
import { DealerContract } from '@/types';

interface ContractsTableAdapterProps {
  contracts: DealerContract[];
  isLoading: boolean;
  error: Error | null;
  onViewDetails: (contract: DealerContract) => void;
  onDeleteContract: (contractId: string) => void;
  onDeleteConfirm: () => void;
  isAdmin: boolean;
  deleteContractPending: boolean;
}

export const ContractsTableAdapter: React.FC<ContractsTableAdapterProps> = ({
  contracts,
  isLoading,
  error,
  onViewDetails,
  onDeleteContract,
  onDeleteConfirm,
  isAdmin,
  deleteContractPending
}) => {
  // This is an adapter component that maps the props we have to the props 
  // the ContractsTable component expects
  return (
    <ContractsTable
      data={contracts} // Map 'contracts' to 'data'
      isLoading={isLoading}
      error={error}
      onViewDetails={onViewDetails}
      onDeleteContract={onDeleteContract}
      onDeleteConfirm={onDeleteConfirm}
      isAdmin={isAdmin}
      deleteContractPending={deleteContractPending}
    />
  );
};
