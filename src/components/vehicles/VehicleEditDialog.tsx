
import React from 'react';
import { Vehicle } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import EditVehicleForm from './EditVehicleForm';

interface VehicleEditDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (updatedVehicle: Vehicle) => void;
  onCancel: () => void;
}

const VehicleEditDialog = ({ 
  vehicle, 
  open, 
  onOpenChange,
  onComplete,
  onCancel
}: VehicleEditDialogProps) => {
  if (!vehicle) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>Modifica Veicolo</DialogTitle>
          <DialogDescription>
            Modifica i dettagli del veicolo {vehicle.model} {vehicle.trim}
          </DialogDescription>
        </DialogHeader>
        
        <EditVehicleForm 
          vehicle={vehicle}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VehicleEditDialog;
