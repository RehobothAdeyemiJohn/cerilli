
import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import VehicleCard from './VehicleCard';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface VehicleListProps {
  vehicles: Vehicle[];
  onVehicleUpdated: () => void;
  onVehicleDeleted: (id: string) => Promise<void>;
  onCreateQuote?: (vehicle: Vehicle) => void;
  onReserve?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
  isVirtualStock?: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  onVehicleUpdated,
  onVehicleDeleted,
  onCreateQuote,
  onReserve,
  isDealerStock = false,
  isVirtualStock = false
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [openVehicleDetails, setOpenVehicleDetails] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [requestedAction, setRequestedAction] = useState<string | undefined>(undefined);
  const [processingAction, setProcessingAction] = useState(false);
  const queryClient = useQueryClient();
  
  const location = useLocation();
  const locationState = location.state as { 
    reserveVehicle?: boolean; 
    vehicleId?: string;
    openDialog?: boolean;
  } | null;

  // Clean up state when dialog closes
  useEffect(() => {
    if (!openVehicleDetails) {
      setRequestedAction(undefined);
      setProcessingAction(false);
    }
  }, [openVehicleDetails]);
  
  // Auto-open vehicle dialog for reservation when navigating with state
  // useEffect(() => {
  //   if (locationState?.reserveVehicle && locationState.vehicleId) {
  //     console.log("Auto-opening vehicle for reservation:", locationState.vehicleId);
  //     const vehicleToReserve = vehicles.find(v => v.id === locationState.vehicleId);
  //     if (vehicleToReserve) {
  //       setSelectedVehicle(vehicleToReserve);
  //       setOpenVehicleDetails(true);
  //       setRequestedAction('reserve');
  //     }
  //   }
  // }, [locationState, vehicles]);
  
  const handleViewVehicle = (vehicle: Vehicle) => {
    console.log("Opening vehicle details:", vehicle);
    setSelectedVehicle(vehicle);
    setOpenVehicleDetails(true);
    setRequestedAction(undefined); // Reset any requested action
    setProcessingAction(false);
  };
  
  const handleEditVehicle = (vehicle: Vehicle) => {
    console.log("Edit vehicle:", vehicle.id);
    setSelectedVehicle(vehicle);
    setOpenVehicleDetails(true);
  };
  
  const handleDeleteVehicle = (vehicle: Vehicle) => {
    console.log("Delete vehicle:", vehicle.id);
    setVehicleToDelete(vehicle);
    setOpenDeleteDialog(true);
  };
  
  const handleDuplicateVehicle = (vehicle: Vehicle) => {
    if (vehicle.location !== 'Stock Virtuale') {
      console.log("Duplication not allowed for non-virtual vehicles:", vehicle.location);
      return;
    }
    
    if (processingAction) {
      console.log("Already processing an action, ignoring duplicate request");
      return;
    }
    
    console.log("Duplicate vehicle initiated:", vehicle.id);
    setSelectedVehicle(vehicle);
    setRequestedAction('duplicate');
    setProcessingAction(true);
    setOpenVehicleDetails(true);
  };
  
  const handleVehicleUpdated = () => {
    console.log("Vehicle updated, refreshing data");
    onVehicleUpdated();
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  };
  
  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        await onVehicleDeleted(vehicleToDelete.id);
        setOpenDeleteDialog(false);
        setVehicleToDelete(null);
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      }
    }
  };

  const handleDialogClose = () => {
    console.log("Dialog closed, cleaning up state");
    setOpenVehicleDetails(false);
    setRequestedAction(undefined);
    setProcessingAction(false);
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  };
  
  const handleReserveClick = (vehicle: Vehicle) => {
    console.log("Reserve button clicked for vehicle:", vehicle.id);
    if (onReserve) {
      onReserve(vehicle);
    } else {
      // Direct handling when onReserve is not provided
      setSelectedVehicle(vehicle);
      setOpenVehicleDetails(true);
      setRequestedAction('reserve');
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nessun veicolo trovato.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-2">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onClick={handleViewVehicle}
            onEdit={handleEditVehicle}
            onDelete={handleDeleteVehicle}
            onDuplicate={handleDuplicateVehicle}
            onCreateQuote={onCreateQuote ? () => onCreateQuote(vehicle) : undefined}
            onReserve={() => handleReserveClick(vehicle)}
            isDealerStock={isDealerStock}
          />
        ))}
      </div>
      
      {selectedVehicle && (
        <VehicleDetailsDialog
          vehicle={selectedVehicle}
          open={openVehicleDetails}
          onOpenChange={handleDialogClose}
          onVehicleUpdated={handleVehicleUpdated}
          onVehicleDeleted={onVehicleDeleted}
          onCreateQuote={onCreateQuote}
          onReserve={onReserve}
          isDealerStock={isDealerStock}
          isVirtualStock={isVirtualStock}
          shouldReserve={requestedAction === 'reserve' || (locationState?.reserveVehicle && locationState?.vehicleId === selectedVehicle?.id)}
          requestedAction={requestedAction}
        />
      )}
      
      <VehicleDeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleConfirmDelete}
        vehicle={vehicleToDelete}
      />
    </div>
  );
};

export default VehicleList;
