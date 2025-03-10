
import React from 'react';
import { Check, MapPin, Calendar } from 'lucide-react';
import { Vehicle } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: (vehicle: Vehicle) => void;
}

const VehicleCard = ({ vehicle, onClick }: VehicleCardProps) => {
  const handleClick = () => {
    if (onClick) onClick(vehicle);
  };

  const getStatusColor = () => {
    switch (vehicle.status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-44">
        <img 
          src={vehicle.imageUrl || '/placeholder.svg'} 
          alt={`${vehicle.model} ${vehicle.trim}`}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-2 right-2 ${getStatusColor()} px-2 py-1 rounded-full text-xs font-medium`}>
          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold">{vehicle.model}</h3>
        <p className="text-sm text-gray-500">{vehicle.trim} • {vehicle.fuelType}</p>
        
        <div className="mt-3 text-xl font-bold text-primary">
          {formatCurrency(vehicle.price)}
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            {vehicle.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            Added: {new Date(vehicle.dateAdded).toLocaleDateString()}
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          {vehicle.accessories.slice(0, 3).map((accessory, idx) => (
            <div key={idx} className="flex items-center text-xs text-gray-600">
              <Check className="h-3 w-3 mr-1 text-green-500" />
              {accessory}
            </div>
          ))}
          {vehicle.accessories.length > 3 && (
            <div className="text-xs text-gray-500">+{vehicle.accessories.length - 3} more</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
