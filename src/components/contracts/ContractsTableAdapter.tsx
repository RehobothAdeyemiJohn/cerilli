
import React from 'react';
import ContractsTable from './ContractsTable';
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
  return (
    <ContractsTable
      data={contracts} // This component expects 'data' prop, not 'contracts'
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
