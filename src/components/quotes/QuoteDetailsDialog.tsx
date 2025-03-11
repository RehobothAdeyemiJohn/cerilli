
import React from 'react';
import { 
  Dialog, 
  DialogContent 
} from '@/components/ui/dialog';
import { Quote, Vehicle } from '@/types';
import { formatCurrency } from '@/lib/utils';
import QuoteDetailsHeader from './QuoteDetailsHeader';
import QuoteVehicleInfo from './QuoteVehicleInfo';
import QuoteCustomerInfo from './QuoteCustomerInfo';
import QuoteTradeInDetails from './QuoteTradeInDetails';
import QuoteRejectionReason from './QuoteRejectionReason';
import QuoteActionsFooter from './QuoteActionsFooter';
import QuotePrintSection from './QuotePrintSection';

interface QuoteDetailsDialogProps {
  quote: Quote | null;
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: Quote['status']) => void;
}

const QuoteDetailsDialog = ({ quote, vehicle, open, onOpenChange, onStatusChange }: QuoteDetailsDialogProps) => {
  if (!quote || !vehicle) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <QuoteDetailsHeader quote={quote} />
        
        <QuotePrintSection quote={quote} vehicle={vehicle} />

        <div className="mt-2 space-y-3 text-sm">
          <QuoteVehicleInfo quote={quote} vehicle={vehicle} />
          <QuoteCustomerInfo quote={quote} />
          
          {quote.hasTradeIn && (
            <QuoteTradeInDetails quote={quote} />
          )}
          
          {quote.status === 'rejected' && quote.rejectionReason && (
            <QuoteRejectionReason reason={quote.rejectionReason} />
          )}
        </div>
        
        <QuoteActionsFooter 
          quote={quote} 
          onStatusChange={onStatusChange} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsDialog;
