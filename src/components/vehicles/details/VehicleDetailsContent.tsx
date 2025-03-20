
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-react';
import VehicleDialogHeader from './VehicleDialogHeader';
import VehicleDialogContent from './VehicleDialogContent';
import { useVehicleDetailsDialog } from '@/hooks/useVehicleDetailsDialog';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  onDelete?: () => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
  onCreateQuote?: ((vehicle: Vehicle) => void) | undefined;
  onReserve?: ((vehicle: Vehicle) => void) | undefined;
}

const VehicleDetailsContent: React.FC<VehicleDetailsContentProps> = ({ 
  vehicle,
  onEdit,
  onDelete,
  isDealerStock,
  isVirtualStock,
  onCreateQuote,
  onReserve
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
  const canDeleteVehicle = isAdmin && !isDealerStock;
  
  // Determine if the user can create quotes and reserve vehicles
  const userCanCreateQuotes = isAdmin || user?.permissions?.createQuotes;
  const userCanReserveVehicles = isAdmin || user?.permissions?.reserveVehicles;
  
  // Use the custom hook for all dialog state management
  const {
    showQuoteForm,
    showReserveForm,
    showVirtualReserveForm,
    showCancelReservationForm,
    isSubmitting,
    handleShowQuoteForm,
    handleCreateQuote,
    handleCancelQuote,
    handleReserveVehicle,
    handleReserveVirtualVehicle,
    handleCancelReservation,
    handleShowCancelReservationForm,
    handleCancelReservationSubmit
  } = useVehicleDetailsDialog(vehicle, null);
  
  // Handle quote creation
  const handleCreateQuoteClick = () => {
    if (onCreateQuote) {
      onCreateQuote(vehicle);
    } else {
      handleShowQuoteForm();
    }
  };
  
  // Handle reserve click
  const handleReserveClick = () => {
    if (onReserve) {
      onReserve(vehicle);
    } else {
      if (vehicle.location === 'Stock Virtuale') {
        handleReserveVirtualVehicle();
      } else {
        handleReserveVehicle();
      }
    }
  };
  
  // We determine if the duplicate button should be shown
  const showDuplicateButton = isVirtualStock || vehicle.location === 'Stock Virtuale';
  
  return (
    <div className="space-y-6">
      <VehicleDialogHeader 
        vehicle={vehicle}
        onDuplicate={showDuplicateButton ? undefined : undefined} // No duplicate from content, only from VehicleList
        onCreateQuote={userCanCreateQuotes ? handleCreateQuoteClick : undefined}
        onReserve={
          userCanReserveVehicles && vehicle.status === 'available' 
            ? handleReserveClick 
            : undefined
        }
        onCancelReservation={
          isAdmin && vehicle.status === 'reserved' 
            ? handleShowCancelReservationForm 
            : undefined
        }
        isAdmin={isAdmin}
        isVirtualStock={isVirtualStock}
        isDealerStock={isDealerStock}
      />
      
      <VehicleDialogContent
        vehicle={vehicle}
        showQuoteForm={showQuoteForm}
        showReserveForm={showReserveForm}
        showVirtualReserveForm={showVirtualReserveForm}
        showCancelReservationForm={showCancelReservationForm}
        isSubmitting={isSubmitting}
        onCreateQuote={handleCreateQuote}
        onCancel={handleCancelQuote}
        onSubmit={handleCancelQuote}
        onConfirm={handleCancelReservationSubmit}
        userCanReserveVehicles={userCanReserveVehicles}
        userCanCreateQuotes={userCanCreateQuotes}
      />
      
      {/* Action buttons */}
      <div className="flex justify-between items-center mt-4">
        <div className="space-x-2">
          {onEdit && isAdmin && !isVirtualStock && (
            <Button 
              variant="outline" 
              onClick={onEdit} 
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" /> Modifica
            </Button>
          )}
        </div>
        
        <div>
          {onDelete && canDeleteVehicle && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" /> Elimina
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsContent;
