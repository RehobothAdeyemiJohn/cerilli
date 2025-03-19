
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import QuotesHeader from '@/components/quotes/QuotesHeader';
import QuotesFilters from '@/components/quotes/QuotesFilters';
import QuotesTable from '@/components/quotes/QuotesTable';
import QuotesPagination from '@/components/quotes/QuotesPagination';
import { useComprehensiveQuotesData } from '@/hooks/useComprehensiveQuotesData';
import { Quote } from '@/types';
import { 
  QuoteDetailsDialogAdapter,
  QuoteRejectDialogAdapter,
  QuoteDeleteDialogAdapter,
  QuoteFormAdapter,
  QuoteContractDialogAdapter,
} from '@/components/quotes/QuotesDialogAdapters';
import { QuotesHeaderAdapter } from '@/components/quotes/QuotesHeaderAdapter';
import { QuotesPaginationAdapter } from '@/components/quotes/QuotesPaginationAdapter';

const Quotes = () => {
  const { user, isAdmin } = useAuth();
  const dealerId = user?.dealerId;

  // State for filters and pagination
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterDealer, setFilterDealer] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dialog states
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isManualQuote, setIsManualQuote] = useState(false);

  // Get quotes data from our hook
  const {
    quotes,
    isLoading,
    error,
    refetch,
    statusCounts,
    createQuote,
    deleteQuote,
    updateQuoteStatus,
    isDeleting,
    createContract,
    isContractSubmitting
  } = useComprehensiveQuotesData(
    dealerId, 
    {
      status: activeTab !== 'all' ? activeTab : undefined,
      dealerId: filterDealer || undefined,
      searchText: searchText || undefined,
      date: filterDate,
      sortBy: sortOption,
      limit: itemsPerPage,
      page: currentPage
    }
  );

  // Calculate total pages
  const totalItems = activeTab === 'all' 
    ? statusCounts.total 
    : statusCounts[activeTab] || 0;
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle page navigation
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

  // Open quote detail dialog
  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsViewDialogOpen(true);
  };

  // Open quote form dialog
  const handleAddCustomQuote = () => {
    setIsManualQuote(true);
    setSelectedVehicleId(null);
    setIsFormDialogOpen(true);
  };

  // Handle creating a new quote
  const handleCreateQuote = async (quoteData: any) => {
    await createQuote(quoteData);
    setIsFormDialogOpen(false);
    refetch();
  };

  // Handle quote status update
  const handleUpdateStatus = async (quoteId: string, status: string) => {
    await updateQuoteStatus(quoteId, status);
    setIsViewDialogOpen(false);
  };

  // Prepare rejection
  const handlePrepareReject = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsRejectDialogOpen(true);
  };

  // Handle quote rejection
  const handleRejectQuote = async (reason: string) => {
    if (selectedQuote) {
      await updateQuoteStatus(selectedQuote.id, 'rejected', reason);
      setIsRejectDialogOpen(false);
      refetch();
    }
  };

  // Prepare deletion
  const handlePrepareDelete = (id: string) => {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      setSelectedQuote(quote);
      setIsDeleteDialogOpen(true);
    }
  };

  // Handle quote deletion
  const handleDeleteQuote = async () => {
    if (selectedQuote) {
      await deleteQuote(selectedQuote.id);
      setIsDeleteDialogOpen(false);
      refetch();
    }
  };

  // Prepare contract creation
  const handlePrepareContract = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsContractDialogOpen(true);
  };

  // Handle contract creation
  const handleCreateContract = async () => {
    if (selectedQuote) {
      await createContract(selectedQuote);
      setIsContractDialogOpen(false);
      setIsViewDialogOpen(false);
      refetch();
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText, filterDate, filterDealer, sortOption, itemsPerPage]);

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>Si è verificato un errore: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <QuotesHeaderAdapter 
        onAddCustomQuote={handleAddCustomQuote}
      />
      
      <div className="mt-6">
        <QuotesFilters 
          activeStatus={activeTab}
          onStatusChange={setActiveTab}
          selectedDealer={filterDealer}
          onDealerChange={setFilterDealer}
          searchText={searchText}
          onSearchChange={setSearchText}
          date={filterDate}
          onDateChange={setFilterDate}
          sortOption={sortOption}
          onSortChange={setSortOption}
          counts={statusCounts}
        />
        
        <QuotesTable 
          quotes={quotes}
          getVehicleById={(id) => null} // Providing required props
          getDealerName={(id) => ""}    // Providing required props
          getShortId={(id) => id.substring(0, 8)} // Providing required props
          getStatusBadgeClass={(status) => ""} // Providing required props
          formatDate={(date) => new Date(date).toLocaleDateString()} // Providing required props
          handleViewQuote={handleViewQuote}
          handleUpdateStatus={handleUpdateStatus}
          handleDeleteClick={handlePrepareDelete}
        />
        
        {!isLoading && quotes.length > 0 && (
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
        )}
      </div>
      
      <QuoteDetailsDialogAdapter
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        quote={selectedQuote || {} as Quote}
        onUpdateStatus={handleUpdateStatus}
        onConvertToContract={handlePrepareContract}
      />
      
      <QuoteRejectDialogAdapter
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={handleRejectQuote}
      />
      
      <QuoteDeleteDialogAdapter
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteQuote}
        isPending={isDeleting}
      />
      
      <QuoteFormAdapter
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        vehicleId={selectedVehicleId || ''}
        isManualQuote={isManualQuote}
        onCreateQuote={handleCreateQuote}
      />
      
      <QuoteContractDialogAdapter
        open={isContractDialogOpen}
        onOpenChange={setIsContractDialogOpen}
        quote={selectedQuote || {} as Quote}
        onCreateContract={handleCreateContract}
        isSubmitting={isContractSubmitting}
      />
    </div>
  );
};

export default Quotes;
