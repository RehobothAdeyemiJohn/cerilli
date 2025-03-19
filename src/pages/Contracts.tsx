
import React from 'react';
import { useContractsData } from '@/hooks/useContractsData';
import { ContractsTableAdapter } from '@/components/contracts/ContractsTableAdapter';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Contracts = () => {
  const {
    contracts,
    isLoading,
    error,
    selectedContract,
    setSelectedContract,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleViewDetails,
    handleDeleteContract,
    handleDeleteConfirm,
    deleteContractPending,
    isAdmin
  } = useContractsData();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>
                Manage dealer contracts
              </CardDescription>
            </div>
            {isAdmin && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ContractsTableAdapter
            contracts={contracts}
            isLoading={isLoading}
            error={error}
            onViewDetails={handleViewDetails}
            onDeleteContract={handleDeleteContract}
            onDeleteConfirm={handleDeleteConfirm}
            isAdmin={isAdmin}
            deleteContractPending={deleteContractPending}
          />
        </CardContent>
      </Card>

      {/* Contract Details Modal would go here */}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteContractPending}>
              {deleteContractPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contracts;
