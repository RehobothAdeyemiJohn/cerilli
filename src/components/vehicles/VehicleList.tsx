
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import VehicleCard from './VehicleCard';
import VehicleDetailsDialog from './VehicleDetailsDialog';
import VehicleEditDialog from './VehicleEditDialog';
import VehicleDeleteDialog from './VehicleDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onVehicleUpdated: () => void;
  onVehicleDeleted: (id: string) => Promise<void>;
  onCreateQuote?: (vehicle: Vehicle) => void;
  onReserve?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
}

const VehicleList: React.FC<VehicleListProps> = ({ 
  vehicles, 
  onVehicleUpdated, 
  onVehicleDeleted,
  onCreateQuote,
  onReserve,
  isDealerStock = false
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  
  const handleCardClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsDialog(true);
  };
  
  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditDialog(true);
  };
  
  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteDialog(true);
  };
  
  const handleDuplicate = (vehicle: Vehicle) => {
    // This will be handled by the VehicleDetailsDialog
    setSelectedVehicle(vehicle);
    setShowDetailsDialog(true);
  };
  
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <AlertCircle className="mx-auto h-12 w-12 mb-4 text-gray-400" />
        <p>Nessun veicolo trovato con i filtri selezionati.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vehicles.map(vehicle => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onClick={handleCardClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onCreateQuote={onCreateQuote}
            onReserve={onReserve}
          />
        ))}
      </div>
      
      <VehicleDetailsDialog
        vehicle={selectedVehicle}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onVehicleUpdated={onVehicleUpdated}
        onVehicleDeleted={onVehicleDeleted}
        onCreateQuote={onCreateQuote}
        onReserve={onReserve}
        isDealerStock={isDealerStock}
      />
      
      <VehicleEditDialog
        vehicle={selectedVehicle}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onComplete={() => onVehicleUpdated()}
        onCancel={() => setShowEditDialog(false)}
      />
      
      <VehicleDeleteDialog
        vehicle={selectedVehicle}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={async () => {
          if (selectedVehicle) {
            try {
              await onVehicleDeleted(selectedVehicle.id);
              toast({
                title: "Veicolo eliminato",
                description: "Il veicolo è stato eliminato con successo dall'inventario.",
              });
            } catch (error) {
              toast({
                title: "Errore",
                description: "Si è verificato un errore durante l'eliminazione del veicolo.",
                variant: "destructive",
              });
            } finally {
              setSelectedVehicle(null);
              setShowDeleteDialog(false);
            }
          }
        }}
      />
    </div>
  );
};

export default VehicleList;
