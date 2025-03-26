import React, { useState, useEffect } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Inventory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddVehicleDrawer, setShowAddVehicleDrawer] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer' || user?.type === 'vendor';
  const dealerName = user?.dealerName || '';
  const navigate = useNavigate();
  
  const {
    inventory,
    isLoading,
    error,
    refetch,
    activeFilters,
    setActiveFilters,
    locationOptions,
    handleVehicleUpdate,
    handleVehicleDelete,
    handleVehicleDuplicate,
    addVehicle,
  } = useInventory();
  
  const dealerFilteredInventory = React.useMemo(() => {
    if (!isDealer || !dealerName) return inventory;
    
    return inventory.filter(vehicle => {
      if (vehicle.status === 'available') return true;
      
      return vehicle.reservedBy === dealerName;
    });
  }, [inventory, isDealer, dealerName]);
  
  const filteredVehicles = activeFilters 
    ? filterVehicles(dealerFilteredInventory, activeFilters)
    : dealerFilteredInventory;
    
  const stockCMCVehicles = filteredVehicles.filter(v => v.status === 'available' && v.location === 'Stock CMC');
  const stockVirtualeVehicles = filteredVehicles.filter(v => v.status === 'available' && v.location === 'Stock Virtuale');
  const reservedVehicles = filteredVehicles.filter(v => v.status === 'reserved');
  
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // console.log('Page became visible, refreshing data');
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);
  
  const toggleFilters = () => setShowFilters(!showFilters);
  
  const handleVehicleAdd = async (newVehicle: any) => {
    if (!newVehicle) {
      setShowAddVehicleDrawer(false);
      return;
    }
    
    try {
      if (addVehicle) {
        const result = await addVehicle(newVehicle);
        console.log("Veicolo aggiunto con successo:", result);
        
        await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        refetch();
      }
      
      setShowAddVehicleDrawer(false);
      toast({
        title: "Veicolo Aggiunto",
        description: `${newVehicle.model} ${newVehicle.trim} è stato aggiunto all'inventario.`,
      });
    } catch (error) {
      console.error('Errore durante l\'aggiunta del veicolo:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta del veicolo.",
        variant: "destructive",
      });
    }
  };
  
  const handleFiltersChange = (filters: VehicleFilter) => {
    setActiveFilters(filters);
  };
  
  const handleVehicleDeleteWrapper = async (vehicleId: string): Promise<void> => {
    console.log('Inventory: handleVehicleDeleteWrapper called with ID:', vehicleId);
    try {
      await handleVehicleDelete(vehicleId);
      console.log('Vehicle deleted successfully, refreshing data');
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error('Error in handleVehicleDeleteWrapper:', error);
      throw error;
    }
  };

  const handleVehicleUpdateWrapper = () => {
    refetch();
  };
  
  const handleCreateQuote = (vehicle: Vehicle) => {
    console.log('Creating quote for vehicle:', vehicle);
    navigate(`/quotes?vehicleId=${vehicle.id }`);
  };

  const handleReserve = (vehicle: Vehicle) => {
    console.log('Reserving vehicle from Inventory page:', vehicle);
    
    if (vehicle) {
      console.log('Opening reservation form for vehicle:', vehicle.id, vehicle.location);
      
      const isVirtual = vehicle.location === 'Stock Virtuale';
      
      navigate('/inventory', {
        state: {
          reserveVehicle: true,
          vehicleId: vehicle.id,
          openDialog: true
        }
      });
      
      toast({
        title: `Apertura form di prenotazione`,
        description: `Prenotazione ${isVirtual ? 'virtuale' : ''} per ${vehicle.model}`,
      });
    }
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
        isDealer={isDealer}
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`
          ${showFilters ? 'block' : 'hidden'}
          md:block w-full md:w-64 flex-shrink-0
        `}>
          <VehicleFilters 
            inventory={dealerFilteredInventory}
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
              {!isDealer && (
                <TabsTrigger value="all">
                  Tutti ({filteredVehicles.length})
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="stock-cmc">
              <VehicleList 
                vehicles={stockCMCVehicles} 
                onVehicleUpdated={handleVehicleUpdateWrapper}
                onVehicleDeleted={handleVehicleDeleteWrapper}
                onCreateQuote={handleCreateQuote}
                onReserve={handleReserve}
                isVirtualStock={false}
              />
            </TabsContent>

            <TabsContent value="stock-virtuale">
              <VehicleList 
                vehicles={stockVirtualeVehicles} 
                onVehicleUpdated={handleVehicleUpdateWrapper}
                onVehicleDeleted={handleVehicleDeleteWrapper}
                onReserve={handleReserve}
                isVirtualStock={true}
              />
            </TabsContent>
            
            <TabsContent value="reserved">
              <VehicleList 
                vehicles={reservedVehicles} 
                onVehicleUpdated={handleVehicleUpdateWrapper}
                onVehicleDeleted={handleVehicleDeleteWrapper}
                isVirtualStock={false}
              />
            </TabsContent>
            
            {!isDealer && (
              <TabsContent value="all">
                <VehicleList 
                  vehicles={filteredVehicles} 
                  onVehicleUpdated={handleVehicleUpdateWrapper}
                  onVehicleDeleted={handleVehicleDeleteWrapper}
                  onCreateQuote={handleCreateQuote}
                  onReserve={handleReserve}
                  isVirtualStock={false}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      <Drawer open={showAddVehicleDrawer} onOpenChange={setShowAddVehicleDrawer}>
        <DrawerContent >
          <div className="px-6  max-w-2xl mx-auto h-screen py-10 overflow-y-auto" id='scrollbar-hide'>
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
