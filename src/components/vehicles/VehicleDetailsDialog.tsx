import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import VehicleDialogHeader from './details/VehicleDialogHeader';
import VehicleDialogContent from './details/VehicleDialogContent';
import { useVehicleDetailsDialog } from './details/useVehicleDetailsDialog';
import { useAuth } from '@/context/AuthContext';
import VehicleEditDialog from './VehicleEditDialog';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { vehiclesApi } from '@/api/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleUpdated?: () => void;
  onVehicleDeleted?: () => Promise<void>;
  onReserve?: (vehicle: Vehicle) => void;
  onCreateQuote?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
}

const VehicleDetailsDialog = ({
  vehicle,
  open,
  onOpenChange,
  onVehicleUpdated,
  onVehicleDeleted,
  onReserve,
  onCreateQuote,
  isDealerStock = false
}: VehicleDetailsDialogProps) => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  
  const {
    state,
    setShowEditDialog,
    setShowDeleteDialog,
    setShowQuoteForm,
    setShowReserveForm,
    setShowVirtualReserveForm,
    setShowCancelReservationForm,
    handleVehicleDeleted,
    handleReservationComplete,
    handleCancelReservation,
    handleDuplicateVehicle,
    handleCreateOrder
  } = useVehicleDetailsDialog({
    vehicle,
    onOpenChange,
    onVehicleUpdated,
    onVehicleDeleted
  });

  // Hide image when it's a dealer stock vehicle
  const shouldHideImage = isDealerStock;
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {vehicle && (
            <>
              <DialogHeader>
                <VehicleDialogHeader
                  vehicle={vehicle}
                  onEdit={() => setShowEditDialog(true)}
                  onDelete={() => setShowDeleteDialog(true)}
                  onDuplicate={() => handleDuplicateVehicle(vehicle.id)}
                  onCreateQuote={onCreateQuote && isDealer && vehicle.status === 'available' 
                    ? () => onCreateQuote(vehicle) 
                    : undefined
                  }
                  onReserve={onReserve && isDealer && vehicle.status === 'available'
                    ? () => onReserve(vehicle)
                    : undefined
                  }
                  onCancelReservation={vehicle.status === 'reserved' && (isDealer || !isDealer)
                    ? () => setShowCancelReservationForm(true)
                    : undefined
                  }
                  onCreateOrder={vehicle.status === 'reserved'
                    ? () => handleCreateOrder(vehicle.id)
                    : undefined
                  }
                  isDealer={isDealer}
                />
              </DialogHeader>
              
              <VehicleDialogContent
                vehicle={vehicle}
                showQuoteForm={state.showQuoteForm}
                showReserveForm={state.showReserveForm}
                showVirtualReserveForm={state.showVirtualReserveForm}
                showCancelReservationForm={state.showCancelReservationForm}
                isSubmitting={state.isSubmittingCancel}
                onCreateQuote={() => {
                  setShowQuoteForm(false);
                  if (onCreateQuote) onCreateQuote(vehicle);
                }}
                onCancel={() => {
                  setShowQuoteForm(false);
                  setShowReserveForm(false);
                  setShowVirtualReserveForm(false);
                  setShowCancelReservationForm(false);
                }}
                onSubmit={handleReservationComplete}
                onConfirm={handleCancelReservation}
                hideImage={shouldHideImage}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <VehicleEditDialog
        vehicle={vehicle}
        open={state.showEditDialog}
        onOpenChange={setShowEditDialog}
        onVehicleUpdated={onVehicleUpdated}
      />
      
      <VehicleDeleteDialog
        vehicle={vehicle}
        open={state.showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onVehicleDeleted={handleVehicleDeleted}
      />
    </>
  );
};

export default VehicleDetailsDialog;
