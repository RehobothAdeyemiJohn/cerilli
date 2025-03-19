
import React from 'react';
import { 
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Order } from '@/types';

interface DataTableProps {
  columns: any[];
  data: any[];
  isLoading?: boolean;
  error?: Error | null;
  isAdmin?: boolean;
  showAdminColumns?: boolean;
  onViewDetails?: (row: any) => void;
  onMarkAsDelivered?: (id: string) => void;
  onCancelOrder?: (id: string) => void;
  onEditDetails?: (row: any) => void;
  onGeneratePdf?: (row: any) => void;
  onGenerateODL?: (id: string) => void;
  onDeleteButtonClick?: (id: string) => void;
  deleteOrderId?: string | null;
  deleteOrderPending?: boolean;
  onDeleteConfirm?: (id: string) => void;
  onPreviewPDF?: () => void;
}

export function DataTable({ 
  columns, 
  data,
  isLoading,
  error,
  isAdmin,
  showAdminColumns,
  onViewDetails,
  onMarkAsDelivered,
  onCancelOrder,
  onEditDetails,
  onGeneratePdf,
  onGenerateODL,
  onDeleteButtonClick,
  deleteOrderId,
  deleteOrderPending,
  onDeleteConfirm,
  onPreviewPDF
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Errore: {error.message}</div>;
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nessun risultato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={table.getState().pagination.pageIndex === i}
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            )).slice(
              Math.max(0, table.getState().pagination.pageIndex - 1),
              Math.min(table.getPageCount(), table.getState().pagination.pageIndex + 3)
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
