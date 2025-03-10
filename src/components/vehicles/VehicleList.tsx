
import React, { useState } from 'react';
import VehicleCard from './VehicleCard';
import { Vehicle, Filter } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface VehicleListProps {
  vehicles: Vehicle[];
  filter?: Filter;
}

const VehicleList = ({ vehicles, filter }: VehicleListProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };
  
  const closeDialog = () => {
    setSelectedVehicle(null);
  };
  
  // Apply filters if provided
  const filteredVehicles = vehicles;
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle} 
            onClick={handleVehicleClick}
          />
        ))}
      </div>
      
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No vehicles found matching your criteria</p>
        </div>
      )}
      
      <Dialog open={!!selectedVehicle} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVehicle.model} {selectedVehicle.trim}</DialogTitle>
                <DialogDescription>
                  Vehicle details and available actions
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <img 
                  src={selectedVehicle.imageUrl || '/placeholder.svg'} 
                  alt={`${selectedVehicle.model} ${selectedVehicle.trim}`}
                  className="w-full h-48 object-cover rounded-md"
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Model</p>
                    <p>{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Trim</p>
                    <p>{selectedVehicle.trim}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fuel Type</p>
                    <p>{selectedVehicle.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Color</p>
                    <p>{selectedVehicle.exteriorColor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="font-bold text-primary">
                      €{selectedVehicle.price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>{selectedVehicle.location}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">Accessories</p>
                  <ul className="mt-1 space-y-1">
                    {selectedVehicle.accessories.map((accessory, idx) => (
                      <li key={idx} className="text-sm flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        {accessory}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary/90">
                    Create Quote
                  </button>
                  <button className="flex-1 border border-gray-200 py-2 rounded-md hover:bg-gray-50">
                    Order Vehicle
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VehicleList;
