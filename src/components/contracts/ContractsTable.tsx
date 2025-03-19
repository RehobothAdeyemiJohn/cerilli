
import React from 'react';
import { DealerContract } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { FileText } from 'lucide-react';

interface ContractsTableProps {
  contracts: DealerContract[];
  isLoading: boolean;
  error: any;
  onViewDetails: (contract: DealerContract) => void;
  onDeleteContract: (contractId: string) => void;
  onDeleteConfirm: () => void;
  isAdmin: boolean;
  deleteContractPending: boolean;
}

const ContractsTable = ({
  contracts,
  isLoading,
  error,
  onViewDetails,
  onDeleteContract,
  onDeleteConfirm,
  isAdmin,
  deleteContractPending
}: ContractsTableProps) => {
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'attivo':
        return 'bg-green-100 text-green-800';
      case 'completato':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concessionario</TableHead>
              <TableHead>Modello Auto</TableHead>
              <TableHead>Data Contratto</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Caricamento contratti...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-red-500">
                  Errore durante il caricamento dei contratti.
                </TableCell>
              </TableRow>
            ) : contracts.length > 0 ? (
              contracts.map((contract) => {
                const dealerName = contract.dealer ? contract.dealer.companyName : 'Dealer non disponibile';
                const vehicleInfo = contract.vehicle ? 
                  `${contract.vehicle.model} ${contract.vehicle.trim || ''}` : 
                  'Veicolo non disponibile';
                
                return (
                  <TableRow key={contract.id}>
                    <TableCell>{dealerName}</TableCell>
                    <TableCell>{vehicleInfo}</TableCell>
                    <TableCell>
                      {contract.contract_date ? new Date(contract.contract_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(contract.status)}`}>
                        {contract.status === 'attivo' ? 'Attivo' : 
                         contract.status === 'completato' ? 'Completato' : contract.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => onViewDetails(contract)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Dettagli
                        </Button>
                        
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 bg-gray-100 hover:bg-gray-200"
                                onClick={() => onDeleteContract(contract.id)}
                              >
                                Elimina
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Questa azione non può essere annullata. Il contratto verrà eliminato permanentemente dal database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={onDeleteConfirm}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={deleteContractPending}
                                >
                                  {deleteContractPending ? 'Eliminazione...' : 'Elimina'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  Nessun contratto trovato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ContractsTable;
