
import React from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Plus, X } from 'lucide-react';
import VehicleDetailsContent from './VehicleDetailsContent';
import QuoteForm from '@/components/quotes/QuoteForm';
import ReserveVehicleForm from '../ReserveVehicleForm';
import ReserveVirtualVehicleForm from '../ReserveVirtualVehicleForm';
import CancelReservationForm from '../CancelReservationForm';
import { useVehicleDetailsDialog } from './useVehicleDetailsDialog';
import { DialogFooter } from '@/components/ui/dialog';

interface VehicleDialogContentProps {
  vehicle: Vehicle | null;
  onOpenChange: (open: boolean) => void;
}

const VehicleDialogContent: React.FC<VehicleDialogContentProps> = ({ 
  vehicle, 
  onOpenChange 
}) => {
  const {
    showQuoteForm,
    showReserveForm,
    showVirtualReserveForm,
    showCancelReservationForm,
    isSubmitting,
    isTransforming,
    user,
    isVirtualStock,
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

  if (!vehicle) {
    return null;
  }

  // Define authorization levels
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isUserDealer = isDealer && user?.dealerName === vehicle.reservedBy;
  
  // Show quote form
  if (showQuoteForm) {
    return (
      <QuoteForm
        vehicle={vehicle}
        onSubmit={handleCreateQuote}
        onCancel={handleCancelQuote}
        isSubmitting={isSubmitting}
      />
    );
  }
  
  // Show reserve form for regular vehicles
  if (showReserveForm) {
    return (
      <ReserveVehicleForm
        vehicle={vehicle}
        onCancel={handleCancelReservation}
        onReservationComplete={() => {
          handleCancelReservation();
          onOpenChange(false);
        }}
      />
    );
  }
  
  // Show reserve form for virtual vehicles
  if (showVirtualReserveForm) {
    return (
      <ReserveVirtualVehicleForm
        vehicle={vehicle}
        onCancel={handleCancelReservation}
        onReservationComplete={() => {
          handleCancelReservation();
          onOpenChange(false);
        }}
      />
    );
  }
  
  // Show cancel reservation form
  if (showCancelReservationForm) {
    return (
      <CancelReservationForm
        vehicle={vehicle}
        onCancel={handleCancelReservation}
        onConfirm={handleCancelReservationSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <>
      <VehicleDetailsContent vehicle={vehicle} />
      
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
    </>
  );
};

export default VehicleDialogContent;
