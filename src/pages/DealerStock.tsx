
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { Vehicle, Filter } from '@/types';
import { Button } from '@/components/ui/button';
import { FileText, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import VehicleList from '@/components/vehicles/VehicleList';
import { filterVehicles } from '@/utils/vehicleFilters';

const DealerStock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filter | null>(null);
  
  // Fetch all vehicles from Supabase
  const { 
    data: vehicles = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
    staleTime: 0,
  });
  
  // Filter vehicles with location "Stock Dealer" AND (if dealer) only show those reserved by this dealer
  const dealerStockVehicles = vehicles.filter(v => {
    // First filter by location
    if (v.location !== 'Stock Dealer') return false;
    
    // If user is admin, show all dealer stock vehicles
    if (user?.type === 'admin') return true;
    
    // If user is dealer or vendor, only show vehicles reserved by this dealer
    return v.reservedBy === user?.dealerName;
  });

  // Apply additional filters if provided
  const filteredVehicles = activeFilters 
    ? filterVehicles(dealerStockVehicles, activeFilters)
    : dealerStockVehicles;
  
  // Split vehicles by status
  // Delivered vehicles should be shown as available with a green ribbon
  const availableVehicles = filteredVehicles.filter(v => 
    v.status === 'available' || v.status === 'delivered'
  );
  
  const reservedVehicles = filteredVehicles.filter(v => v.status === 'reserved');
  
  const handleCreateQuote = (vehicle: Vehicle) => {
    // Navigate to quotes page with the selected vehicle info
    navigate('/quotes', { 
      state: { 
        fromInventory: true,
        vehicleId: vehicle.id 
      } 
    });
  };
  
  const handleViewVehicle = (vehicleId: string) => {
    // Open vehicle details dialog logic would go here
    // For now, we'll just navigate to the inventory with a filter
    navigate(`/inventory?vehicleId=${vehicleId}`);
  };

  const toggleFilters = () => setShowFilters(!showFilters);
  
  const handleFiltersChange = (filters: Filter) => {
    setActiveFilters(filters);
  };
  
  // Handles actions for the VehicleList component
  const handleVehicleUpdated = () => refetch();
  const handleVehicleDeleted = async () => { await refetch(); return Promise.resolve(); };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Stock Dealer</h1>
        <div className="flex mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFilters}
            className="mr-2"
          >
            {showFilters ? 'Nascondi Filtri' : 'Mostra Filtri'}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`
          ${showFilters ? 'block' : 'hidden'}
          md:block w-full md:w-64 flex-shrink-0
        `}>
          <VehicleFilters 
            inventory={dealerStockVehicles}
            onFiltersChange={handleFiltersChange}
          />
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
              <TabsTrigger value="all">
                Tutti ({filteredVehicles.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              {isLoading ? (
                <div className="text-center py-10">Caricamento veicoli...</div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  Errore durante il caricamento dei veicoli.
                </div>
              ) : (
                <VehicleList 
                  vehicles={availableVehicles}
                  onVehicleUpdated={handleVehicleUpdated}
                  onVehicleDeleted={handleVehicleDeleted}
                />
              )}
            </TabsContent>
            
            <TabsContent value="reserved">
              {isLoading ? (
                <div className="text-center py-10">Caricamento veicoli...</div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  Errore durante il caricamento dei veicoli.
                </div>
              ) : (
                <VehicleList 
                  vehicles={reservedVehicles}
                  onVehicleUpdated={handleVehicleUpdated}
                  onVehicleDeleted={handleVehicleDeleted}
                />
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-10">Caricamento veicoli...</div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  Errore durante il caricamento dei veicoli.
                </div>
              ) : (
                <VehicleList 
                  vehicles={filteredVehicles}
                  onVehicleUpdated={handleVehicleUpdated}
                  onVehicleDeleted={handleVehicleDeleted}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DealerStock;
