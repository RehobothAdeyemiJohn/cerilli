
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuotesTable from './QuotesTable';
import { Quote } from '@/types';

interface QuotesTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  statusCounts: { all: number; pending: number; converted: number; rejected: number };
  filteredQuotes: Quote[];
  getVehicleById: (id: string) => any;
  getDealerName: (id: string) => string;
  getShortId: (id: string) => string;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (date: string) => string;
  handleViewQuote: (quote: Quote) => void;
  handleUpdateStatus: (id: string, status: Quote['status']) => void;
  handleDeleteClick: (quote: Quote) => void;
  handleEditQuote?: (quote: Quote) => void;
}

const QuotesTabs: React.FC<QuotesTabsProps> = ({
  activeTab,
  setActiveTab,
  statusCounts,
  filteredQuotes,
  getVehicleById,
  getDealerName,
  getShortId,
  getStatusBadgeClass,
  formatDate,
  handleViewQuote,
  handleUpdateStatus,
  handleDeleteClick,
  handleEditQuote
}) => {
  const renderQuoteTable = () => (
    <QuotesTable
      quotes={filteredQuotes}
      getVehicleById={getVehicleById}
      getDealerName={getDealerName}
      getShortId={getShortId}
      getStatusBadgeClass={getStatusBadgeClass}
      formatDate={formatDate}
      handleViewQuote={handleViewQuote}
      handleUpdateStatus={handleUpdateStatus}
      handleDeleteClick={handleDeleteClick}
      handleEditQuote={handleEditQuote}
    />
  );

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="pending">In Attesa ({statusCounts.pending})</TabsTrigger>
        <TabsTrigger value="converted">Convertiti ({statusCounts.converted})</TabsTrigger>
        <TabsTrigger value="rejected">Rifiutati ({statusCounts.rejected})</TabsTrigger>
        <TabsTrigger value="all">Tutti ({statusCounts.all})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending">
        {renderQuoteTable()}
      </TabsContent>
      
      <TabsContent value="converted">
        {renderQuoteTable()}
      </TabsContent>
      
      <TabsContent value="rejected">
        {renderQuoteTable()}
      </TabsContent>
      
      <TabsContent value="all">
        {renderQuoteTable()}
      </TabsContent>
    </Tabs>
  );
};

export default QuotesTabs;
