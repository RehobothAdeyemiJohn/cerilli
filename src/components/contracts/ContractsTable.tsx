
import React from 'react';
import { DealerContract } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Trash2 } from 'lucide-react';

interface ContractsTableProps {
  data: DealerContract[]; // Changed from 'contracts' to 'data'
  isLoading: boolean;
  error: Error | null;
  onViewDetails: (contract: DealerContract) => void;
  onDeleteContract: (contractId: string) => void;
  onDeleteConfirm: () => void;
  isAdmin: boolean;
  deleteContractPending: boolean;
}

const ContractsTable: React.FC<ContractsTableProps> = ({
  data, // Changed from 'contracts' to 'data'
  isLoading,
  error,
  onViewDetails,
  onDeleteContract,
  onDeleteConfirm,
  isAdmin,
  deleteContractPending
}) => {
  
  if (isLoading) {
    return <div>Loading contracts...</div>;
  }
  
  if (error) {
    return <div>Error loading contracts: {error.message}</div>;
  }
  
  if (data.length === 0) {
    return <div>No contracts found.</div>;
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract ID</TableHead>
            <TableHead>Dealer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell>{contract.id.substring(0, 8)}</TableCell>
              <TableCell>{contract.dealer?.companyName || 'Unknown'}</TableCell>
              <TableCell>{new Date(contract.contract_date).toLocaleDateString()}</TableCell>
              <TableCell>{contract.status}</TableCell>
              <TableCell className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(contract)}
                >
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
                {isAdmin && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDeleteContract(contract.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractsTable;
