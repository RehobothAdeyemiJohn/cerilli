
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import QuoteForm from './QuoteForm';

interface QuoteFormAdapterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId?: string;
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
  const location = useLocation();
  
  // Check if we have a vehicle ID from navigation state
  useEffect(() => {
    const state = location.state as { fromInventory?: boolean; vehicleId?: string } | null;
    if (state?.fromInventory && state?.vehicleId && !open) {
      console.log('Opening quote form from inventory with vehicle ID:', state.vehicleId);
      onOpenChange(true);
    }
  }, [location.state, onOpenChange, open]);
  
  // Get vehicle ID from either props or location state
  const effectiveVehicleId = vehicleId || 
    ((location.state as { vehicleId?: string } | null)?.vehicleId);
  
  console.log('QuoteFormAdapter rendering with vehicleId:', effectiveVehicleId);
  
  return (
    <QuoteForm
      vehicle={effectiveVehicleId ? { id: effectiveVehicleId } as any : undefined}
      isManualQuote={isManualQuote}
      onSubmit={onCreateQuote}
      onCancel={() => onOpenChange(false)}
    />
  );
};

export default QuoteFormAdapter;
