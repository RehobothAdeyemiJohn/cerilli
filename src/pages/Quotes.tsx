
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QuoteForm from '@/components/quotes/QuoteForm';
import QuoteDetailsDialog from '@/components/quotes/QuoteDetailsDialog';
import QuoteRejectDialog from '@/components/quotes/QuoteRejectDialog';
import QuoteDeleteDialog from '@/components/quotes/QuoteDeleteDialog';

// Import our new components
import QuotesHeader from '@/components/quotes/QuotesHeader';
import QuotesFilters from '@/components/quotes/QuotesFilters';
import QuotesTabs from '@/components/quotes/QuotesTabs';
import QuotesPagination from '@/components/quotes/QuotesPagination';
import { useQuotesData } from '@/hooks/useQuotesData';

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
    handleNextPage
  } = useQuotesData();
  
  // Handle navigation from other pages (e.g., vehicle inventory)
  useEffect(() => {
    if (location.state?.fromInventory) {
      const vehicleId = location.state.vehicleId;
      if (vehicleId) {
        setSelectedVehicleId(vehicleId);
        setCreateDialogOpen(true);
      }
    }
  }, [location, setSelectedVehicleId, setCreateDialogOpen]);
  
  if (isLoading) {
    return <div className="container mx-auto py-6 px-4">Caricamento in corso...</div>;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header with Create Quote button */}
      <QuotesHeader 
        setSelectedVehicleId={setSelectedVehicleId}
        setCreateDialogOpen={setCreateDialogOpen}
        vehicles={vehicles}
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
        statusCounts={statusCounts}
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
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Preventivo</DialogTitle>
          </DialogHeader>
          
          {selectedVehicleId && (
            <QuoteForm 
              vehicle={getVehicleById(selectedVehicleId)}
              onSubmit={handleCreateQuote}
              onCancel={() => setCreateDialogOpen(false)}
            />
          )}
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
