
import React, {useState,useEffect} from 'react';
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
const useGetVehicleById=(id)=>{
  const [vehicle,setVehicle]=useState({})
  useEffect(()=>{
  const getData=async()=>{
    const data=await vehiclesApi.getById(id)
    setVehicle(data)
  }
  getData()
  },[id])

  return vehicle
}

interface QuoteDetailsDialogProps {
  quote: Quote | null;
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: Quote['status']) => void;
  onConvert?: () => void;
  onEdit?: (quote: Quote) => void;
}

const QuoteDetailsDialog = ({ 
  quote, 
  vehicle: vehic, 
  open, 
  onOpenChange, 
  onStatusChange, 
  onConvert,
  onEdit
}: QuoteDetailsDialogProps) => {
  const vehicle = useGetVehicleById(quote.vehicleId);
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
          onConvert={onConvert}
          onEdit={onEdit ? () => onEdit(quote) : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuoteDetailsDialog;
