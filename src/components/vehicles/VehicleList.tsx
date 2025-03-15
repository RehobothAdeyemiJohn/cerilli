
import React, { useState } from 'react';
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
  const location = useLocation();
  const navigate = useNavigate();
  
  // Effetto per aprire il dialogo se viene passato un vehicleId nella navigazione
  React.useEffect(() => {
    const state = location.state as any;
    console.log("VehicleList location state:", state);
    
    if (state && state.vehicleId) {
      const vehicle = vehicles.find(v => v.id === state.vehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setIsDialogOpen(true);
        
        // Clear navigation state after opening dialog
        if (!state.keepState) {
          navigate(location.pathname, { replace: true });
        }
      }
    }
  }, [location, vehicles, navigate]);
  
  const handleVehicleClick = (vehicle: Vehicle) => {
    console.log("Clicked on vehicle:", vehicle);
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };
  
  const handleVehicleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
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
  
  // Aggiungiamo logging al comportamento di prenotazione
  const handleReserve = (vehicle: Vehicle) => {
    console.log("Reserve requested for vehicle:", vehicle.id, vehicle.location);
    if (onReserve) {
      onReserve(vehicle);
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
        onOpenChange={setIsDialogOpen}
        onVehicleUpdated={onVehicleUpdated}
        onVehicleDeleted={onVehicleDeleted}
        onCreateQuote={onCreateQuote}
        onReserve={handleReserve}
        isDealerStock={isDealerStock}
        isVirtualStock={isVirtualStock}
      />
    </div>
  );
};

export default VehicleList;
