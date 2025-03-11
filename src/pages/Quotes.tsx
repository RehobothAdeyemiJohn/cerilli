
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteForm from '@/components/quotes/QuoteForm';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { quotesApi } from '@/api/localStorage/quotesApi';
import { vehiclesApi } from '@/api/localStorage/vehiclesApi';
import { Quote, Vehicle } from '@/types';

const Quotes = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: quotesApi.getAll,
  });
  
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
  });
  
  const createMutation = useMutation({
    mutationFn: (quoteData: Omit<Quote, 'id'>) => quotesApi.create(quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setDialogOpen(false);
      toast({
        title: 'Preventivo Creato',
        description: 'Il preventivo è stato creato con successo',
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Quote['status'] }) => 
      quotesApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: 'Preventivo Aggiornato',
        description: 'Lo stato del preventivo è stato aggiornato con successo',
      });
    },
  });
  
  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const approvedQuotes = quotes.filter(q => q.status === 'approved');
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected');
  const convertedQuotes = quotes.filter(q => q.status === 'converted');
  
  const handleCreateQuote = (data: any) => {
    createMutation.mutate({
      ...data,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    });
  };
  
  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    updateMutation.mutate({ id, status });
  };
  
  const getVehicleById = (id: string) => {
    return vehicles.find(v => v.id === id);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderQuoteTable = (filteredQuotes: typeof quotes) => (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Cliente</th>
              <th className="p-3 text-left font-medium">Veicolo</th>
              <th className="p-3 text-left font-medium">Prezzo Finale</th>
              <th className="p-3 text-left font-medium">Stato</th>
              <th className="p-3 text-left font-medium">Data</th>
              <th className="p-3 text-left font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => {
                const vehicle = getVehicleById(quote.vehicleId);
                return (
                  <tr key={quote.id} className="border-b">
                    <td className="p-3">{quote.customerName}</td>
                    <td className="p-3">{vehicle ? `${vehicle.model} ${vehicle.trim}` : 'Sconosciuto'}</td>
                    <td className="p-3">€{quote.finalPrice.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(quote.status)}`}>
                        {quote.status === 'pending' ? 'In attesa' : 
                         quote.status === 'approved' ? 'Approvato' : 
                         quote.status === 'rejected' ? 'Rifiutato' : 'Convertito'}
                      </span>
                    </td>
                    <td className="p-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
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
                          <button 
                            className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-800"
                            onClick={() => handleUpdateStatus(quote.id, 'converted')}
                          >
                            Converti
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-3 text-center text-gray-500">
                  Nessun preventivo trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  if (isLoadingQuotes || isLoadingVehicles) {
    return <div className="container mx-auto py-6 px-4">Caricamento in corso...</div>;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Preventivi</h1>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => {
              if (vehicles.length > 0) {
                setSelectedVehicleId(vehicles[0].id);
                setDialogOpen(true);
              } else {
                toast({
                  title: "Errore",
                  description: "Non ci sono veicoli disponibili per creare un preventivo",
                  variant: "destructive",
                });
              }
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crea Nuovo Preventivo
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">In Attesa ({pendingQuotes.length})</TabsTrigger>
          <TabsTrigger value="approved">Approvati ({approvedQuotes.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rifiutati ({rejectedQuotes.length})</TabsTrigger>
          <TabsTrigger value="converted">Convertiti ({convertedQuotes.length})</TabsTrigger>
          <TabsTrigger value="all">Tutti ({quotes.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {renderQuoteTable(pendingQuotes)}
        </TabsContent>
        
        <TabsContent value="approved">
          {renderQuoteTable(approvedQuotes)}
        </TabsContent>
        
        <TabsContent value="rejected">
          {renderQuoteTable(rejectedQuotes)}
        </TabsContent>
        
        <TabsContent value="converted">
          {renderQuoteTable(convertedQuotes)}
        </TabsContent>
        
        <TabsContent value="all">
          {renderQuoteTable(quotes)}
        </TabsContent>
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Preventivo</DialogTitle>
          </DialogHeader>
          
          {selectedVehicleId && (
            <QuoteForm 
              vehicle={getVehicleById(selectedVehicleId)!}
              onSubmit={handleCreateQuote}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Quotes;
