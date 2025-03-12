
import React from 'react';
import { Vehicle } from '@/types';
import QuoteForm from '@/components/quotes/QuoteForm';
import ReserveVehicleForm from '../ReserveVehicleForm';
import ReserveVirtualVehicleForm from '../ReserveVirtualVehicleForm';
import VehicleDetailsContent from './VehicleDetailsContent';
import CancelReservationForm from '../CancelReservationForm';

interface VehicleDialogContentProps {
  vehicle: Vehicle;
  showQuoteForm: boolean;
  showReserveForm: boolean;
  showVirtualReserveForm: boolean;
  showCancelReservationForm: boolean;
  isSubmitting: boolean;
  onCreateQuote: () => void;
  onQuoteSubmit: (quoteData: any) => void;
  onQuoteCancel: () => void;
  onReserveVehicle: () => void;
  onReserveVirtualVehicle: () => void;
  onCancelReservationShow: () => void;
  onCancelReservationSubmit: (data?: { cancellationReason: string }) => void;
  onCancelReservationCancel: () => void;
  onReservationCancel: () => void;
  onReservationComplete: () => void;
  onTransformToOrder: () => void;
  userCanCreateQuotes: boolean;
}

const VehicleDialogContent = ({
  vehicle,
  showQuoteForm,
  showReserveForm,
  showVirtualReserveForm,
  showCancelReservationForm,
  isSubmitting,
  onCreateQuote,
  onQuoteSubmit,
  onQuoteCancel,
  onReserveVehicle,
  onReserveVirtualVehicle,
  onCancelReservationShow,
  onCancelReservationSubmit,
  onCancelReservationCancel,
  onReservationCancel,
  onReservationComplete,
  onTransformToOrder,
  userCanCreateQuotes
}: VehicleDialogContentProps) => {
  
  if (showQuoteForm) {
    return (
      <QuoteForm 
        vehicle={vehicle}
        onSubmit={onQuoteSubmit}
        onCancel={onQuoteCancel}
        isSubmitting={isSubmitting}
      />
    );
  } 
  
  if (showReserveForm) {
    return (
      <ReserveVehicleForm 
        vehicle={vehicle}
        onCancel={onReservationCancel}
        onReservationComplete={onReservationComplete}
      />
    );
  } 
  
  if (showVirtualReserveForm) {
    return (
      <ReserveVirtualVehicleForm
        vehicle={vehicle}
        onCancel={onReservationCancel}
        onReservationComplete={onReservationComplete}
      />
    );
  }
  
  if (showCancelReservationForm) {
    return (
      <CancelReservationForm
        vehicle={vehicle}
        onSubmit={onCancelReservationSubmit}
        onCancel={onCancelReservationCancel}
        isSubmitting={isSubmitting}
      />
    );
  }
  
  return (
    <VehicleDetailsContent 
      vehicle={vehicle}
      onCreateQuote={onCreateQuote}
      onReserveVehicle={onReserveVehicle}
      onReserveVirtualVehicle={onReserveVirtualVehicle}
      onCancelReservation={onCancelReservationShow}
      onTransformToOrder={onTransformToOrder}
      userCanCreateQuotes={userCanCreateQuotes}
    />
  );
};

export default VehicleDialogContent;
