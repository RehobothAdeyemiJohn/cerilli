
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import VehicleCard from './VehicleCard';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import { useLocation } from 'react-router-dom';

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
  
  const location = useLocation();
  const locationState = location.state as { 
    reserveVehicle?: boolean; 
    vehicleId?: string;
    openDialog?: boolean;
  } | null;
  
  const handleViewVehicle = (vehicle: Vehicle) => {
    console.log("Opening vehicle details:", vehicle);
    setSelectedVehicle(vehicle);
    setOpenVehicleDetails(true);
    setRequestedAction(undefined); // Reset any requested action
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
    console.log("Duplicate vehicle:", vehicle.id);
    setSelectedVehicle(vehicle);
    setRequestedAction('duplicate');
    setOpenVehicleDetails(true);
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

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nessun veicolo trovato.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onClick={handleViewVehicle}
            onEdit={handleEditVehicle}
            onDelete={handleDeleteVehicle}
            onDuplicate={handleDuplicateVehicle}
            onCreateQuote={onCreateQuote}
            onReserve={onReserve}
          />
        ))}
      </div>
      
      <VehicleDetailsDialog
        vehicle={selectedVehicle}
        open={openVehicleDetails}
        onOpenChange={setOpenVehicleDetails}
        onVehicleUpdated={onVehicleUpdated}
        onVehicleDeleted={onVehicleDeleted}
        onCreateQuote={onCreateQuote}
        onReserve={onReserve}
        isDealerStock={isDealerStock}
        isVirtualStock={isVirtualStock}
        shouldReserve={locationState?.reserveVehicle && locationState?.vehicleId === selectedVehicle?.id}
        requestedAction={requestedAction}
      />
      
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
