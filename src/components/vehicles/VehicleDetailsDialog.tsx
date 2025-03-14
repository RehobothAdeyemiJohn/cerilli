
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
import TransformOrderConfirmDialog from './details/TransformOrderConfirmDialog';
import { useTransformOrderConfirm } from './details/useTransformOrderConfirm';
import { Toaster } from '@/components/ui/toaster';

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
  
  const {
    isTransforming,
    showTransformConfirm,
    setShowTransformConfirm,
    handleTransformToOrderClick,
    handleConfirmTransform
  } = useTransformOrderConfirm(handleTransformToOrder, () => onOpenChange(false));
  
  if (!vehicle) return null;
  
  // Ensure dialog can be closed unless operations are in progress
  const handleDialogChange = (value: boolean) => {
    if (!isTransforming && !isSubmitting) {
      onOpenChange(value);
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto grid grid-cols-1">
          <DialogHeader className="pb-2">
            <VehicleDialogHeader vehicle={vehicle} />
          </DialogHeader>
          
          <VehicleDialogContent 
            vehicle={vehicle}
            showQuoteForm={showQuoteForm}
            showReserveForm={showReserveForm}
            showVirtualReserveForm={showVirtualReserveForm}
            showCancelReservationForm={showCancelReservationForm}
            isSubmitting={isSubmitting || isTransforming}
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
            onTransformToOrder={handleTransformToOrderClick}
            userCanCreateQuotes={true}
          />
        </DialogContent>
      </Dialog>
      
      <TransformOrderConfirmDialog 
        open={showTransformConfirm}
        onOpenChange={setShowTransformConfirm}
        onConfirm={handleConfirmTransform}
        isLoading={isTransforming}
      />
      
      <Toaster />
    </>
  );
};

export default VehicleDetailsDialog;
