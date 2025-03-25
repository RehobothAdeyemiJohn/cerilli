
import React from 'react';
import { Vehicle } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Settings, Calendar, MapPin, Palette, Fuel, Truck, Key, Tag, BookUser } from 'lucide-react';
import VehicleDetailsContent from './VehicleDetailsContent';
import ReserveVehicleForm from '../ReserveVehicleForm';
import ReserveVirtualVehicleForm from '../ReserveVirtualVehicleForm';
import CancelReservationForm from '../CancelReservationForm';
import { calculateEstimatedArrival } from '@/lib/utils';

interface VehicleDialogContentProps {
  vehicle: Vehicle;
  showQuoteForm: boolean;
  showReserveForm: boolean;
  showVirtualReserveForm: boolean;
  showCancelReservationForm: boolean;
  isSubmitting: boolean;
  onCreateQuote: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  onConfirm: () => Promise<void>;
  userCanReserveVehicles: boolean;
  userCanCreateQuotes: boolean;
}

const VehicleDialogContent: React.FC<VehicleDialogContentProps> = ({
  vehicle,
  showQuoteForm,
  showReserveForm,
  showVirtualReserveForm,
  showCancelReservationForm,
  isSubmitting,
  onCreateQuote,
  onCancel,
  onSubmit,
  onConfirm,
  userCanReserveVehicles,
  userCanCreateQuotes
}) => {
  const estimatedArrival = 
    vehicle.location === 'Stock Virtuale' ? calculateEstimatedArrival(vehicle) : null;
  
  const renderVehicleConfig = () => {
    if (vehicle.virtualConfig) {
      return (
        <div className="border p-3 rounded-md mb-4 bg-slate-50">
          <h3 className="font-medium mb-2 flex items-center text-blue-600">
            <Settings className="h-4 w-4 mr-1" /> Configurazione Veicolo
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {vehicle.virtualConfig.trim && (
              <div className="flex justify-between">
                <span className="text-gray-500">Allestimento:</span>
                <span>{vehicle.virtualConfig.trim}</span>
              </div>
            )}
            {vehicle.virtualConfig.fuelType && (
              <div className="flex justify-between">
                <span className="text-gray-500">Alimentazione:</span>
                <span>{vehicle.virtualConfig.fuelType}</span>
              </div>
            )}
            {vehicle.virtualConfig.exteriorColor && (
              <div className="flex justify-between">
                <span className="text-gray-500">Colore Esterno:</span>
                <span>{vehicle.virtualConfig.exteriorColor}</span>
              </div>
            )}
            {vehicle.virtualConfig.transmission && (
              <div className="flex justify-between">
                <span className="text-gray-500">Trasmissione:</span>
                <span>{vehicle.virtualConfig.transmission}</span>
              </div>
            )}
            {vehicle.virtualConfig.accessories && vehicle.virtualConfig.accessories.length > 0 && (
              <div className="mt-1">
                <span className="text-gray-500 block mb-1">Accessori:</span>
                <div className="pl-2">
                  {vehicle.virtualConfig.accessories.map((accessory, index) => (
                    <div key={index} className="text-sm py-0.5">{accessory}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  if (showReserveForm) {
    return (
      <ReserveVehicleForm 
        vehicle={vehicle}
        onCancel={onCancel}
        onReservationComplete={onSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }
  if (showVirtualReserveForm) {
    return (
      <ReserveVirtualVehicleForm 
        vehicle={vehicle}
        onCancel={onCancel}
        onReservationComplete={onSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }
  
  if (showCancelReservationForm) {
    return (
      <CancelReservationForm 
        vehicle={vehicle}
        onCancel={onCancel}
        onConfirm={async () => {
          await onConfirm();
          return Promise.resolve();
        }}
        isSubmitting={isSubmitting}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Reservation dealer info */}
      {vehicle.status === 'reserved' && vehicle.reservedBy && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-amber-800">
            <BookUser className="h-4 w-4" />
            <span className="font-medium">Prenotato da: {vehicle.reservedBy}</span>
          </div>
          
          {vehicle.reservationTimestamp && (
            <div className="text-sm text-amber-700 mt-1">
              Data prenotazione: {new Date(vehicle.reservationTimestamp).toLocaleDateString()}
            </div>
          )}
          
          {vehicle.reservationDestination && (
            <div className="text-sm text-amber-700 mt-1">
              Destinazione: {vehicle.reservationDestination}
            </div>
          )}
        </div>
      )}
      
      {/* Vehicle configuration */}
      {renderVehicleConfig()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-3">Dettagli Veicolo</h3>
          
          <div className="space-y-2">
            {vehicle.trim && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Allestimento</div>
                  <div className="text-sm text-gray-600">{vehicle.trim}</div>
                </div>
              </div>
            )}
            
            {vehicle.fuelType && (
              <div className="flex items-start gap-2">
                <Fuel className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Alimentazione</div>
                  <div className="text-sm text-gray-600">{vehicle.fuelType}</div>
                </div>
              </div>
            )}
            
            {vehicle.exteriorColor && (
              <div className="flex items-start gap-2">
                <Palette className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Colore Esterno</div>
                  <div className="text-sm text-gray-600">{vehicle.exteriorColor}</div>
                </div>
              </div>
            )}
            
            {vehicle.transmission && (
              <div className="flex items-start gap-2">
                <Settings className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Trasmissione</div>
                  <div className="text-sm text-gray-600">{vehicle.transmission}</div>
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Posizione</div>
                <div className="text-sm text-gray-600">{vehicle.location}</div>
              </div>
            </div>
            
            {vehicle.originalStock && (
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Stock Originale</div>
                  <div className="text-sm text-gray-600">{vehicle.originalStock}</div>
                </div>
              </div>
            )}
            
            {estimatedArrival && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Data Arrivo Prevista</div>
                  <div className="text-sm text-gray-600">{estimatedArrival.formattedRange}</div>
                </div>
              </div>
            )}
            
            {vehicle.telaio && (
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Telaio</div>
                  <div className="text-sm text-gray-600">{vehicle.telaio}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Accessori</h3>
          
          {vehicle.accessories && vehicle.accessories.length > 0 ? (
            <div className="border rounded-md p-3">
              <div className="space-y-1">
                {vehicle.accessories.map((accessory, index) => (
                  <div key={index} className="text-sm py-0.5">
                    {accessory}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Nessun accessorio selezionato</div>
          )}
          
          {vehicle.reservedAccessories && vehicle.reservedAccessories.length > 0 && (
            <>
              <h3 className="font-medium mt-4 mb-3">Accessori Prenotati</h3>
              <div className="border rounded-md p-3 border-amber-200 bg-amber-50">
                <div className="space-y-1">
                  {vehicle.reservedAccessories.map((accessory, index) => (
                    <div key={index} className="text-sm py-0.5">
                      {accessory}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDialogContent;
