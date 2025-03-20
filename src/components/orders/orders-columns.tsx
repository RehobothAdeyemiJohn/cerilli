
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileText, Truck, X, Edit, Trash2, FileCheck, Check } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface OrdersColumnsOptions {
  isAdmin: boolean;
  isDelivering: boolean;
  isCancelling: boolean;
  isGeneratingODL: boolean;
  handleMarkAsDelivered: (orderId: string) => void;
  handleCancelOrder: (orderId: string) => void;
  handleEditOrderDetails: (order: Order) => void;
  handleGeneratePdf: (order: Order) => void;
  handleGenerateODL: (orderId: string) => void;
  onDeleteButtonClick: (orderId: string) => void;
}

export const ordersColumns = ({
  isAdmin,
  isDelivering,
  isCancelling,
  isGeneratingODL,
  handleMarkAsDelivered,
  handleCancelOrder,
  handleEditOrderDetails,
  handleGeneratePdf,
  handleGenerateODL,
  onDeleteButtonClick
}: OrdersColumnsOptions): ColumnDef<Order>[] => {
  
  // Helper function to render boolean values as check icons or X icons
  const renderBooleanStatus = (value: boolean | undefined) => {
    if (value === true) {
      return <Check className="h-4 w-4 text-green-600 mx-auto" />;
    }
    return <X className="h-4 w-4 text-red-500 mx-auto" />;
  };
  
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => {
        const id = row.getValue('id') as string;
        return <span className="font-medium">{id.slice(0, 8)}</span>;
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Cliente',
    },
    {
      accessorKey: 'modelName',
      header: 'Modello',
    },
    {
      accessorKey: 'dealerName',
      header: 'Concessionario',
    },
    {
      accessorKey: 'orderDate',
      header: 'Data Ordine',
      cell: ({ row }) => {
        const date = row.getValue('orderDate');
        return date ? format(new Date(date as string), 'dd/MM/yyyy') : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Stato',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        
        let color = "bg-gray-200 text-gray-800";
        
        if (status === 'processing') {
          color = "bg-blue-100 text-blue-800";
        } else if (status === 'delivered') {
          color = "bg-green-100 text-green-800";
        } else if (status === 'cancelled') {
          color = "bg-red-100 text-red-800";
        }
        
        let label = status;
        if (status === 'processing') label = 'In Lavorazione';
        if (status === 'delivered') label = 'Consegnato';
        if (status === 'cancelled') label = 'Annullato';
        
        return (
          <Badge variant="outline" className={`${color} px-2 py-1 rounded-full text-xs`}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isLicensable',
      header: 'Targabile',
      cell: ({ row }) => {
        const value = row.getValue('isLicensable') as boolean;
        return renderBooleanStatus(value);
      },
    },
    {
      accessorKey: 'hasProforma',
      header: 'Proforma',
      cell: ({ row }) => {
        const value = row.getValue('hasProforma') as boolean;
        return renderBooleanStatus(value);
      },
    },
    {
      accessorKey: 'isPaid',
      header: 'Pagato',
      cell: ({ row }) => {
        const value = row.getValue('isPaid') as boolean;
        return renderBooleanStatus(value);
      },
    },
    {
      accessorKey: 'isInvoiced',
      header: 'Fatturato',
      cell: ({ row }) => {
        const value = row.getValue('isInvoiced') as boolean;
        return renderBooleanStatus(value);
      },
    },
    {
      accessorKey: 'hasConformity',
      header: 'Conformità',
      cell: ({ row }) => {
        const value = row.getValue('hasConformity') as boolean;
        return renderBooleanStatus(value);
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Apri menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleEditOrderDetails(order)}
              >
                <Edit className="mr-2 h-4 w-4" /> Modifica
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleGeneratePdf(order)}
              >
                <FileText className="mr-2 h-4 w-4" /> Genera PDF
              </DropdownMenuItem>
              
              {order.status === 'processing' && (
                <DropdownMenuItem
                  onClick={() => handleMarkAsDelivered(order.id)}
                  disabled={isDelivering || !order.odlGenerated}
                >
                  <Truck className="mr-2 h-4 w-4" /> Segna come consegnato
                </DropdownMenuItem>
              )}
              
              {order.status === 'processing' && (
                <DropdownMenuItem
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={isCancelling}
                >
                  <X className="mr-2 h-4 w-4" /> Annulla ordine
                </DropdownMenuItem>
              )}
              
              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => handleGenerateODL(order.id)}
                  disabled={isGeneratingODL}
                >
                  <FileCheck className="mr-2 h-4 w-4" /> Genera ODL
                </DropdownMenuItem>
              )}
              
              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => onDeleteButtonClick(order.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Elimina
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  return columns;
};
