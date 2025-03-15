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
import FilterCard from '@/components/orders/filters/FilterCard';
import FilterSelectItem from '@/components/orders/filters/FilterSelectItem';

const DealerStock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeFilters, setActiveFilters] = useState<Filter | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<string | null>(null);
  
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
  
  useEffect(() => {
    console.log("Selected dealer state changed:", selectedDealer);
  }, [selectedDealer]);
  
  const dealerStockVehicles = vehicles.filter(v => {
    if (v.location !== 'Stock Dealer') return false;
    
    if (user?.type === 'admin') {
      if (selectedDealer) {
        const dealer = dealers.find(d => d.id === selectedDealer);
        return dealer && v.reservedBy === dealer.companyName;
      }
      return true;
    }
    
    return v.reservedBy === user?.dealerName;
  });

  const filteredVehicles = activeFilters 
    ? filterVehicles(dealerStockVehicles, activeFilters)
    : dealerStockVehicles;
  
  const availableVehicles = filteredVehicles.filter(v => 
    v.status === 'available' || v.status === 'delivered'
  );
  
  const reservedVehicles = filteredVehicles.filter(v => v.status === 'reserved');
  
  const handleCreateQuote = (vehicle: Vehicle) => {
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
  
  const dealerFilterOptions = dealers
    .filter(dealer => dealer.isActive)
    .sort((a, b) => a.companyName.localeCompare(b.companyName))
    .map(dealer => ({
      id: dealer.id,
      name: dealer.companyName
    }));
  
  const DealerFilter = () => {
    if (!user || user.type !== 'admin' || dealers.length === 0) return null;
    
    return (
      <div className="w-full mb-6">
        <FilterSelectItem
          label="Filtra per dealer"
          value={selectedDealer}
          onChange={(value) => {
            console.log("Filter value selected:", value);
            setSelectedDealer(value);
          }}
          options={dealerFilterOptions}
          placeholder="Tutti i dealer"
          className="w-full md:w-64"
        />
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Stock Dealer</h1>
        {user?.type === 'admin' && !loadingDealers && <DealerFilter />}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0">
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
