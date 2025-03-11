
import React from 'react';
import { Quote } from '@/types';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import QuoteStatusBadge from './QuoteStatusBadge';

interface QuoteDetailsHeaderProps {
  quote: Quote;
}

const QuoteDetailsHeader = ({ quote }: QuoteDetailsHeaderProps) => {
  // Generate a shorter ID for display (first 6 characters)
  const shortId = quote.id.substring(0, 6).toUpperCase();

  return (
    <>
      <DialogTitle className="flex items-center gap-3">
        <span>Preventivo #{shortId}</span>
        <QuoteStatusBadge status={quote.status} />
      </DialogTitle>
      <DialogDescription className="mt-1 mb-4 flex justify-between">
        <span>
          Cliente: <strong>{quote.customerName}</strong>
        </span>
        <span>
          Prezzo: <strong>{formatCurrency(quote.finalPrice)}</strong>
        </span>
      </DialogDescription>
    </>
  );
};

export default QuoteDetailsHeader;
