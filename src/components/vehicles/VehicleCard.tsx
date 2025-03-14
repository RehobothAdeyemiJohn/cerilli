import React from 'react';
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Copy, Clock, Settings, FileCheck, Plus, CalendarClock } from 'lucide-react';
import { formatCurrency, calculateDaysInStock, calculateEstimatedArrival } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onDuplicate: (vehicle: Vehicle) => void;
  onCreateQuote?: (vehicle: Vehicle) => void;
  onReserve?: (vehicle: Vehicle) => void;
}

const VehicleCard = ({ 
  vehicle, 
  onClick, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onCreateQuote,
  onReserve
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
  const isDealerStock = vehicle.location === 'Stock Dealer';

  const daysInStock = (!isVirtualStock && !isDealer) || (isDealerStock && isDealer) 
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
    action(vehicle);
  };

  const getFormattedLocation = () => {
    if (isDealerStock && vehicle.reservedBy && isAdmin) {
      return `Stock ${vehicle.reservedBy}`;
    }
    return vehicle.location;
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
            {!isVirtualStock && <p className="text-sm text-gray-500">{vehicle.trim}</p>}
          </div>
          <Badge variant="outline" className={statusColors[vehicle.status]}>
            {vehicle.status === 'delivered' ? 'Disponibile' : statusTranslations[vehicle.status]}
          </Badge>
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
                {estimatedArrival.formattedRange}
              </span>
            </div>
          )}
          {!isVirtualStock && vehicle.transmission && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cambio:</span>
              <span>{vehicle.transmission}</span>
            </div>
          )}
          {vehicle.reservedBy && vehicle.status === 'reserved' && !isAdmin && (
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
        
        {!isDealer && (
          <div className="mt-3 pt-2 border-t flex justify-end space-x-2">
            <button 
              onClick={(e) => handleActionClick(e, onDuplicate)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              aria-label="Duplica veicolo"
            >
              <Copy className="h-4 w-4" />
            </button>
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
        )}
        
        {isDealer && vehicle.status === 'available' && (
          <div className="mt-3 pt-2 border-t flex justify-end space-x-2">
            {onCreateQuote && (
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateQuote(vehicle);
                }}
                className="flex items-center gap-1"
              >
                <FileCheck className="h-4 w-4" />
                <span>Preventivo</span>
              </Button>
            )}
            {onReserve && (
              <Button 
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onReserve(vehicle);
                }}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Prenota</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
