
import React from 'react';
import { Vehicle } from '@/types';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface VehicleDialogHeaderProps {
  vehicle: Vehicle;
}

const VehicleDialogHeader = ({ vehicle }: VehicleDialogHeaderProps) => {
  const getDialogTitle = () => {
    if (vehicle.status === 'reserved') {
      return (
        <div className="flex items-center gap-2">
          <span>{vehicle.model} {vehicle.trim}</span>
          <span className="text-sm font-normal px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
            Prenotato
          </span>
        </div>
      );
    }
    return vehicle.model + (vehicle.trim ? ` ${vehicle.trim}` : '');
  };
  
  return (
    <>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogDescription>
        Dettagli del veicolo e azioni disponibili
      </DialogDescription>
    </>
  );
};

export default VehicleDialogHeader;
