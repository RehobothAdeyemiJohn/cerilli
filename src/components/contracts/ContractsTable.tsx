
import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DealerContract } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ContractsTableProps {
  data: DealerContract[];
  isLoading?: boolean;
  error?: Error | null;
  onViewDetails: (contract: DealerContract) => void;
  onUpdateStatus?: (contractId: string) => void;
  isStatusUpdating?: boolean;
  onDeleteContract?: (contractId: string) => void;
  onDeleteConfirm?: () => void;
  isAdmin?: boolean;
  deleteContractPending?: boolean;
}

const ContractsTable: React.FC<ContractsTableProps> = ({
  data,
  isLoading,
  error,
  onViewDetails,
  onUpdateStatus,
  isStatusUpdating,
  onDeleteContract,
  onDeleteConfirm,
  isAdmin,
  deleteContractPending,
}) => {
  const columns: ColumnDef<DealerContract>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'dealer.companyName',
      header: 'Concessionario',
      cell: ({ row }) => row.original.dealer?.companyName || 'Dealer not found',
    },
    {
      accessorKey: 'vehicle.model',
      header: 'Veicolo',
      cell: ({ row }) => `${row.original.vehicle?.model} ${row.original.vehicle?.trim || ''}`,
    },
    {
      accessorKey: 'contract_date',
      header: 'Data Contratto',
    },
    {
      accessorKey: 'status',
      header: 'Stato',
    },
    {
      id: 'actions',
      header: 'Azioni',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(row.original)}
          >
            Dettagli
          </Button>
          {onUpdateStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(row.original.id)}
              disabled={row.original.status !== 'attivo'}
            >
              {isStatusUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Completa'
              )}
            </Button>
          )}
          {isAdmin && onDeleteContract && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              onClick={() => onDeleteContract(row.original.id)}
            >
              Elimina
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id.substring(0, 8)}...</TableCell>
                <TableCell>
                  {contract.dealer?.companyName || 'Dealer not found'}
                </TableCell>
                <TableCell>
                  {contract.vehicle?.model} {contract.vehicle?.trim || ''}
                </TableCell>
                <TableCell>
                  {new Date(contract.contract_date).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  <Badge
                    className={clsx(
                      contract.status === 'attivo' && 'bg-green-100 text-green-800',
                      contract.status === 'completato' && 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {contract.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(contract)}
                    >
                      Dettagli
                    </Button>
                    {onUpdateStatus && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStatus(contract.id)}
                        disabled={contract.status !== 'attivo'}
                      >
                        {isStatusUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Completa'
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                Nessun contratto trovato.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractsTable;
