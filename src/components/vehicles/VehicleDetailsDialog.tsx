
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
import { Toaster } from '@/components/ui/toaster';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Plus, X } from 'lucide-react';
import QuoteForm from '@/components/quotes/QuoteForm';
import ReserveVehicleForm from './ReserveVehicleForm';
import ReserveVirtualVehicleForm from './ReserveVirtualVehicleForm';
import CancelReservationForm from './CancelReservationForm';

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
    handleTransformToOrder,
    isTransforming,
    isVirtualStock
  } = useVehicleDetailsDialog(vehicle, onOpenChange);
  
  if (!vehicle) return null;
  
  // Ensure dialog can be closed unless operations are in progress
  const handleDialogChange = (value: boolean) => {
    if (!isTransforming && !isSubmitting) {
      onOpenChange(value);
    }
  };
  
  // Define authorization levels
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isUserDealer = isDealer && user?.dealerName === vehicle.reservedBy;
  
  // Show quote form
  if (showQuoteForm) {
    return (
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto grid grid-cols-1">
          <QuoteForm
            vehicle={vehicle}
            onSubmit={handleCreateQuote}
            onCancel={handleCancelQuote}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  // Show reserve form for regular vehicles
  if (showReserveForm) {
    return (
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto grid grid-cols-1">
          <ReserveVehicleForm
            vehicle={vehicle}
            onCancel={handleCancelReservation}
            onReservationComplete={() => {
              handleCancelReservation();
              onOpenChange(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  // Show reserve form for virtual vehicles
  if (showVirtualReserveForm) {
    return (
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto grid grid-cols-1">
          <ReserveVirtualVehicleForm
            vehicle={vehicle}
            onCancel={handleCancelReservation}
            onReservationComplete={() => {
              handleCancelReservation();
              onOpenChange(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  // Show cancel reservation form
  if (showCancelReservationForm) {
    return (
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto grid grid-cols-1">
          <CancelReservationForm
            vehicle={vehicle}
            onCancel={handleCancelReservation}
            onConfirm={handleCancelReservationSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-[1200px] w-[95%] max-h-[90vh] overflow-y-auto grid grid-cols-1">
          <DialogHeader className="pb-2">
            <VehicleDialogHeader vehicle={vehicle} />
          </DialogHeader>
          
          <VehicleDialogContent 
            vehicle={vehicle} 
            onOpenChange={onOpenChange}
          />
          
          {/* Actions footer */}
          <DialogFooter className="flex flex-wrap gap-2 mt-4">
            {/* For available vehicles */}
            {vehicle.status === 'available' && (
              <>
                {/* Quote button - Only show if NOT Virtual Stock */}
                {!isVirtualStock && (
                  <Button 
                    variant="outline" 
                    onClick={handleShowQuoteForm}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Preventivo
                  </Button>
                )}
                
                {/* Reservation buttons */}
                {vehicle.location === 'Stock Virtuale' ? (
                  <Button 
                    variant="default" 
                    onClick={handleReserveVirtualVehicle}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Prenota Stock Virtuale
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={handleReserveVehicle}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Prenota
                  </Button>
                )}
              </>
            )}
            
            {/* For reserved vehicles */}
            {vehicle.status === 'reserved' && (
              <>
                {/* Cancel reservation button */}
                {(isAdmin || isUserDealer) && (
                  <Button 
                    variant="destructive" 
                    onClick={handleShowCancelReservationForm}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancella Prenotazione
                  </Button>
                )}
                
                {/* Transform to order button - Admin only */}
                {isAdmin && (
                  <Button 
                    variant="default" 
                    onClick={handleTransformToOrder}
                    disabled={isTransforming}
                    className="flex-1"
                  >
                    {isTransforming ? (
                      <>
                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                        Trasformazione...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Trasforma in Ordine
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </>
  );
};

export default VehicleDetailsDialog;
