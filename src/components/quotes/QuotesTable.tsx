
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Quote } from '@/types';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface QuotesTableProps {
  quotes: Quote[];
  getVehicleById: (id: string) => any;
  getDealerName: (id: string) => string;
  getShortId: (id: string) => string;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (date: string) => string;
  handleViewQuote: (quote: Quote) => void;
  handleUpdateStatus: (id: string, status: Quote['status']) => void;
  handleDeleteClick: (quote: Quote) => void;
}

const QuotesTable: React.FC<QuotesTableProps> = ({
  quotes,
  getVehicleById,
  getDealerName,
  getShortId,
  getStatusBadgeClass,
  formatDate,
  handleViewQuote,
  handleUpdateStatus,
  handleDeleteClick
}) => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veicolo</TableHead>
              <TableHead>Dealer/Venditore</TableHead>
              <TableHead>Prezzo Finale</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length > 0 ? (
              quotes.map((quote) => {
                const vehicle = getVehicleById(quote.vehicleId);
                return (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-xs">{getShortId(quote.id)}</TableCell>
                    <TableCell>{quote.customerName}</TableCell>
                    <TableCell>{vehicle ? `${vehicle.model} ${vehicle.trim || ''}` : 'Sconosciuto'}</TableCell>
                    <TableCell>
                      {getDealerName(quote.dealerId)}
                    </TableCell>
                    <TableCell>€{quote.finalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(quote.status)}`}>
                        {quote.status === 'pending' ? 'In attesa' : 
                         quote.status === 'approved' ? 'Approvato' : 
                         quote.status === 'rejected' ? 'Rifiutato' : 'Convertito'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(quote.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button 
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                          onClick={() => handleViewQuote(quote)}
                        >
                          Visualizza
                        </button>
                        {quote.status === 'pending' && (
                          <>
                            <button 
                              className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-800"
                              onClick={() => handleUpdateStatus(quote.id, 'approved')}
                            >
                              Approva
                            </button>
                            <button 
                              className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-800"
                              onClick={() => handleUpdateStatus(quote.id, 'rejected')}
                            >
                              Rifiuta
                            </button>
                          </>
                        )}
                        {quote.status === 'approved' && (
                          <>
                            <button 
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                              onClick={() => handleUpdateStatus(quote.id, 'pending')}
                            >
                              In Attesa
                            </button>
                            <button 
                              className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-800"
                              onClick={() => handleUpdateStatus(quote.id, 'converted')}
                            >
                              Converti
                            </button>
                          </>
                        )}
                        {isAdmin && (
                          <button 
                            className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-800"
                            onClick={() => handleDeleteClick(quote)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  Nessun preventivo trovato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuotesTable;
