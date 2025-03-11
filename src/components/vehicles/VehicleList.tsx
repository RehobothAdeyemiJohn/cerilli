
import React, { useState } from 'react';
import VehicleCard from './VehicleCard';
import { Vehicle, Filter } from '@/types';
import { toast } from '@/hooks/use-toast';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import VehicleEditDialog from './VehicleEditDialog';
import VehicleDeleteDialog from './VehicleDeleteDialog';

interface VehicleListProps {
  vehicles: Vehicle[];
  filter?: Filter;
  onVehicleUpdated?: (vehicle: Vehicle) => void;
  onVehicleDeleted?: (vehicleId: string) => void;
}

const VehicleList = ({ vehicles, filter, onVehicleUpdated, onVehicleDeleted }: VehicleListProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };
  
  const handleEditClick = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
  };
  
  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
  };
  
  const handleDuplicateClick = async (vehicle: Vehicle) => {
    if (onVehicleUpdated) {
      try {
        // We'll reuse the update handler since it already refreshes the list
        // In a real app, you might want to create a specific handler
        const { handleVehicleDuplicate } = require('@/hooks/useInventory').useInventory();
        await handleVehicleDuplicate(vehicle);
      } catch (error) {
        console.error("Error duplicating vehicle:", error);
      }
    }
  };
  
  const closeDetailsDialog = () => {
    setSelectedVehicle(null);
  };
  
  const closeEditDialog = () => {
    setVehicleToEdit(null);
  };
  
  const closeDeleteDialog = () => {
    setVehicleToDelete(null);
  };
  
  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    if (onVehicleUpdated) {
      onVehicleUpdated(updatedVehicle);
    }
    
    // Mostra un toast per confermare l'aggiornamento
    toast({
      title: "Veicolo Aggiornato",
      description: `${updatedVehicle.model} ${updatedVehicle.trim} è stato aggiornato con successo.`,
    });
    
    closeEditDialog();
  };
  
  const handleVehicleDelete = () => {
    if (vehicleToDelete && onVehicleDeleted) {
      onVehicleDeleted(vehicleToDelete.id);
      
      // Mostra un toast per confermare l'eliminazione
      toast({
        title: "Veicolo Eliminato",
        description: `${vehicleToDelete.model} ${vehicleToDelete.trim} è stato eliminato dall'inventario.`,
        variant: "destructive",
      });
    }
    
    closeDeleteDialog();
  };
  
  // Apply filters if provided
  const filteredVehicles = vehicles;
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onClick={handleVehicleClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onDuplicate={handleDuplicateClick}
          />
        ))}
      </div>
      
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun veicolo trovato in base ai criteri di ricerca</p>
        </div>
      )}
      
      {/* Dialogs for vehicle operations */}
      <VehicleDetailsDialog 
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={open => !open && closeDetailsDialog()}
      />
      
      <VehicleEditDialog 
        vehicle={vehicleToEdit}
        open={!!vehicleToEdit}
        onOpenChange={open => !open && closeEditDialog()}
        onComplete={handleVehicleUpdate}
        onCancel={closeEditDialog}
      />
      
      <VehicleDeleteDialog 
        vehicle={vehicleToDelete}
        open={!!vehicleToDelete}
        onOpenChange={open => !open && closeDeleteDialog()}
        onConfirm={handleVehicleDelete}
      />
    </>
  );
};

export default VehicleList;
