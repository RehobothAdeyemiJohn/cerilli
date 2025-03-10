
import React from 'react';
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const VehicleCard = ({ vehicle, onClick, onEdit, onDelete }: VehicleCardProps) => {
  // Status colors
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-amber-100 text-amber-800',
    sold: 'bg-gray-100 text-gray-800',
  };

  // Traduzioni di stato
  const statusTranslations = {
    available: 'Disponibile',
    reserved: 'Prenotata',
    sold: 'Venduta',
  };

  // Ferma la propagazione degli eventi per evitare che il click sui pulsanti attivi anche il click sulla card
  const handleActionClick = (e: React.MouseEvent, action: (vehicle: Vehicle) => void) => {
    e.stopPropagation();
    action(vehicle);
  };

  return (
    <div 
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(vehicle)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{vehicle.model}</h3>
            <p className="text-sm text-gray-500">{vehicle.trim}</p>
          </div>
          <Badge variant="outline" className={statusColors[vehicle.status]}>
            {statusTranslations[vehicle.status]}
          </Badge>
        </div>
        
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Alimentazione:</span>
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Colore:</span>
            <span>{vehicle.exteriorColor}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Posizione:</span>
            <span>{vehicle.location}</span>
          </div>
          {vehicle.transmission && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cambio:</span>
              <span>{vehicle.transmission}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-2 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Aggiunto: {new Date(vehicle.dateAdded).toLocaleDateString()}
          </div>
          <div className="font-bold text-primary">{formatCurrency(vehicle.price)}</div>
        </div>
        
        <div className="mt-3 pt-2 border-t flex justify-end space-x-2">
          <button 
            onClick={(e) => handleActionClick(e, onEdit)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="Modifica veicolo"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => handleActionClick(e, onDelete)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            aria-label="Elimina veicolo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
