
import React, { useEffect } from 'react';
import { Vehicle } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
} from '@/components/ui/dialog';
import { useVehicleDetailsDialog } from './details/useVehicleDetailsDialog';
import VehicleDialogHeader from './details/VehicleDialogHeader';
import VehicleDialogContent from './details/VehicleDialogContent';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VehicleDetailsDialog = ({ vehicle, open, onOpenChange }: VehicleDetailsDialogProps) => {
  const {
    showQuoteForm,
    showReserveForm,
    showVirtualReserveForm,
    showCancelReservationForm,
    isSubmitting,
    user,
    handleShowQuoteForm,
    handleCreateQuote,
    handleCancelQuote,
    handleReserveVehicle,
    handleReserveVirtualVehicle,
    handleCancelReservation,
    handleShowCancelReservationForm,
    handleCancelReservationSubmit,
    handleTransformToOrder
  } = useVehicleDetailsDialog(vehicle, onOpenChange);
  
  if (!vehicle) return null;
  
  // Now all users can create quotes
  const userCanCreateQuotes = true;
  
  console.log('Rendering VehicleDetailsDialog for vehicle:', vehicle.id);
  console.log('Vehicle status:', vehicle.status);
  console.log('Reservation timestamp:', vehicle.reservationTimestamp);
  
  return (
    <Dialog open={open} onOpenChange={(value) => {
      console.log('Dialog onOpenChange called with value:', value);
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <VehicleDialogHeader vehicle={vehicle} />
        </DialogHeader>
        
        <VehicleDialogContent 
          vehicle={vehicle}
          showQuoteForm={showQuoteForm}
          showReserveForm={showReserveForm}
          showVirtualReserveForm={showVirtualReserveForm}
          showCancelReservationForm={showCancelReservationForm}
          isSubmitting={isSubmitting}
          onCreateQuote={handleShowQuoteForm}
          onQuoteSubmit={handleCreateQuote}
          onQuoteCancel={handleCancelQuote}
          onReserveVehicle={handleReserveVehicle}
          onReserveVirtualVehicle={handleReserveVirtualVehicle}
          onCancelReservationShow={handleShowCancelReservationForm}
          onCancelReservationSubmit={handleCancelReservationSubmit}
          onCancelReservationCancel={handleCancelReservation}
          onReservationCancel={handleCancelReservation}
          onReservationComplete={() => {
            console.log('Reservation complete, closing dialog');
            handleCancelReservation();
            onOpenChange(false);
          }}
          onTransformToOrder={() => {
            console.log('Transform to order clicked, calling handler and will close dialog');
            // Disable button or show loading state here if needed
            handleTransformToOrder()
              .then(() => {
                console.log('Transform to order completed successfully, closing dialog');
                onOpenChange(false);
              })
              .catch(error => {
                console.error('Transform to order failed:', error);
                // Handle error if needed
              });
          }}
          userCanCreateQuotes={userCanCreateQuotes}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
