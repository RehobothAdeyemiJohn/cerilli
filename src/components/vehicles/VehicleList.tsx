
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import VehicleCard from './VehicleCard';
import { Grid } from '@/components/ui/grid';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface VehicleListProps {
  vehicles: Vehicle[];
  onVehicleUpdated: () => void;
  onVehicleDeleted: (id: string) => Promise<void>;
  onCreateQuote?: (vehicle: Vehicle) => void;
  onReserve?: (vehicle: Vehicle) => void;
  isVirtualStock?: boolean;
}

const VehicleList = ({ 
  vehicles,
  onVehicleUpdated,
  onVehicleDeleted,
  onCreateQuote,
  onReserve,
  isVirtualStock = false
}: VehicleListProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const queryClient = useQueryClient();

  const showDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const hideDetails = () => {
    setIsDetailsOpen(false);
    setSelectedVehicle(null);
  };

  const showDeleteDialog = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
  };

  const hideDeleteDialog = () => {
    setVehicleToDelete(null);
  };

  const handleVehicleDeleted = async () => {
    if (vehicleToDelete) {
      try {
        console.log("VehicleList: Initiating vehicle deletion for ID:", vehicleToDelete.id);
        await onVehicleDeleted(vehicleToDelete.id);
        
        // Close any open dialogs
        hideDeleteDialog();
        
        if (selectedVehicle && selectedVehicle.id === vehicleToDelete.id) {
          hideDetails();
        }
        
        // Invalidate queries to refresh the data
        await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        
        toast({
          title: "Veicolo eliminato",
          description: "Il veicolo è stato eliminato con successo.",
        });
      } catch (error) {
        console.error("VehicleList: Error deleting vehicle:", error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione del veicolo.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="mb-8">
      {vehicles.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nessun veicolo trovato con i filtri selezionati.</p>
        </div>
      ) : (
        <Grid columns={[1, 2, 3, 4]} gap={4}>
          {vehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle}
              onClick={showDetails}
              onEdit={() => showDetails(vehicle)}
              onDelete={(v) => showDeleteDialog(v)}
              onDuplicate={(v) => {
                console.log("Duplicate button clicked for vehicle:", v.id);
                // We just open details dialog with a duplicate flag
                setSelectedVehicle({...v, _action: 'duplicate'});
                setIsDetailsOpen(true);
              }}
              onCreateQuote={onCreateQuote}
              onReserve={onReserve}
            />
          ))}
        </Grid>
      )}

      {selectedVehicle && (
        <VehicleDetailsDialog 
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          vehicle={selectedVehicle}
          onVehicleUpdated={onVehicleUpdated}
          onVehicleDeleted={() => {
            if (selectedVehicle) {
              showDeleteDialog(selectedVehicle);
            }
          }}
          onCreateQuote={onCreateQuote}
          onReserve={onReserve}
          isVirtualStock={isVirtualStock}
          requestedAction={selectedVehicle._action}
        />
      )}

      {vehicleToDelete && (
        <VehicleDeleteDialog 
          vehicle={vehicleToDelete}
          open={!!vehicleToDelete}
          onOpenChange={(open) => {
            if (!open) hideDeleteDialog();
          }}
          onConfirm={handleVehicleDeleted}
        />
      )}
    </div>
  );
};

export default VehicleList;
