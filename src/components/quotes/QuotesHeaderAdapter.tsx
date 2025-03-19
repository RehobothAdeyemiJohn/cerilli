
import React from 'react';
import QuotesHeader from './QuotesHeader';

interface QuotesHeaderAdapterProps {
  onAddCustomQuote: () => void;
}

export const QuotesHeaderAdapter: React.FC<QuotesHeaderAdapterProps> = ({
  onAddCustomQuote
}) => {
  return (
    <QuotesHeader
      handleOpenCreateQuoteDialog={onAddCustomQuote}
    />
  );
};
