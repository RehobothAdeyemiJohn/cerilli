
import React from 'react';
import { Vehicle } from '@/types';
import QuoteForm from '@/components/quotes/QuoteForm';
import ReserveVehicleForm from '../ReserveVehicleForm';
import ReserveVirtualVehicleForm from '../ReserveVirtualVehicleForm';
import VehicleDetailsContent from './VehicleDetailsContent';

interface VehicleDialogContentProps {
  vehicle: Vehicle;
  showQuoteForm: boolean;
  showReserveForm: boolean;
  showVirtualReserveForm: boolean;
  isSubmitting: boolean;
  onCreateQuote: () => void;
  onQuoteSubmit: (quoteData: any) => void;
  onQuoteCancel: () => void;
  onReserveVehicle: () => void;
  onReserveVirtualVehicle: () => void;
  onReservationCancel: () => void;
  onReservationComplete: () => void;
}

const VehicleDialogContent = ({
  vehicle,
  showQuoteForm,
  showReserveForm,
  showVirtualReserveForm,
  isSubmitting,
  onCreateQuote,
  onQuoteSubmit,
  onQuoteCancel,
  onReserveVehicle,
  onReserveVirtualVehicle,
  onReservationCancel,
  onReservationComplete
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
  
  return (
    <VehicleDetailsContent 
      vehicle={vehicle}
      onCreateQuote={onCreateQuote}
      onReserveVehicle={onReserveVehicle}
      onReserveVirtualVehicle={onReserveVirtualVehicle}
    />
  );
};

export default VehicleDialogContent;
