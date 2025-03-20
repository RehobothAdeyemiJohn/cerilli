
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
  locationOptions?: string[];
}

const VehicleEditDialog = ({ 
  vehicle, 
  open, 
  onOpenChange,
  onComplete,
  onCancel,
  locationOptions
}: VehicleEditDialogProps) => {
  if (!vehicle) return null;
  
  // Determine if the vehicle is in Virtual Stock
  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {isVirtualStock ? 'Modifica Veicolo (Stock Virtuale)' : 'Modifica Veicolo'}
          </DialogTitle>
          <DialogDescription>
            {isVirtualStock 
              ? 'Modifica il modello del veicolo in stock virtuale' 
              : `Modifica i dettagli del veicolo ${vehicle.model} ${vehicle.trim || ''}`}
          </DialogDescription>
        </DialogHeader>
        
        <EditVehicleForm 
          vehicle={vehicle}
          onComplete={onComplete}
          onCancel={onCancel}
          locationOptions={locationOptions}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VehicleEditDialog;
