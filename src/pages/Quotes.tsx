
import React from 'react';
import { useComprehensiveQuotesData } from '@/hooks/useComprehensiveQuotesData';
import { QuotesHeaderAdapter } from '@/components/quotes/QuotesHeaderAdapter';
import QuotesFilters from '@/components/quotes/QuotesFilters';
import QuotesTable from '@/components/quotes/QuotesTable';
import { QuotesPaginationAdapter } from '@/components/quotes/QuotesPaginationAdapter';
import { 
  QuoteDetailsDialogAdapter, 
  QuoteRejectDialogAdapter, 
  QuoteDeleteDialogAdapter, 
  QuoteFormAdapter, 
  QuoteContractDialogAdapter 
} from '@/components/quotes/QuotesDialogAdapters';

const Quotes = () => {
  const quotesData = useComprehensiveQuotesData();
  
  const {
    // Pagination
    currentPage,
    totalPages,
    paginatedQuotes,
    itemsPerPage,
    setItemsPerPage,
    
    // Filters
    activeTab,
    setActiveTab,
    filterDealer,
    setFilterDealer,
    filterModel,
    setFilterModel,
    searchQuery,
    setSearchQuery,
    
    // Reference data
    dealers,
    statusCounts,
    
    // Selected and state
    selectedQuote,
    selectedVehicleId,
    isManualQuote,
    
    // Dialog controls
    viewDialogOpen,
    setViewDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    createDialogOpen,
    setCreateDialogOpen,
    contractDialogOpen,
    setContractDialogOpen,
    
    // Helper functions
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
    handleOpenCreateQuoteDialog,
    handleConvertToContract,
    
    // Mutation states
    isDeletePending,
    isContractSubmitting,
    
    // User info
    isAdmin
  } = quotesData;
  
  if (quotesData.isLoading) {
    return <div>Loading quotes...</div>;
  }
  
  if (quotesData.error) {
    return <div>Error: {quotesData.error.message}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 bg-white rounded-lg">
      <QuotesHeaderAdapter onAddCustomQuote={handleOpenCreateQuoteDialog} />
      
      <div className="mb-6">
        <QuotesFilters 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filterDealer={filterDealer}
          setFilterDealer={setFilterDealer}
          filterModel={filterModel}
          setFilterModel={setFilterModel}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dealers={dealers}
          models={quotesData.models}
          statusCounts={statusCounts}
        />
      </div>
      
      <div className="overflow-x-auto">
        <QuotesTable 
          quotes={paginatedQuotes}
          onViewQuote={handleViewQuote}
          onDeleteQuote={handleDeleteClick}
          onUpdateStatus={handleUpdateStatus}
          onConvertToContract={handleConvertToContract}
          getDealerName={getDealerName}
          getShortId={getShortId}
          formatDate={formatDate}
          getStatusBadgeClass={getStatusBadgeClass}
          isAdmin={isAdmin}
        />
      </div>
      
      <div className="mt-4">
        <QuotesPaginationAdapter
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
      
      {/* Dialog components */}
      {selectedQuote && (
        <QuoteDetailsDialogAdapter
          isOpen={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          quote={selectedQuote}
          onUpdateStatus={handleUpdateStatus}
          onConvertToContract={handleConvertToContract}
        />
      )}
      
      <QuoteRejectDialogAdapter
        isOpen={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleRejectQuote}
      />
      
      <QuoteDeleteDialogAdapter
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteQuote}
        isPending={isDeletePending}
      />
      
      <QuoteFormAdapter
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        vehicleId={selectedVehicleId}
        isManualQuote={isManualQuote}
        onCreateQuote={handleCreateQuote}
      />
      
      {selectedQuote && (
        <QuoteContractDialogAdapter
          isOpen={contractDialogOpen}
          onClose={() => setContractDialogOpen(false)}
          quote={selectedQuote}
          onCreateContract={() => handleConvertToContract(selectedQuote)}
          isSubmitting={isContractSubmitting}
        />
      )}
    </div>
  );
};

export default Quotes;
