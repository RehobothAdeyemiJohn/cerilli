
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
  // Correggiamo la logica per canReserve
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
    console.log("Create quote button clicked for vehicle:", vehicle.id);
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
  
  // Semplifichiamo la logica per una migliore comprensione
  // Un utente può prenotare se è un dealer e il veicolo è disponibile
  const canReserve = isDealer && vehicle.status === 'available';
  const canEdit = user?.type === 'admin';
  
  console.log("VehicleDetailsDialog state:", { 
    canReserve, 
    canEdit, 
    userType: user?.type, 
    isDealer, 
    vehicleStatus: vehicle.status,
    onReserve: Boolean(onReserve),
    onCreateQuote: Boolean(onCreateQuote),
    isDealerStock,
    isVirtualStock
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
            onReserve={canReserve && onReserve ? handleReserveClick : undefined}
            onCreateQuote={canReserve && onCreateQuote && !isVirtualStock ? handleCreateQuoteClick : undefined}
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
