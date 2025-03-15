
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import VehicleDetailsContent from './details/VehicleDetailsContent';
import EditVehicleForm from './EditVehicleForm';
import ReserveVehicleForm from './ReserveVehicleForm';
import VirtualReservationForm from './virtualReservation/VirtualReservationForm';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVehicleUpdated: () => void;
  onVehicleDeleted: (id: string) => Promise<void>;
  onCreateQuote?: (vehicle: Vehicle) => void; 
  onReserve?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
  shouldReserve?: boolean;
}

const VehicleDetailsDialog: React.FC<VehicleDetailsDialogProps> = ({
  vehicle,
  open,
  onOpenChange,
  onVehicleUpdated,
  onVehicleDeleted,
  onCreateQuote,
  onReserve,
  isDealerStock = false,
  isVirtualStock = false,
  shouldReserve = false
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReserveForm, setShowReserveForm] = useState(false);
  const [showVirtualReservationForm, setShowVirtualReservationForm] = useState(false);
  const { user } = useAuth();
  // Fix: Change the isDealer check to include all non-admin roles
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  
  // Effect to handle the shouldReserve prop
  useEffect(() => {
    console.log("VehicleDetailsDialog: shouldReserve changed to", shouldReserve);
    if (open && vehicle && shouldReserve) {
      console.log("Auto-opening reservation form for", vehicle.id, vehicle.location);
      if (vehicle.location === 'Stock Virtuale') {
        console.log("Opening virtual reservation form");
        setShowVirtualReservationForm(true);
      } else {
        console.log("Opening standard reservation form");
        setShowReserveForm(true);
      }
    }
  }, [open, vehicle, shouldReserve]);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setShowEditForm(false);
      setShowReserveForm(false);
      setShowVirtualReservationForm(false);
    }
  }, [open]);
  
  if (!vehicle) {
    return null;
  }
  
  const handleEditClick = () => {
    setShowEditForm(true);
    setShowReserveForm(false);
    setShowVirtualReservationForm(false);
  };
  
  const handleReserveClick = () => {
    console.log("Reserve button clicked in dialog for vehicle:", vehicle.id, vehicle.location);
    if (vehicle.location === 'Stock Virtuale') {
      console.log("Opening virtual reservation form");
      setShowVirtualReservationForm(true);
      setShowReserveForm(false);
    } else {
      console.log("Opening standard reservation form");
      setShowReserveForm(true);
      setShowVirtualReservationForm(false);
    }
    setShowEditForm(false);
  };
  
  const handleCreateQuoteClick = () => {
    if (onCreateQuote) {
      onCreateQuote(vehicle);
      onOpenChange(false);
    }
  };
  
  const handleDialogClose = () => {
    onOpenChange(false);
  };
  
  const handleDeleteClick = async () => {
    try {
      await onVehicleDeleted(vehicle.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting vehicle from dialog:', error);
    }
  };
  
  const handleReservationComplete = () => {
    console.log("Reservation completed, refreshing data");
    onVehicleUpdated();
    setShowReserveForm(false);
    setShowVirtualReservationForm(false);
    onOpenChange(false);
  };
  
  // Fixed: Fix the logic to properly determine if the user can reserve vehicles
  const canReserve = vehicle.status === 'available' && isDealer;
  
  // Fixed: Correct the admin check to properly check for admin type
  // The error was comparing with 'superAdmin' which is a Role, not a UserType
  const canEdit = user?.type === 'admin';
  
  console.log("VehicleDetailsDialog state:", { 
    canReserve, 
    canEdit, 
    userType: user?.type, 
    isDealer, 
    vehicleStatus: vehicle.status 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {showEditForm ? (
          <EditVehicleForm 
            vehicle={vehicle}
            onComplete={() => {
              onVehicleUpdated();
              setShowEditForm(false);
              onOpenChange(false);
            }}
            onCancel={() => setShowEditForm(false)}
          />
        ) : showReserveForm ? (
          <ReserveVehicleForm
            vehicle={vehicle}
            onReservationComplete={handleReservationComplete}
            onCancel={() => setShowReserveForm(false)}
          />
        ) : showVirtualReservationForm ? (
          <VirtualReservationForm
            vehicle={vehicle}
            onReservationComplete={handleReservationComplete}
            onCancel={() => setShowVirtualReservationForm(false)}
          />
        ) : (
          <VehicleDetailsContent 
            vehicle={vehicle} 
            onEdit={canEdit ? handleEditClick : undefined}
            onDelete={canEdit ? handleDeleteClick : undefined}
            onReserve={canReserve ? handleReserveClick : undefined}
            onCreateQuote={canReserve && !isVirtualStock ? handleCreateQuoteClick : undefined}
            onClose={handleDialogClose}
            isDealerStock={isDealerStock}
            isVirtualStock={isVirtualStock}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
