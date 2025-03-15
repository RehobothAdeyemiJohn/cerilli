
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QuoteForm from '@/components/quotes/QuoteForm';
import QuoteDetailsDialog from '@/components/quotes/QuoteDetailsDialog';
import QuoteRejectDialog from '@/components/quotes/QuoteRejectDialog';
import QuoteDeleteDialog from '@/components/quotes/QuoteDeleteDialog';

// Import our components
import QuotesHeader from '@/components/quotes/QuotesHeader';
import QuotesFilters from '@/components/quotes/QuotesFilters';
import QuotesTabs from '@/components/quotes/QuotesTabs';
import QuotesPagination from '@/components/quotes/QuotesPagination';
import { useQuotesData } from '@/hooks/useQuotesData';

// Define the status counts type to match what getCountByStatus returns
type StatusCounts = {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  converted: number;
};

const Quotes = () => {
  const location = useLocation();
  const {
    // States
    activeTab,
    setActiveTab,
    filterDealer,
    setFilterDealer,
    filterModel,
    setFilterModel,
    searchQuery,
    setSearchQuery,
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedVehicleId,
    setSelectedVehicleId,
    createDialogOpen,
    setCreateDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedQuote,
    selectedVehicle,
    isManualQuote,
    setIsManualQuote,
    
    // Data
    filteredQuotes,
    vehicles,
    dealers,
    models,
    statusCounts,
    totalPages,
    
    // Loading states
    isLoading,
    
    // Helpers
    getVehicleById,
    getDealerName,
    getShortId,
    formatDate,
    getStatusBadgeClass,
    
    // Event handlers
    handleViewQuote,
    handleDeleteClick,
    handleUpdateStatus,
    handleCreateQuote,
    handleRejectQuote,
    handleDeleteQuote,
    handlePrevPage,
    handleNextPage,
    handleOpenCreateQuoteDialog
  } = useQuotesData();
  
  // Handle navigation from other pages (e.g., vehicle inventory)
  useEffect(() => {
    if (location.state?.fromInventory) {
      const vehicleId = location.state.vehicleId;
      console.log("Quote page received vehicleId from navigation:", vehicleId);
      if (vehicleId) {
        console.log("Opening create quote dialog with vehicleId:", vehicleId);
        handleOpenCreateQuoteDialog(vehicleId);
      }
    }
  }, [location]);
  
  if (isLoading) {
    return <div className="container mx-auto py-6 px-4">Caricamento in corso...</div>;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header with Create Quote button */}
      <QuotesHeader 
        handleOpenCreateQuoteDialog={handleOpenCreateQuoteDialog}
      />
      
      {/* Search and Filters */}
      <QuotesFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        filterDealer={filterDealer}
        setFilterDealer={setFilterDealer}
        models={models}
        dealers={dealers}
      />
      
      {/* Tabs and Table */}
      <QuotesTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusCounts={statusCounts as StatusCounts}
        filteredQuotes={filteredQuotes}
        getVehicleById={getVehicleById}
        getDealerName={getDealerName}
        getShortId={getShortId}
        getStatusBadgeClass={getStatusBadgeClass}
        formatDate={formatDate}
        handleViewQuote={handleViewQuote}
        handleUpdateStatus={handleUpdateStatus}
        handleDeleteClick={handleDeleteClick}
      />
      
      {/* Pagination */}
      <QuotesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        setItemsPerPage={setItemsPerPage}
      />
      
      {/* Create Quote Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="w-full max-w-[1200px] max-h-[90vh] overflow-y-auto grid grid-cols-1">
          <DialogHeader>
            <DialogTitle>
              {isManualQuote ? 'Crea Nuovo Preventivo Manuale' : 'Crea Nuovo Preventivo'}
            </DialogTitle>
            <DialogDescription>
              {isManualQuote 
                ? 'Compila il modulo per creare un preventivo manuale senza un veicolo selezionato'
                : selectedVehicleId 
                  ? 'Configura un preventivo per il veicolo selezionato'
                  : 'Seleziona un veicolo e configura le opzioni per il preventivo'
              }
            </DialogDescription>
          </DialogHeader>
          
          <QuoteForm 
            vehicle={selectedVehicleId ? getVehicleById(selectedVehicleId) : undefined}
            isManualQuote={isManualQuote}
            onSubmit={handleCreateQuote}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <QuoteDetailsDialog
        quote={selectedQuote}
        vehicle={selectedVehicle}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onStatusChange={handleUpdateStatus}
      />
      
      {/* Reject Dialog */}
      <QuoteRejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectQuote}
        onCancel={() => setRejectDialogOpen(false)}
      />

      {/* Delete Dialog */}
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
