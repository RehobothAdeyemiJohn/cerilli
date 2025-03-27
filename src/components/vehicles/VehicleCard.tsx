
import React from 'react';
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Copy, Clock, Settings, FileCheck, Plus, CalendarClock, Layers } from 'lucide-react';
import { formatCurrency, calculateDaysInStock, calculateEstimatedArrival } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

function getDateRange(createdAt:any) {
  const createdDate = new Date(createdAt);
  
  // Add 30 days
  const minDate = new Date(createdDate);
  minDate.setDate(minDate.getDate() + 30);

  // Add 45 days
  const maxDate = new Date(createdDate);
  maxDate.setDate(maxDate.getDate() + 45);

  return [minDate, maxDate ];
}


interface VehicleCardProps {
  vehicle: Vehicle|any;
  onClick: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onDuplicate: (vehicle: Vehicle) => void;
  onCreateQuote?: (vehicle: Vehicle) => void;
  onReserve?: (vehicle: Vehicle) => void;
  isDealerStock?: boolean;
}

const VehicleCard = ({ 
  vehicle, 
  onClick, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onCreateQuote,
  onReserve,
  isDealerStock = false
}: VehicleCardProps) => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const isAdmin = user?.type === 'admin';
  
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-amber-100 text-amber-800',
    ordered: 'bg-blue-100 text-blue-800',
    sold: 'bg-gray-100 text-gray-800',
    delivered: 'bg-green-100 text-green-800',
  };

  const statusTranslations = {
    available: 'Disponibile',
    reserved: 'Prenotata',
    ordered: 'Ordinata',
    sold: 'Venduta',
    delivered: 'Disponibile',
  };

  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  const isDealerStockVehicle = vehicle.location === 'Stock Dealer' || isDealerStock;

  const daysInStock = (!isVirtualStock && !isDealer) || (isDealerStockVehicle && isDealer) 
    ? calculateDaysInStock(vehicle.dateAdded) 
    : null;

  const getStockDaysColor = (days: number) => {
    if (days <= 30) return 'bg-green-500';
    if (days <= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const hasVirtualConfig = vehicle.virtualConfig !== undefined;

  const estimatedArrival = isVirtualStock ? calculateEstimatedArrival(vehicle) : null;

  const handleActionClick = (e: React.MouseEvent, action: (vehicle: Vehicle) => void) => {
    e.stopPropagation();
    if (action) {
      action(vehicle);
    }
  };

  const getFormattedLocation = () => {
    if (isDealerStockVehicle && vehicle.reservedBy && isAdmin) {
      return `Stock ${vehicle.reservedBy}`;
    }
    return vehicle.location;
  };

  // Show admin buttons for admins and only for stock that's not virtual
  const showAdminButtons = isAdmin && !isVirtualStock;

  return (
    <div 
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(vehicle)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{vehicle.model}</h3>
            {!isVirtualStock && <p className="text-sm text-gray-500">{vehicle.trim}</p>}
          </div>
          
          <div className="flex items-center gap-2">
            {showAdminButtons && (
              <button
                onClick={(e) => handleActionClick(e, onEdit)}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                aria-label="Modifica veicolo"
                type="button"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {isVirtualStock && !isDealer && (
              <button
                onClick={(e) => handleActionClick(e, onDuplicate)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="Duplica veicolo"
                type="button"
              >
                <Layers className="h-4 w-4" />
              </button>
            )}
            <Badge variant="outline" className={statusColors[vehicle.status]}>
              {vehicle.status === 'delivered' ? 'Disponibile' : statusTranslations[vehicle.status]}
            </Badge>
          </div>
        </div>
        
        <div className="mt-2 space-y-2">
          {!isVirtualStock && vehicle.fuelType && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Alimentazione:</span>
              <span>{vehicle.fuelType}</span>
            </div>
          )}
          {!isVirtualStock && vehicle.exteriorColor && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Colore:</span>
              <span>{vehicle.exteriorColor}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Posizione:</span>
            <span>{getFormattedLocation()}</span>
          </div>
          {isVirtualStock && isAdmin && vehicle.originalStock && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Origine:</span>
              <span>Stock {vehicle.originalStock}</span>
            </div>
          )}
          {isVirtualStock && estimatedArrival && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-500 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                Data Arrivo:
              </span>
              <span className="font-medium text-primary">
                {/* {vehicle?.created_at} */}
                {getDateRange(vehicle?.created_at)[0].toDateString()}
              </span>
            </div>
          )}
          {!isVirtualStock && vehicle.transmission && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cambio:</span>
              <span>{vehicle.transmission}</span>
            </div>
          )}
          {vehicle.reservedBy && vehicle.status === 'reserved' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Prenotato da:</span>
              <span className="font-medium">{vehicle.reservedBy}</span>
            </div>
          )}
          {hasVirtualConfig && vehicle.status === 'reserved' && (
            <div className="flex items-center text-sm text-primary mt-1">
              <Settings className="h-3 w-3 mr-1" />
              <span className="font-medium">Configurato</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-2 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center">
            {daysInStock !== null ? (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{daysInStock} giorni</span>
                <div 
                  className={`h-2.5 w-2.5 rounded-full ${getStockDaysColor(daysInStock)}`}
                ></div>
              </div>
            ) : (
              <span>Aggiunto: {new Date(vehicle.dateAdded).toLocaleDateString()}</span>
            )}
          </div>
          {!isVirtualStock && (
            <div className="font-bold text-primary">{formatCurrency(vehicle.price)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
