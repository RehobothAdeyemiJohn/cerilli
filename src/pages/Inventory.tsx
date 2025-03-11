import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { filterVehicles } from '@/utils/vehicleFilters';
import VehicleList from '@/components/vehicles/VehicleList';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import InventoryHeader from '@/components/vehicles/InventoryHeader';
import { Filter as VehicleFilter, Vehicle } from '@/types';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddVehicleForm from '@/components/vehicles/AddVehicleForm';
import { toast } from '@/hooks/use-toast';

const Inventory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddVehicleDrawer, setShowAddVehicleDrawer] = useState(false);
  
  const {
    inventory,
    isLoading,
    error,
    activeFilters,
    setActiveFilters,
    locationOptions,
    handleVehicleUpdate,
    handleVehicleDelete,
  } = useInventory();
  
  const filteredVehicles = activeFilters 
    ? filterVehicles(inventory, activeFilters)
    : inventory;
    
  const stockCMCVehicles = filteredVehicles.filter(v => v.status === 'available' && v.location === 'Stock CMC');
  const stockVirtualeVehicles = filteredVehicles.filter(v => v.status === 'available' && v.location === 'Stock Virtuale');
  const reservedVehicles = filteredVehicles.filter(v => v.status === 'reserved');
  const soldVehicles = filteredVehicles.filter(v => v.status === 'sold');
  
  const toggleFilters = () => setShowFilters(!showFilters);
  
  const handleVehicleAdd = (newVehicle: Vehicle | null) => {
    if (!newVehicle) {
      setShowAddVehicleDrawer(false);
      return;
    }
    
    setShowAddVehicleDrawer(false);
    toast({
      title: "Veicolo Aggiunto",
      description: `${newVehicle.model} ${newVehicle.trim} è stato aggiunto all'inventario.`,
    });
  };
  
  const handleFiltersChange = (filters: VehicleFilter) => {
    setActiveFilters(filters);
  };
  
  if (isLoading) {
    return <div className="container mx-auto py-6 px-4">Caricamento inventario...</div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Si è verificato un errore durante il caricamento dell'inventario. Riprova più tardi.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <InventoryHeader 
        onToggleFilters={toggleFilters}
        showFilters={showFilters}
        onAddVehicle={() => setShowAddVehicleDrawer(true)}
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`
          ${showFilters ? 'block' : 'hidden'}
          md:block w-full md:w-64 flex-shrink-0
        `}>
          <VehicleFilters 
            inventory={inventory}
            onFiltersChange={handleFiltersChange}
          />
        </div>
        
        <div className="flex-1">
          <Tabs defaultValue="stock-cmc">
            <TabsList className="mb-6">
              <TabsTrigger value="stock-cmc">
                Stock CMC ({stockCMCVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="stock-virtuale">
                Stock Virtuale ({stockVirtualeVehicles.length})
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
            
            <TabsContent value="stock-cmc">
              <VehicleList 
                vehicles={stockCMCVehicles} 
                onVehicleUpdated={handleVehicleUpdate}
                onVehicleDeleted={handleVehicleDelete}
              />
            </TabsContent>

            <TabsContent value="stock-virtuale">
              <VehicleList 
                vehicles={stockVirtualeVehicles} 
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
      
      <Drawer open={showAddVehicleDrawer} onOpenChange={setShowAddVehicleDrawer}>
        <DrawerContent>
          <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Aggiungi Nuovo Veicolo</h2>
            <AddVehicleForm 
              onComplete={handleVehicleAdd}
              locationOptions={locationOptions} 
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Inventory;
