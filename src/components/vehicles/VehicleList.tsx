
import React, { useState } from 'react';
import VehicleCard from './VehicleCard';
import { Vehicle, Filter } from '@/types';
import { toast } from '@/hooks/use-toast';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import VehicleEditDialog from './VehicleEditDialog';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import { useInventory } from '@/hooks/useInventory';
import { useQueryClient } from '@tanstack/react-query';

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
  const { handleVehicleDuplicate } = useInventory();
  const queryClient = useQueryClient();
  
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
    try {
      // Pass the vehicle ID instead of the whole vehicle object
      await handleVehicleDuplicate(vehicle.id);
      
      // Force immediate data refresh
      queryClient.invalidateQueries({ queryKey: ['vehicles'], refetchType: 'all' });
      
      toast({
        title: "Veicolo Duplicato",
        description: `${vehicle.model} ${vehicle.trim} è stato duplicato con successo.`,
      });
    } catch (error) {
      console.error("Error duplicating vehicle:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la duplicazione del veicolo.",
        variant: "destructive",
      });
    }
  };
  
  const closeDetailsDialog = () => {
    setSelectedVehicle(null);
    // Force immediate data refresh
    queryClient.invalidateQueries({ queryKey: ['vehicles'], refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
  };
  
  const closeEditDialog = () => {
    setVehicleToEdit(null);
    // Force immediate data refresh
    queryClient.invalidateQueries({ queryKey: ['vehicles'], refetchType: 'all' });
  };
  
  const closeDeleteDialog = () => {
    setVehicleToDelete(null);
  };
  
  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    if (onVehicleUpdated) {
      onVehicleUpdated(updatedVehicle);
    }
    
    // Force immediate data refresh
    queryClient.invalidateQueries({ queryKey: ['vehicles'], refetchType: 'all' });
    
    // Show a toast to confirm the update
    toast({
      title: "Veicolo Aggiornato",
      description: `${updatedVehicle.model} ${updatedVehicle.trim} è stato aggiornato con successo.`,
    });
    
    closeEditDialog();
  };
  
  const handleVehicleDelete = () => {
    if (vehicleToDelete && onVehicleDeleted) {
      console.log('Calling onVehicleDeleted with vehicle ID:', vehicleToDelete.id);
      
      try {
        // Call the delete function and pass the vehicle ID
        onVehicleDeleted(vehicleToDelete.id);
        
        // Show a toast to confirm deletion
        toast({
          title: "Veicolo Eliminato",
          description: `${vehicleToDelete.model} ${vehicleToDelete.trim || ''} è stato eliminato dall'inventario.`,
        });
        
        // Force immediate data refresh
        queryClient.invalidateQueries({ queryKey: ['vehicles'], refetchType: 'all' });
        queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' });
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione del veicolo.",
          variant: "destructive",
        });
      }
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
        onOpenChange={open => {
          if (!open) {
            closeDetailsDialog();
            // Forzare il refresh dei dati quando si chiude il dialog
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          }
        }}
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
