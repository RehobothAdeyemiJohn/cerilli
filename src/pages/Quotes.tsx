import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import QuoteForm from '@/components/quotes/QuoteForm';
import QuoteDetailsDialog from '@/components/quotes/QuoteDetailsDialog';
import QuoteRejectDialog from '@/components/quotes/QuoteRejectDialog';
import QuoteDeleteDialog from '@/components/quotes/QuoteDeleteDialog';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { quotesApi } from '@/api/supabase/quotesApi';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { Quote, Vehicle, Dealer } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { modelsApi } from '@/api/localStorage';
import { useAuth } from '@/context/AuthContext';

const Quotes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin'; // Check if user is admin
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterDealer, setFilterDealer] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (location.state?.fromInventory) {
      const vehicleId = location.state.vehicleId;
      if (vehicleId) {
        setSelectedVehicleId(vehicleId);
        setCreateDialogOpen(true);
      }
    }
  }, [location]);

  const { data: statusCounts = { all: 0, pending: 0, approved: 0, rejected: 0, converted: 0 } } = useQuery({
    queryKey: ['quotes-counts'],
    queryFn: () => quotesApi.getCountByStatus(),
    staleTime: 30000, // 30 seconds
  });
  
  const { data: quotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes', activeTab, currentPage, itemsPerPage],
    queryFn: () => quotesApi.getAll({ 
      limit: itemsPerPage, 
      page: currentPage 
    }),
    staleTime: 10000, // 10 seconds
  });
  
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles-basic'],
    queryFn: () => vehiclesApi.getAll({
      select: 'id,model,trim',
    }),
    staleTime: 60000, // 1 minute
  });

  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealersApi.getAll(),
    staleTime: 60000, // 1 minute
  });

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
    staleTime: 60000, // 1 minute
  });
  
  const createMutation = useMutation({
    mutationFn: (quoteData: Omit<Quote, 'id'>) => quotesApi.create(quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setCreateDialogOpen(false);
      setActiveTab('pending');
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setDeleteDialogOpen(false);
      toast({
        title: 'Preventivo Eliminato',
        description: 'Il preventivo è stato eliminato con successo',
      });
    },
  });
  
  const getShortId = (id: string) => {
    return id.substring(0, 6).toUpperCase();
  };

  const getDealerName = (dealerId: string) => {
    const dealer = dealers.find(d => d.id === dealerId);
    return dealer ? dealer.companyName : 'N/D';
  };
  
  const filteredQuotes = quotes.filter(quote => {
    let matchesStatus = activeTab === 'all' || quote.status === activeTab;
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
    
    return matchesStatus && matchesDealer && matchesModel && matchesSearch;
  });
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterDealer, filterModel, searchQuery]);
  
  const handleCreateQuote = (data: any) => {
    createMutation.mutate({
      ...data,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      dealerId: 'current-user-dealer-id',
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

  const handleDeleteQuote = () => {
    if (selectedQuote) {
      deleteMutation.mutate(selectedQuote.id);
    }
  };
  
  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    if (status === 'rejected') {
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

  const handleDeleteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
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
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => {
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
  
  const totalPages = Math.ceil(statusCounts[activeTab === 'all' ? 'all' : activeTab] / itemsPerPage);
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  if (isLoadingQuotes || isLoadingVehicles || isLoadingDealers) {
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
                {dealers.map(dealer => (
                  <SelectItem key={dealer.id} value={dealer.id}>{dealer.companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">In Attesa ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approvati ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rifiutati ({statusCounts.rejected})</TabsTrigger>
          <TabsTrigger value="converted">Convertiti ({statusCounts.converted})</TabsTrigger>
          <TabsTrigger value="all">Tutti ({statusCounts.all})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {renderQuoteTable(filteredQuotes)}
        </TabsContent>
        
        <TabsContent value="approved">
          {renderQuoteTable(filteredQuotes)}
        </TabsContent>
        
        <TabsContent value="rejected">
          {renderQuoteTable(filteredQuotes)}
        </TabsContent>
        
        <TabsContent value="converted">
          {renderQuoteTable(filteredQuotes)}
        </TabsContent>
        
        <TabsContent value="all">
          {renderQuoteTable(filteredQuotes)}
        </TabsContent>
      </Tabs>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Mostrando pagina {currentPage} di {totalPages || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Pagina {currentPage}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Righe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 righe</SelectItem>
              <SelectItem value="20">20 righe</SelectItem>
              <SelectItem value="50">50 righe</SelectItem>
              <SelectItem value="100">100 righe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[900px]">
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
      
      <QuoteDetailsDialog
        quote={selectedQuote}
        vehicle={selectedVehicle}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onStatusChange={handleUpdateStatus}
      />
      
      <QuoteRejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectQuote}
        onCancel={() => setRejectDialogOpen(false)}
      />

      <QuoteDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteQuote}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default Quotes;
