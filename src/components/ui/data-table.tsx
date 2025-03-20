
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
import { FileText, Truck } from 'lucide-react';

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

  // Function to render action buttons with consistent order
  const renderRowActions = (row: any) => {
    const item = row.original;
    return (
      <div className="flex justify-end space-x-2">
        {onGeneratePdf && (
          <Button variant="outline" size="sm" onClick={() => onGeneratePdf(item)}>
            <FileText className="mr-2 h-4 w-4" /> 
            Anteprima
          </Button>
        )}
        
        {onViewDetails && (
          <Button variant="secondary" size="sm" onClick={() => onViewDetails(item)}>
            APRI ORDINE
          </Button>
        )}
        
        {onMarkAsDelivered && item.status === 'processing' && item.odlGenerated && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onMarkAsDelivered(item.id)}
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            <Truck className="mr-2 h-4 w-4" />
            Consegna
          </Button>
        )}
      </div>
    );
  };

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
              <Button 
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
              >
                <PaginationPrevious className="h-4 w-4" />
              </Button>
            </PaginationItem>
            
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <PaginationItem key={i}>
                <Button
                  variant={table.getState().pagination.pageIndex === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            )).slice(
              Math.max(0, table.getState().pagination.pageIndex - 1),
              Math.min(table.getPageCount(), table.getState().pagination.pageIndex + 3)
            )}
            
            <PaginationItem>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
              >
                <PaginationNext className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
