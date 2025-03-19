
import React from 'react';
import { Quote } from '@/types';
import QuoteDetailsDialog from './QuoteDetailsDialog';
import QuoteRejectDialog from './QuoteRejectDialog';
import QuoteDeleteDialog from './QuoteDeleteDialog';
import QuoteForm from './QuoteForm';
import QuoteContractDialog from './QuoteContractDialog';

interface QuoteDetailsDialogAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  onUpdateStatus: (quoteId: string, status: string) => void;
  onConvertToContract: (quote: Quote) => void;
}

export const QuoteDetailsDialogAdapter: React.FC<QuoteDetailsDialogAdapterProps> = ({
  isOpen,
  onClose,
  quote,
  onUpdateStatus,
  onConvertToContract
}) => {
  return (
    <QuoteDetailsDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      quote={quote}
      onUpdateStatus={onUpdateStatus}
      onConvertToContract={onConvertToContract}
    />
  );
};

interface QuoteRejectDialogAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const QuoteRejectDialogAdapter: React.FC<QuoteRejectDialogAdapterProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <QuoteRejectDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={onConfirm}
    />
  );
};

interface QuoteDeleteDialogAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const QuoteDeleteDialogAdapter: React.FC<QuoteDeleteDialogAdapterProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending
}) => {
  return (
    <QuoteDeleteDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
};

interface QuoteFormAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  isManualQuote: boolean;
  onCreateQuote: (quoteData: any) => void;
}

export const QuoteFormAdapter: React.FC<QuoteFormAdapterProps> = ({
  isOpen,
  onClose,
  vehicleId,
  isManualQuote,
  onCreateQuote
}) => {
  return (
    <QuoteForm
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      vehicleId={vehicleId}
      isManualQuote={isManualQuote}
      onCreateQuote={onCreateQuote}
    />
  );
};

interface QuoteContractDialogAdapterProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  onCreateContract: () => void;
  isSubmitting: boolean;
}

export const QuoteContractDialogAdapter: React.FC<QuoteContractDialogAdapterProps> = ({
  isOpen,
  onClose,
  quote,
  onCreateContract,
  isSubmitting
}) => {
  return (
    <QuoteContractDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      quote={quote}
      onCreateContract={onCreateContract}
      isSubmitting={isSubmitting}
    />
  );
};
