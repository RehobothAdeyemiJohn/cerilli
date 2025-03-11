
import React from 'react';
import { Vehicle } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';

interface VehicleDetailsDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VehicleDetailsDialog = ({ vehicle, open, onOpenChange }: VehicleDetailsDialogProps) => {
  if (!vehicle) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{vehicle.model} {vehicle.trim}</DialogTitle>
          <DialogDescription>
            Dettagli del veicolo e azioni disponibili
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Modello</p>
              <p>{vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Allestimento</p>
              <p>{vehicle.trim}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Alimentazione</p>
              <p>{vehicle.fuelType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Colore</p>
              <p>{vehicle.exteriorColor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Prezzo</p>
              <p className="font-bold text-primary">
                {formatCurrency(vehicle.price)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ubicazione</p>
              <p>{vehicle.location}</p>
            </div>
            {vehicle.transmission && (
              <div>
                <p className="text-sm font-medium text-gray-500">Cambio</p>
                <p>{vehicle.transmission}</p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Accessori</p>
            <ul className="mt-1 space-y-1">
              {vehicle.accessories.map((accessory, idx) => (
                <li key={idx} className="text-sm flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  {accessory}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-4 mt-6">
            {vehicle.status === 'available' ? (
              <>
                <button className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary/90">
                  Crea Preventivo
                </button>
                <button className="flex-1 border border-gray-200 py-2 rounded-md hover:bg-gray-50">
                  Ordina Veicolo
                </button>
              </>
            ) : (
              <div className="w-full text-center py-2 bg-gray-100 rounded-md text-gray-500">
                {vehicle.status === 'reserved' ? 'Veicolo Prenotato' : 'Veicolo Venduto'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDetailsDialog;
