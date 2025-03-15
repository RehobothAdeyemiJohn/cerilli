
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useContractsData } from '@/hooks/useContractsData';
import ContractsTable from '@/components/contracts/ContractsTable';
import ContractDetailsDialog from '@/components/contracts/ContractDetailsDialog';
import ContractFormDialog from '@/components/contracts/ContractFormDialog';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

const Contracts = () => {
  const { isAdmin } = useAuth();
  const {
    contracts,
    isLoading,
    error,
    selectedContract,
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    handleViewDetails,
    handleCreateContract,
    handleDeleteContract,
    confirmDeleteContract,
    isDeletingContract
  } = useContractsData();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Gestisce l'apertura del dialogo di creazione contratto
  const handleOpenContractForm = (order: Order) => {
    setSelectedOrder(order);
    setIsFormDialogOpen(true);
  };

  // Gestisce la creazione di un contratto
  const handleContractFormSubmit = (formData: any) => {
    if (selectedOrder) {
      handleCreateContract(selectedOrder, formData);
      setIsFormDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contratti Dealer - Cirelli Motor Company</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contratti Dealer</h1>
        </div>

        <ContractsTable
          contracts={contracts}
          isLoading={isLoading}
          error={error}
          onViewDetails={handleViewDetails}
          onDeleteContract={handleDeleteContract}
          onDeleteConfirm={confirmDeleteContract}
          isAdmin={isAdmin}
          deleteContractPending={isDeletingContract}
        />

        {/* Dialog per visualizzare i dettagli del contratto */}
        <ContractDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          contract={selectedContract}
        />

        {/* Dialog per creare un nuovo contratto da un ordine */}
        <ContractFormDialog
          isOpen={isFormDialogOpen}
          onClose={() => setIsFormDialogOpen(false)}
          onSubmit={handleContractFormSubmit}
          order={selectedOrder}
          isSubmitting={false}
        />
      </div>
    </>
  );
};

export default Contracts;
