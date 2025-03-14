
import React from 'react';
import { Vehicle } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';

interface VehicleDetailsContentProps {
  vehicle: Vehicle;
}

const VehicleDetailsContent: React.FC<VehicleDetailsContentProps> = ({ vehicle }) => {
  const formattedDate = vehicle.dateAdded ? formatDate(new Date(vehicle.dateAdded)) : 'N/A';
  const isVirtualStock = vehicle.location === 'Stock Virtuale';
  const isStockCMC = vehicle.location === 'Stock CMC';
  const shouldHideDefaultImage = isVirtualStock || isStockCMC;
  
  // Format reservation details
  const reservationDate = vehicle.reservationTimestamp 
    ? formatDate(new Date(vehicle.reservationTimestamp)) 
    : null;
    
  return (
    <div className="space-y-4 pt-2">
      {/* Vehicle image - show custom image if available, otherwise show default */}
      {vehicle.customImageUrl ? (
        <div className="flex justify-center mb-4">
          <img 
            src={vehicle.customImageUrl} 
            alt={`${vehicle.model} ${vehicle.trim || ''}`} 
            className="rounded-md object-cover max-h-[250px] w-auto"
          />
        </div>
      ) : (!shouldHideDefaultImage && vehicle.imageUrl && (
        <div className="flex justify-center mb-4">
          <img 
            src={vehicle.imageUrl} 
            alt={`${vehicle.model} ${vehicle.trim || ''}`} 
            className="rounded-md object-cover max-h-[250px] w-auto"
          />
        </div>
      ))}
      
      {/* Virtual Configuration Card */}
      {vehicle.virtualConfig && isVirtualStock && vehicle.status === 'reserved' && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-lg mb-2">Configurazione Virtuale</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm">
                <span className="font-medium">Allestimento:</span> {vehicle.virtualConfig.trim}
              </div>
              <div className="text-sm">
                <span className="font-medium">Alimentazione:</span> {vehicle.virtualConfig.fuelType}
              </div>
              <div className="text-sm">
                <span className="font-medium">Colore:</span> {vehicle.virtualConfig.exteriorColor}
              </div>
              <div className="text-sm">
                <span className="font-medium">Trasmissione:</span> {vehicle.virtualConfig.transmission}
              </div>
              <div className="text-sm col-span-2">
                <span className="font-medium">Prezzo:</span> €{vehicle.virtualConfig.price?.toLocaleString('it-IT')}
              </div>
              {vehicle.virtualConfig.accessories && vehicle.virtualConfig.accessories.length > 0 && (
                <div className="text-sm col-span-2">
                  <span className="font-medium">Accessori:</span> {vehicle.virtualConfig.accessories.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Details */}
      <div>
        <h3 className="font-semibold mb-2">Dettagli Base</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <span className="font-medium">Modello:</span> {vehicle.model}
          </div>
          {!isVirtualStock && (
            <>
              <div className="text-sm">
                <span className="font-medium">Allestimento:</span> {vehicle.trim || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Alimentazione:</span> {vehicle.fuelType || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Colore:</span> {vehicle.exteriorColor || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Trasmissione:</span> {vehicle.transmission || 'N/A'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Telaio:</span> {vehicle.telaio || 'N/A'}
              </div>
            </>
          )}
          <div className="text-sm">
            <span className="font-medium">Data Aggiunta:</span> {formattedDate}
          </div>
          <div className="text-sm">
            <span className="font-medium">Posizione:</span> {vehicle.location}
          </div>
          {isVirtualStock && vehicle.originalStock && (
            <div className="text-sm">
              <span className="font-medium">Stock Origine:</span> {vehicle.originalStock}
            </div>
          )}
          {isVirtualStock && vehicle.estimatedArrivalDays && (
            <div className="text-sm">
              <span className="font-medium">Arrivo Stimato:</span> {vehicle.estimatedArrivalDays} giorni
            </div>
          )}
          {!isVirtualStock && (
            <div className="text-sm">
              <span className="font-medium">Prezzo:</span> {vehicle.price ? `€${vehicle.price.toLocaleString('it-IT')}` : 'N/A'}
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Stato:</span> {vehicle.status}
          </div>
        </div>
      </div>
      
      {/* Accessories Section */}
      {!isVirtualStock && vehicle.accessories && vehicle.accessories.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Accessori</h3>
            <ul className="text-sm list-disc pl-5">
              {vehicle.accessories.map((accessory, index) => (
                <li key={index}>{accessory}</li>
              ))}
            </ul>
          </div>
        </>
      )}
      
      {/* Reservation Details Section */}
      {vehicle.status === 'reserved' && vehicle.reservedBy && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Dettagli Prenotazione</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm">
                <span className="font-medium">Prenotato Da:</span> {vehicle.reservedBy}
              </div>
              {reservationDate && (
                <div className="text-sm">
                  <span className="font-medium">Data Prenotazione:</span> {reservationDate}
                </div>
              )}
              {vehicle.reservationDestination && (
                <div className="text-sm">
                  <span className="font-medium">Destinazione:</span> {vehicle.reservationDestination}
                </div>
              )}
            </div>
          </div>
          
          {/* Reserved Accessories */}
          {vehicle.reservedAccessories && vehicle.reservedAccessories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Accessori Prenotati</h3>
              <ul className="text-sm list-disc pl-5">
                {vehicle.reservedAccessories.map((accessory, index) => (
                  <li key={index}>{accessory}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VehicleDetailsContent;
