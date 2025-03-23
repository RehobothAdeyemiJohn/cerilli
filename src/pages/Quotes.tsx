import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from "react-router-dom"
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
  QuoteCreateFormAdapter,
  QuoteContractDialogAdapter,
} from '@/components/quotes/QuotesDialogAdapters';
import { QuotesHeaderAdapter } from '@/components/quotes/QuotesHeaderAdapter';
import { QuotesPaginationAdapter } from '@/components/quotes/QuotesPaginationAdapter';

const Quotes = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dealerId = user?.dealerId;

  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterDealer, setFilterDealer] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isManualQuote, setIsManualQuote] = useState(false);

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

  const totalItems = activeTab === 'all'
    ? statusCounts.total
    : statusCounts[activeTab] || 0;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsViewDialogOpen(true);
  };

  const handleAddCustomQuote = () => {
    setIsManualQuote(true);
    setSelectedVehicleId(null);
    setIsFormDialogOpen(true);
  };

  const handleCreateQuote = async (quoteData: any) => {
    await createQuote(quoteData);
    setIsFormDialogOpen(false);
    refetch();
  };

  const handleUpdateStatus = async (quoteId: string, status: string) => {
    await updateQuoteStatus(quoteId, status);
    setIsViewDialogOpen(false);
  };

  const handlePrepareReject = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsRejectDialogOpen(true);
  };

  const handleRejectQuote = async (reason: string) => {
    if (selectedQuote) {
      await updateQuoteStatus(selectedQuote.id, 'rejected', reason);
      setIsRejectDialogOpen(false);
      refetch();
    }
  };

  const handlePrepareDelete = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteQuote = async () => {
    if (selectedQuote) {
      await deleteQuote(selectedQuote.id);
      setIsDeleteDialogOpen(false);
      refetch();
    }
  };

  const handlePrepareContract = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsContractDialogOpen(true);
  };

  const handleCreateContract = async () => {
    if (selectedQuote) {
      await createContract(selectedQuote);
      setIsContractDialogOpen(false);
      setIsViewDialogOpen(false);
      refetch();
    }
  };

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
          getVehicleById={(id) => null}
          getDealerName={(id) => ""}
          getShortId={(id) => id.substring(0, 8)}
          getStatusBadgeClass={(status) => ""}
          formatDate={(date) => new Date(date).toLocaleDateString()}
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
        onOpenChange={
          (e) => {
            if(!e){
              navigate(location.pathname)
            }
            setIsViewDialogOpen(e)
          }
        }
        quote={selectedQuote || {} as Quote}
        onUpdateStatus={handleUpdateStatus}
        onConvertToContract={handlePrepareContract}
      />

      <QuoteRejectDialogAdapter
        open={isRejectDialogOpen}
        onOpenChange={(e) => {
          if(!e){
            navigate(location.pathname)
          }
          setIsRejectDialogOpen(e)
        }
        }
        onConfirm={handleRejectQuote}
      />

      <QuoteDeleteDialogAdapter
        open={isDeleteDialogOpen}
        onOpenChange={(e) => {
          if(!e){
            navigate(location.pathname)
          }
          setIsDeleteDialogOpen(e)
        }}
        onConfirm={handleDeleteQuote}
        isPending={isDeleting}
      />

      <QuoteCreateFormAdapter
        open={isFormDialogOpen}
        onOpenChange={(e) => {
          if(!e){
            navigate(location.pathname)
          }
          setIsFormDialogOpen(e)
        }}
        vehicleId={selectedVehicleId || ''}
        isManualQuote={isManualQuote}
        onCreateQuote={handleCreateQuote}
      />

      <QuoteContractDialogAdapter
        open={isContractDialogOpen}
        onOpenChange={(e) => {
          if(!e){
            navigate(location.pathname)
          }
          setIsContractDialogOpen(e)
        }}
        quote={selectedQuote || {} as Quote}
        onCreateContract={handleCreateContract}
        isSubmitting={isContractSubmitting}
      />
    </div>
  );
};

export default Quotes;
