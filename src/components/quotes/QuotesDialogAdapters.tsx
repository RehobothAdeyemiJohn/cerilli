
import React from 'react';
import { Quote } from '@/types';
import QuoteDetailsDialog from './QuoteDetailsDialog';
import QuoteRejectDialog from './QuoteRejectDialog';
import QuoteDeleteDialog from './QuoteDeleteDialog';
import QuoteForm from './QuoteForm';
import QuoteContractDialog from './QuoteContractDialog';

interface QuoteDetailsDialogAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  onUpdateStatus: (quoteId: string, status: string) => void;
  onConvertToContract: (quote: Quote) => void;
}

export const QuoteDetailsDialogAdapter: React.FC<QuoteDetailsDialogAdapterProps> = ({
  open,
  onOpenChange,
  quote,
  onUpdateStatus,
  onConvertToContract
}) => {
  return (
    <QuoteDetailsDialog
      open={open}
      onOpenChange={onOpenChange}
      quote={quote}
      onUpdateStatus={onUpdateStatus}
      onConvertToContract={onConvertToContract}
    />
  );
};

interface QuoteRejectDialogAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export const QuoteRejectDialogAdapter: React.FC<QuoteRejectDialogAdapterProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  return (
    <QuoteRejectDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      onCancel={() => onOpenChange(false)}
    />
  );
};

interface QuoteDeleteDialogAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const QuoteDeleteDialogAdapter: React.FC<QuoteDeleteDialogAdapterProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isPending
}) => {
  return (
    <QuoteDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
};

interface QuoteFormAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  isManualQuote: boolean;
  onCreateQuote: (quoteData: any) => void;
}

export const QuoteFormAdapter: React.FC<QuoteFormAdapterProps> = ({
  open,
  onOpenChange,
  vehicleId,
  isManualQuote,
  onCreateQuote
}) => {
  return (
    <QuoteForm
      open={open}
      onOpenChange={onOpenChange}
      vehicleId={vehicleId}
      isManualQuote={isManualQuote}
      onCreateQuote={onCreateQuote}
    />
  );
};

interface QuoteContractDialogAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  onCreateContract: () => void;
  isSubmitting: boolean;
}

export const QuoteContractDialogAdapter: React.FC<QuoteContractDialogAdapterProps> = ({
  open,
  onOpenChange,
  quote,
  onCreateContract,
  isSubmitting
}) => {
  return (
    <QuoteContractDialog
      open={open}
      onOpenChange={onOpenChange}
      quote={quote}
      onCreateContract={onCreateContract}
      isSubmitting={isSubmitting}
    />
  );
};
