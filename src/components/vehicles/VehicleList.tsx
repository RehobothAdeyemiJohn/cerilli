
import React, { useState } from 'react';
import VehicleCard from './VehicleCard';
import { Vehicle, Filter } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/utils';
import EditVehicleForm from './EditVehicleForm';
import { toast } from '@/hooks/use-toast';

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
  
  const closeDialog = () => {
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
          />
        ))}
      </div>
      
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun veicolo trovato in base ai criteri di ricerca</p>
        </div>
      )}
      
      {/* Finestra di dialogo per visualizzare i dettagli del veicolo */}
      <Dialog open={!!selectedVehicle} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVehicle.model} {selectedVehicle.trim}</DialogTitle>
                <DialogDescription>
                  Dettagli del veicolo e azioni disponibili
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Modello</p>
                    <p>{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Allestimento</p>
                    <p>{selectedVehicle.trim}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Alimentazione</p>
                    <p>{selectedVehicle.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Colore</p>
                    <p>{selectedVehicle.exteriorColor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prezzo</p>
                    <p className="font-bold text-primary">
                      {formatCurrency(selectedVehicle.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ubicazione</p>
                    <p>{selectedVehicle.location}</p>
                  </div>
                  {selectedVehicle.transmission && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cambio</p>
                      <p>{selectedVehicle.transmission}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Accessori</p>
                  <ul className="mt-1 space-y-1">
                    {selectedVehicle.accessories.map((accessory, idx) => (
                      <li key={idx} className="text-sm flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        {accessory}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary/90">
                    Crea Preventivo
                  </button>
                  <button className="flex-1 border border-gray-200 py-2 rounded-md hover:bg-gray-50">
                    Ordina Veicolo
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Finestra di dialogo per modificare il veicolo */}
      <Dialog open={!!vehicleToEdit} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {vehicleToEdit && (
            <>
              <DialogHeader>
                <DialogTitle>Modifica Veicolo</DialogTitle>
                <DialogDescription>
                  Modifica i dettagli del veicolo {vehicleToEdit.model} {vehicleToEdit.trim}
                </DialogDescription>
              </DialogHeader>
              
              <EditVehicleForm 
                vehicle={vehicleToEdit}
                onComplete={handleVehicleUpdate}
                onCancel={closeEditDialog}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Finestra di dialogo di conferma per eliminare il veicolo */}
      <AlertDialog open={!!vehicleToDelete} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo veicolo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il veicolo verrà permanentemente rimosso dall'inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleVehicleDelete} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VehicleList;
