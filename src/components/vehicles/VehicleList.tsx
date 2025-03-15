
import React, { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import VehicleCard from './VehicleCard';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shouldReserve, setShouldReserve] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Effect to open the dialog if a vehicleId is passed in navigation
  useEffect(() => {
    const state = location.state as any;
    console.log("VehicleList location state:", state);
    
    if (state) {
      if (state.vehicleId) {
        const vehicle = vehicles.find(v => v.id === state.vehicleId);
        console.log("Found vehicle for ID:", state.vehicleId, vehicle);
        
        if (vehicle) {
          setSelectedVehicle(vehicle);
          setIsDialogOpen(true);
          
          // Check if we should automatically open the reserve form
          if (state.reserveVehicle) {
            console.log("Should reserve vehicle after dialog opens:", vehicle.id);
            setShouldReserve(true);
          }
          
          // Clear navigation state after opening dialog
          if (!state.keepState) {
            navigate(location.pathname, { replace: true });
          }
        } else {
          console.log("Vehicle not found for ID:", state.vehicleId);
        }
      }
    }
  }, [location, vehicles, navigate]);
  
  const handleVehicleClick = (vehicle: Vehicle) => {
    console.log("Clicked on vehicle:", vehicle);
    setSelectedVehicle(vehicle);
    setShouldReserve(false);
    setIsDialogOpen(true);
  };
  
  const handleVehicleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShouldReserve(false);
    setIsDialogOpen(true);
  };
  
  const handleVehicleDelete = async (vehicle: Vehicle) => {
    try {
      await onVehicleDeleted(vehicle.id);
    } catch (error) {
      console.error('Error handling vehicle delete:', error);
    }
  };
  
  const handleVehicleDuplicate = (vehicle: Vehicle) => {
    console.log('Duplicating vehicle from list:', vehicle.id);
  };
  
  // Add logging to reserve handler
  const handleReserve = (vehicle: Vehicle) => {
    console.log("Reserve requested for vehicle:", vehicle.id, vehicle.location);
    if (onReserve) {
      onReserve(vehicle);
    }
  };
  
  // Handle dialog closed
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setShouldReserve(false);
    }
  };
  
  return (
    <div>
      {vehicles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nessun veicolo trovato.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={handleVehicleClick}
              onEdit={handleVehicleEdit}
              onDelete={handleVehicleDelete}
              onDuplicate={handleVehicleDuplicate}
              onCreateQuote={onCreateQuote}
              onReserve={handleReserve}
            />
          ))}
        </div>
      )}
      
      <VehicleDetailsDialog
        vehicle={selectedVehicle}
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onVehicleUpdated={onVehicleUpdated}
        onVehicleDeleted={onVehicleDeleted}
        onCreateQuote={onCreateQuote}
        onReserve={handleReserve}
        isDealerStock={isDealerStock}
        isVirtualStock={isVirtualStock}
        shouldReserve={shouldReserve}
      />
    </div>
  );
};

export default VehicleList;
