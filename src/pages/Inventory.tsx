
import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { vehicles } from '@/data/mockData';
import VehicleList from '@/components/vehicles/VehicleList';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import { Vehicle, Filter as VehicleFilter } from '@/types';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddVehicleForm from '@/components/vehicles/AddVehicleForm';

const Inventory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddVehicleDrawer, setShowAddVehicleDrawer] = useState(false);
  const [inventory, setInventory] = useState<Vehicle[]>(vehicles);
  const [activeFilters, setActiveFilters] = useState<VehicleFilter | null>(null);
  
  const filteredVehicles = activeFilters 
    ? filterVehicles(inventory, activeFilters)
    : inventory;
    
  const availableVehicles = filteredVehicles.filter(v => v.status === 'available');
  const reservedVehicles = filteredVehicles.filter(v => v.status === 'reserved');
  const soldVehicles = filteredVehicles.filter(v => v.status === 'sold');
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const closeAddVehicleDrawer = () => {
    setShowAddVehicleDrawer(false);
  };

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    setInventory(prev => prev.map(vehicle => 
      vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
    ));
  };
  
  const handleVehicleDelete = (vehicleId: string) => {
    setInventory(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
  };
  
  const handleVehicleAdd = (newVehicle: Vehicle) => {
    setInventory(prev => [...prev, newVehicle]);
    closeAddVehicleDrawer();
  };
  
  const handleFiltersChange = (filters: VehicleFilter) => {
    setActiveFilters(filters);
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventario Veicoli</h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          <button 
            onClick={toggleFilters}
            className="md:hidden flex items-center px-4 py-2 border border-gray-200 rounded-md"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Nascondi Filtri' : 'Mostra Filtri'}
          </button>
          
          <Drawer open={showAddVehicleDrawer} onOpenChange={setShowAddVehicleDrawer}>
            <DrawerTrigger asChild>
              <button 
                className="flex items-center px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => setShowAddVehicleDrawer(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Veicolo
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-6 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Aggiungi Nuovo Veicolo</h2>
                <AddVehicleForm onComplete={handleVehicleAdd} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`
          ${showFilters ? 'block' : 'hidden'}
          md:block w-full md:w-64 flex-shrink-0
        `}>
          <VehicleFilters onFiltersChange={handleFiltersChange} />
        </div>
        
        <div className="flex-1">
          <Tabs defaultValue="available">
            <TabsList className="mb-6">
              <TabsTrigger value="available">
                Disponibili ({availableVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="reserved">
                Prenotati ({reservedVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="sold">
                Venduti ({soldVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Tutti ({filteredVehicles.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              <VehicleList 
                vehicles={availableVehicles} 
                onVehicleUpdated={handleVehicleUpdate}
                onVehicleDeleted={handleVehicleDelete}
              />
            </TabsContent>
            
            <TabsContent value="reserved">
              <VehicleList 
                vehicles={reservedVehicles} 
                onVehicleUpdated={handleVehicleUpdate}
                onVehicleDeleted={handleVehicleDelete}
              />
            </TabsContent>
            
            <TabsContent value="sold">
              <VehicleList 
                vehicles={soldVehicles} 
                onVehicleUpdated={handleVehicleUpdate}
                onVehicleDeleted={handleVehicleDelete}
              />
            </TabsContent>
            
            <TabsContent value="all">
              <VehicleList 
                vehicles={filteredVehicles} 
                onVehicleUpdated={handleVehicleUpdate}
                onVehicleDeleted={handleVehicleDelete}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Funzione per filtrare i veicoli in base ai filtri attivi
const filterVehicles = (vehicles: Vehicle[], filters: VehicleFilter): Vehicle[] => {
  return vehicles.filter(vehicle => {
    // Filtra per modello
    if (filters.models.length > 0 && !filters.models.includes(vehicle.model)) {
      return false;
    }
    
    // Filtra per allestimento
    if (filters.trims.length > 0 && !filters.trims.includes(vehicle.trim)) {
      return false;
    }
    
    // Filtra per tipo di carburante
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(vehicle.fuelType)) {
      return false;
    }
    
    // Filtra per colore
    if (filters.colors.length > 0 && !filters.colors.includes(vehicle.exteriorColor)) {
      return false;
    }
    
    // Filtra per posizione
    if (filters.locations.length > 0 && !filters.locations.includes(vehicle.location)) {
      return false;
    }
    
    // Filtra per prezzo
    if (vehicle.price < filters.priceRange[0] || vehicle.price > filters.priceRange[1]) {
      return false;
    }
    
    // Filtra per stato
    if (filters.status.length > 0 && !filters.status.includes(vehicle.status)) {
      return false;
    }
    
    return true;
  });
};

export default Inventory;
