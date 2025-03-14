
import React from 'react';
import { Vehicle } from '@/types';
import VehicleDetailsContent from './VehicleDetailsContent';
import QuoteForm from '@/components/quotes/QuoteForm';
import ReserveVehicleForm from '../ReserveVehicleForm';
import ReserveVirtualVehicleForm from '../ReserveVirtualVehicleForm';
import CancelReservationForm from '../CancelReservationForm';

interface VehicleDialogContentProps {
  vehicle: Vehicle | null;
  onOpenChange?: (open: boolean) => void;
  showQuoteForm?: boolean;
  showReserveForm?: boolean;
  showVirtualReserveForm?: boolean;
  showCancelReservationForm?: boolean;
  isSubmitting?: boolean;
  onCreateQuote?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  onConfirm?: () => Promise<void>;
  userCanReserveVehicles?: boolean;
  userCanCreateQuotes?: boolean;
}

const VehicleDialogContent: React.FC<VehicleDialogContentProps> = ({ 
  vehicle, 
  onOpenChange,
  showQuoteForm,
  showReserveForm,
  showVirtualReserveForm,
  showCancelReservationForm,
  isSubmitting,
  onCreateQuote,
  onCancel,
  onSubmit,
  onConfirm,
  userCanReserveVehicles,
  userCanCreateQuotes
}) => {
  if (!vehicle) {
    return null;
  }

  return (
    <>
      <VehicleDetailsContent vehicle={vehicle} />
      
      {showQuoteForm && vehicle && (
        <QuoteForm 
          vehicle={vehicle} 
          onSubmit={onCreateQuote}
          onCancel={onCancel}
        />
      )}
      
      {showReserveForm && vehicle && (
        <ReserveVehicleForm 
          vehicle={vehicle}
          onReservationComplete={onSubmit}
          onCancel={onCancel}
        />
      )}
      
      {showVirtualReserveForm && vehicle && (
        <ReserveVirtualVehicleForm 
          vehicle={vehicle}
          onReservationComplete={onSubmit}
          onCancel={onCancel}
        />
      )}
      
      {showCancelReservationForm && vehicle && (
        <CancelReservationForm 
          vehicle={vehicle}
          onCancel={onCancel}
          onConfirm={onConfirm}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default VehicleDialogContent;
