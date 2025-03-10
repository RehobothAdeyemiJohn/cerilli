
import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { vehicles } from '@/data/mockData';
import VehicleList from '@/components/vehicles/VehicleList';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import { Vehicle } from '@/types';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddVehicleForm from '@/components/vehicles/AddVehicleForm';

const Inventory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddVehicleDrawer, setShowAddVehicleDrawer] = useState(false);
  
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const reservedVehicles = vehicles.filter(v => v.status === 'reserved');
  const soldVehicles = vehicles.filter(v => v.status === 'sold');
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const closeAddVehicleDrawer = () => {
    setShowAddVehicleDrawer(false);
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Vehicle Inventory</h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          <button 
            onClick={toggleFilters}
            className="md:hidden flex items-center px-4 py-2 border border-gray-200 rounded-md"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <Drawer open={showAddVehicleDrawer} onOpenChange={setShowAddVehicleDrawer}>
            <DrawerTrigger asChild>
              <button 
                className="flex items-center px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => setShowAddVehicleDrawer(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-6 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
                <AddVehicleForm onComplete={closeAddVehicleDrawer} />
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
          <VehicleFilters />
        </div>
        
        <div className="flex-1">
          <Tabs defaultValue="available">
            <TabsList className="mb-6">
              <TabsTrigger value="available">
                Available ({availableVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="reserved">
                Reserved ({reservedVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="sold">
                Sold ({soldVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({vehicles.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              <VehicleList vehicles={availableVehicles} />
            </TabsContent>
            
            <TabsContent value="reserved">
              <VehicleList vehicles={reservedVehicles} />
            </TabsContent>
            
            <TabsContent value="sold">
              <VehicleList vehicles={soldVehicles} />
            </TabsContent>
            
            <TabsContent value="all">
              <VehicleList vehicles={vehicles} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
