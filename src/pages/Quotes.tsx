
import React from 'react';
import { useComprehensiveQuotesData } from '@/hooks/useComprehensiveQuotesData';
import QuotesHeader from '@/components/quotes/QuotesHeader';
import QuotesFilters from '@/components/quotes/QuotesFilters';
import QuotesTabs from '@/components/quotes/QuotesTabs';
import QuotesPagination from '@/components/quotes/QuotesPagination';
import QuoteDetailsDialog from '@/components/quotes/QuoteDetailsDialog';
import QuoteRejectDialog from '@/components/quotes/QuoteRejectDialog';
import QuoteDeleteDialog from '@/components/quotes/QuoteDeleteDialog';
import QuoteForm from '@/components/quotes/QuoteForm';
import QuoteContractDialog from '@/components/quotes/QuoteContractDialog';
import { useAuth } from '@/context/AuthContext';
import { Helmet } from 'react-helmet';
import { Quote } from '@/types';

const Quotes = () => {
  // Use our comprehensive quotes data hook
  const quotesData = useComprehensiveQuotesData();
  
  // Destructure all the properties and methods we need
  const {
    quotes,
    isLoading,
    error,
    
    // UI state
    activeTab,
    setActiveTab,
    filterDealer,
    setFilterDealer,
    filterModel,
    setFilterModel,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
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
    
    // Derived data
    selectedVehicle,
    isManualQuote,
    setIsManualQuote,
    
    // Computed values
    filteredQuotes,
    vehicles,
    dealers,
    models,
    statusCounts,
    totalPages,
    paginatedQuotes,
    
    // Helper functions
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
    handleOpenCreateQuoteDialog,
    handleConvertToContract,
    handleUpdateQuote,
    
    // Other
    selectedQuote,
    isDeleteDialogOpen,
    isContractDialogOpen,
    setIsContractDialogOpen,
    isContractSubmitting,
    handleCloseContractDialog,
    handleCreateContract
  } = quotesData;
  
  // Get user role for permission checks
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  
  // Handle custom quote click
  const handleAddCustomQuoteClick = () => {
    handleOpenCreateQuoteDialog('', true);
  };
  
  // Modified delete handler for the QuotesTable component
  const handleQuoteDelete = (quote: Quote) => {
    handleDeleteClick(quote);
  };
  
  return (
    <>
      <Helmet>
        <title>Preventivi - Cirelli Motor Company</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with title and actions */}
        <QuotesHeader 
          onAddCustomQuote={handleAddCustomQuoteClick}
        />
        
        {/* Filters section */}
        <QuotesFilters 
          dealers={dealers}
          models={models}
          filterDealer={filterDealer}
          setFilterDealer={setFilterDealer}
          filterModel={filterModel}
          setFilterModel={setFilterModel}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {/* Tabs and table */}
        <QuotesTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusCounts={statusCounts}
          filteredQuotes={paginatedQuotes}
          getVehicleById={getVehicleById}
          getDealerName={getDealerName}
          getShortId={getShortId}
          getStatusBadgeClass={getStatusBadgeClass}
          formatDate={formatDate}
          handleViewQuote={handleViewQuote}
          handleUpdateStatus={handleUpdateStatus}
          handleDeleteClick={handleQuoteDelete}
        />
        
        {/* Pagination */}
        {filteredQuotes.length > itemsPerPage && (
          <QuotesPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        )}
        
        {/* View quote dialog */}
        <QuoteDetailsDialog 
          isOpen={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          quote={selectedQuote}
          onUpdateStatus={handleUpdateStatus}
          onConvertToContract={handleConvertToContract}
        />
        
        {/* Reject quote dialog */}
        <QuoteRejectDialog 
          isOpen={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          onConfirm={handleRejectQuote}
        />
        
        {/* Delete quote dialog */}
        <QuoteDeleteDialog 
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteQuote}
          isPending={isLoading}
        />
        
        {/* Create quote dialog */}
        <QuoteForm 
          isOpen={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          vehicleId={selectedVehicleId}
          isManualQuote={isManualQuote}
          onCreateQuote={handleCreateQuote}
        />
        
        {/* Contract creation dialog */}
        <QuoteContractDialog 
          isOpen={isContractDialogOpen}
          onClose={handleCloseContractDialog}
          quote={selectedQuote}
          onCreateContract={handleCreateContract}
          isSubmitting={isContractSubmitting}
        />
      </div>
    </>
  );
};

export default Quotes;
