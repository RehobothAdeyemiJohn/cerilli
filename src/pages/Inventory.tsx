
import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { vehiclesApi } from '@/api/apiClient';
import VehicleList from '@/components/vehicles/VehicleList';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import { Vehicle, Filter as VehicleFilter } from '@/types';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddVehicleForm from '@/components/vehicles/AddVehicleForm';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Inventory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddVehicleDrawer, setShowAddVehicleDrawer] = useState(false);
  const [activeFilters, setActiveFilters] = useState<VehicleFilter | null>(null);
  
  const queryClient = useQueryClient();
  
  // Utilizziamo React Query per gestire i dati e la cache
  const { data: inventory = [], isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
  });
  
  // Mutazioni per aggiornare, eliminare e aggiungere veicoli
  const updateMutation = useMutation({
    mutationFn: (vehicle: Vehicle) => vehiclesApi.update(vehicle.id, vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
  
  const createMutation = useMutation({
    mutationFn: (vehicle: Omit<Vehicle, 'id'>) => vehiclesApi.create(vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
  
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
    updateMutation.mutate(updatedVehicle, {
      onSuccess: () => {
        toast({
          title: "Veicolo Aggiornato",
          description: `${updatedVehicle.model} ${updatedVehicle.trim} è stato aggiornato con successo.`,
        });
      },
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'aggiornamento del veicolo.",
            variant: "destructive",
          });
          console.error("Errore durante l'aggiornamento:", error);
        }
      }
    });
  };
  
  const handleVehicleDelete = (vehicleId: string) => {
    // Trova il veicolo prima di eliminarlo per il messaggio toast
    const vehicleToDelete = inventory.find(v => v.id === vehicleId);
    
    deleteMutation.mutate(vehicleId, {
      onSuccess: () => {
        if (vehicleToDelete) {
          toast({
            title: "Veicolo Eliminato",
            description: `${vehicleToDelete.model} ${vehicleToDelete.trim} è stato eliminato dall'inventario.`,
            variant: "destructive",
          });
        }
      },
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'eliminazione del veicolo.",
            variant: "destructive",
          });
          console.error("Errore durante l'eliminazione:", error);
        }
      }
    });
  };
  
  const handleVehicleAdd = (newVehicle: Vehicle | null) => {
    if (!newVehicle) {
      setShowAddVehicleDrawer(false);
      return;
    }
    
    // Rimuoviamo l'id perché sarà generato dal server
    const { id, ...vehicleWithoutId } = newVehicle;
    
    createMutation.mutate(vehicleWithoutId, {
      onSuccess: (createdVehicle) => {
        toast({
          title: "Veicolo Aggiunto",
          description: `${createdVehicle.model} ${createdVehicle.trim} è stato aggiunto all'inventario.`,
        });
        setShowAddVehicleDrawer(false);
      },
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'aggiunta del veicolo.",
            variant: "destructive",
          });
          console.error("Errore durante l'aggiunta:", error);
        }
      }
    });
  };
  
  const handleFiltersChange = (filters: VehicleFilter) => {
    setActiveFilters(filters);
  };
  
  // Mostrare un messaggio di loading o errore
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

const filterVehicles = (vehicles: Vehicle[], filters: VehicleFilter): Vehicle[] => {
  return vehicles.filter(vehicle => {
    if (filters.models.length > 0 && !filters.models.includes(vehicle.model)) {
      return false;
    }
    
    if (filters.trims.length > 0 && !filters.trims.includes(vehicle.trim)) {
      return false;
    }
    
    if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(vehicle.fuelType)) {
      return false;
    }
    
    if (filters.colors.length > 0 && !filters.colors.includes(vehicle.exteriorColor)) {
      return false;
    }
    
    if (filters.locations.length > 0 && !filters.locations.includes(vehicle.location)) {
      return false;
    }
    
    if (vehicle.price < filters.priceRange[0] || vehicle.price > filters.priceRange[1]) {
      return false;
    }
    
    if (filters.status.length > 0 && !filters.status.includes(vehicle.status)) {
      return false;
    }
    
    return true;
  });
};

export default Inventory;
