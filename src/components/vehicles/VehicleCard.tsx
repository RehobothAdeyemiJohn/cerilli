
import React from 'react';
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
}

const VehicleCard = ({ vehicle, onClick }: VehicleCardProps) => {
  // Status colors
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-amber-100 text-amber-800',
    sold: 'bg-gray-100 text-gray-800',
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
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </Badge>
        </div>
        
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fuel Type:</span>
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Color:</span>
            <span>{vehicle.exteriorColor}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Location:</span>
            <span>{vehicle.location}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-2 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Added: {new Date(vehicle.dateAdded).toLocaleDateString()}
          </div>
          <div className="font-bold text-primary">{formatCurrency(vehicle.price)}</div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
