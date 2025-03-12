
import React from 'react';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            handleCancelReservation();
            onOpenChange(false);
          }}
          onTransformToOrder={handleTransformToOrder}
          userCanCreateQuotes={userCanCreateQuotes}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
