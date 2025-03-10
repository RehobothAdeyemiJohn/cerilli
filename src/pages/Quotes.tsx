
import React, { useState } from 'react';
import { quotes, vehicles } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteForm from '@/components/quotes/QuoteForm';
import { toast } from '@/hooks/use-toast';

const Quotes = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const approvedQuotes = quotes.filter(q => q.status === 'approved');
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected');
  const convertedQuotes = quotes.filter(q => q.status === 'converted');
  
  const handleCreateQuote = (data: any) => {
    console.log('Quote created:', data);
    setDialogOpen(false);
    toast({
      title: 'Quote Created',
      description: 'The quote has been successfully created',
    });
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
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Vehicle</th>
              <th className="p-3 text-left font-medium">Final Price</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => {
                const vehicle = getVehicleById(quote.vehicleId);
                return (
                  <tr key={quote.id} className="border-b">
                    <td className="p-3">{quote.customerName}</td>
                    <td className="p-3">{vehicle ? `${vehicle.model} ${vehicle.trim}` : 'Unknown'}</td>
                    <td className="p-3">€{quote.finalPrice.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(quote.status)}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                          View
                        </button>
                        {quote.status === 'pending' && (
                          <>
                            <button className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-800">
                              Approve
                            </button>
                            <button className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-red-800">
                              Reject
                            </button>
                          </>
                        )}
                        {quote.status === 'approved' && (
                          <button className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-800">
                            Convert
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
                  No quotes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => {
              setSelectedVehicleId(vehicles[0].id);
              setDialogOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Create New Quote
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending ({pendingQuotes.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedQuotes.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedQuotes.length})</TabsTrigger>
          <TabsTrigger value="converted">Converted ({convertedQuotes.length})</TabsTrigger>
          <TabsTrigger value="all">All ({quotes.length})</TabsTrigger>
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
            <DialogTitle>Create New Quote</DialogTitle>
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
