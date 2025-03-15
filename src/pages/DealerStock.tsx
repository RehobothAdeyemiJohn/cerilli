
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { Vehicle, Filter, Dealer } from '@/types';
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
  const [activeFilters, setActiveFilters] = useState<Filter | null>(null);
  
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
  
  const {
    data: dealers = [],
    isLoading: loadingDealers
  } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    staleTime: 0,
  });
  
  const dealerStockVehicles = vehicles.filter(v => {
    if (v.location !== 'Stock Dealer') return false;
    
    // If not admin, only show vehicles for this dealer
    if (user?.type !== 'admin') {
      return v.reservedBy === user?.dealerName;
    }
    
    // For admins, show all dealer stock vehicles (filtering will be handled by the filterVehicles function)
    return true;
  });

  const filteredVehicles = activeFilters 
    ? filterVehicles(dealerStockVehicles, activeFilters)
    : dealerStockVehicles;
  
  const availableVehicles = filteredVehicles.filter(v => 
    v.status === 'available' || v.status === 'delivered'
  );
  
  const reservedVehicles = filteredVehicles.filter(v => v.status === 'reserved');
  
  const handleCreateQuote = (vehicle: Vehicle) => {
    console.log('Creating quote for vehicle:', vehicle);
    navigate('/quotes', { 
      state: { 
        fromInventory: true,
        vehicleId: vehicle.id 
      } 
    });
  };
  
  const handleViewVehicle = (vehicleId: string) => {
    navigate(`/inventory?vehicleId=${vehicleId}`);
  };

  const handleFiltersChange = (filters: Filter) => {
    setActiveFilters(filters);
  };
  
  const handleVehicleUpdated = () => refetch();
  const handleVehicleDeleted = async () => { await refetch(); return Promise.resolve(); };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Stock Dealer</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <VehicleFilters 
            inventory={dealerStockVehicles}
            onFiltersChange={handleFiltersChange}
            dealers={dealers}
            showDealerFilter={user?.type === 'admin'}
            isDealerStock={true}
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
                  onCreateQuote={handleCreateQuote}
                  onReserve={(vehicle) => {
                    // Navigate to inventory with this vehicle ID for reservation
                    navigate(`/inventory?vehicleId=${vehicle.id}&action=reserve`);
                  }}
                  isDealerStock={true}
                  isVirtualStock={false}
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
                  isDealerStock={true}
                  isVirtualStock={false}
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
                  onCreateQuote={handleCreateQuote}
                  isDealerStock={true}
                  isVirtualStock={false}
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
