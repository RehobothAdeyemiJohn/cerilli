
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteForm from '@/components/quotes/QuoteForm';
import QuoteDetailsDialog from '@/components/quotes/QuoteDetailsDialog';
import QuoteRejectDialog from '@/components/quotes/QuoteRejectDialog';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { quotesApi } from '@/api/localStorage/quotesApi';
import { vehiclesApi } from '@/api/localStorage/vehiclesApi';
import { Quote, Vehicle } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { modelsApi } from '@/api/localStorage';

const Quotes = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterDealer, setFilterDealer] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const queryClient = useQueryClient();
  
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: quotesApi.getAll,
  });
  
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
  });

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
  });
  
  const createMutation = useMutation({
    mutationFn: (quoteData: Omit<Quote, 'id'>) => quotesApi.create(quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setCreateDialogOpen(false);
      toast({
        title: 'Preventivo Creato',
        description: 'Il preventivo è stato creato con successo',
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Quote> }) => 
      quotesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setViewDialogOpen(false);
      setRejectDialogOpen(false);
      toast({
        title: 'Preventivo Aggiornato',
        description: 'Lo stato del preventivo è stato aggiornato con successo',
      });
    },
  });
  
  // Filtra i preventivi in base ai filtri attivi
  const filteredQuotes = quotes.filter(quote => {
    let matchesDealer = filterDealer === 'all' || quote.dealerId === filterDealer;
    
    let matchesModel = true;
    if (filterModel !== 'all') {
      const vehicle = vehicles.find(v => v.id === quote.vehicleId);
      matchesModel = vehicle?.model === filterModel;
    }
    
    let matchesSearch = true;
    if (searchQuery) {
      const vehicle = vehicles.find(v => v.id === quote.vehicleId);
      const lowerSearch = searchQuery.toLowerCase();
      matchesSearch = 
        quote.customerName.toLowerCase().includes(lowerSearch) ||
        quote.customerEmail.toLowerCase().includes(lowerSearch) ||
        (vehicle && vehicle.model.toLowerCase().includes(lowerSearch));
    }
    
    return matchesDealer && matchesModel && matchesSearch;
  });
  
  const pendingQuotes = filteredQuotes.filter(q => q.status === 'pending');
  const approvedQuotes = filteredQuotes.filter(q => q.status === 'approved');
  const rejectedQuotes = filteredQuotes.filter(q => q.status === 'rejected');
  const convertedQuotes = filteredQuotes.filter(q => q.status === 'converted');
  
  const handleCreateQuote = (data: any) => {
    createMutation.mutate({
      ...data,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      dealerId: 'current-user-dealer-id', // Questo dovrebbe essere sostituito con l'ID effettivo del dealer
    });
  };
  
  const handleRejectQuote = (reason: string) => {
    if (selectedQuote) {
      updateMutation.mutate({ 
        id: selectedQuote.id, 
        updates: { 
          status: 'rejected' as Quote['status'],
          rejectionReason: reason
        } 
      });
    }
  };
  
  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    if (status === 'rejected') {
      // Apri il dialog per inserire il motivo del rifiuto
      const quote = quotes.find(q => q.id === id);
      if (quote) {
        setSelectedQuote(quote);
        setRejectDialogOpen(true);
      }
    } else {
      updateMutation.mutate({ id, updates: { status } });
    }
  };
  
  const getVehicleById = (id: string) => {
    return vehicles.find(v => v.id === id);
  };
  
  const handleViewQuote = (quote: Quote) => {
    const vehicle = getVehicleById(quote.vehicleId);
    if (vehicle) {
      setSelectedQuote(quote);
      setSelectedVehicle(vehicle);
      setViewDialogOpen(true);
    } else {
      toast({
        title: "Errore",
        description: "Impossibile trovare il veicolo associato al preventivo",
        variant: "destructive",
      });
    }
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const renderQuoteTable = (filteredQuotes: typeof quotes) => (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Cliente</th>
              <th className="p-3 text-left font-medium">Veicolo</th>
              <th className="p-3 text-left font-medium">Dealer/Venditore</th>
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
                    <td className="p-3">
                      {quote.dealerId || 'N/D'}
                      {/* Qui potrebbe essere aggiunto il nome del venditore */}
                    </td>
                    <td className="p-3">€{quote.finalPrice.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(quote.status)}`}>
                        {quote.status === 'pending' ? 'In attesa' : 
                         quote.status === 'approved' ? 'Approvato' : 
                         quote.status === 'rejected' ? 'Rifiutato' : 'Convertito'}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(quote.createdAt)}</td>
                    <td className="p-3">
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
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
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
                setCreateDialogOpen(true);
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
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cerca per cliente o veicolo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per modello" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i modelli</SelectItem>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <Select value={filterDealer} onValueChange={setFilterDealer}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per dealer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i dealer</SelectItem>
                {/* Qui verrebbero inseriti i dealer da un API */}
                <SelectItem value="dealer1">Concessionaria A</SelectItem>
                <SelectItem value="dealer2">Concessionaria B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">In Attesa ({pendingQuotes.length})</TabsTrigger>
          <TabsTrigger value="approved">Approvati ({approvedQuotes.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rifiutati ({rejectedQuotes.length})</TabsTrigger>
          <TabsTrigger value="converted">Convertiti ({convertedQuotes.length})</TabsTrigger>
          <TabsTrigger value="all">Tutti ({filteredQuotes.length})</TabsTrigger>
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
          {renderQuoteTable(filteredQuotes)}
        </TabsContent>
      </Tabs>
      
      {/* Dialog per creare un nuovo preventivo */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Preventivo</DialogTitle>
          </DialogHeader>
          
          {selectedVehicleId && (
            <QuoteForm 
              vehicle={getVehicleById(selectedVehicleId)!}
              onSubmit={handleCreateQuote}
              onCancel={() => setCreateDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog per visualizzare i dettagli di un preventivo */}
      <QuoteDetailsDialog
        quote={selectedQuote}
        vehicle={selectedVehicle}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onStatusChange={handleUpdateStatus}
      />
      
      {/* Dialog per inserire il motivo del rifiuto */}
      <QuoteRejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectQuote}
        onCancel={() => setRejectDialogOpen(false)}
      />
    </div>
  );
};

export default Quotes;
