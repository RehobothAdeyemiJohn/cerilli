
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { Vehicle, Filter, Dealer } from '@/types';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Filter as FilterIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import VehicleList from '@/components/vehicles/VehicleList';
import { filterVehicles } from '@/utils/vehicleFilters';
import FilterCard from '@/components/orders/filters/FilterCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DealerStock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filter | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<string | null>(null);
  
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
  
  // Fetch all dealers for filtering
  const {
    data: dealers = [],
    isLoading: loadingDealers
  } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    staleTime: 0,
  });
  
  // Filter vehicles with location "Stock Dealer" AND filter by selected dealer if needed
  const dealerStockVehicles = vehicles.filter(v => {
    // First filter by location
    if (v.location !== 'Stock Dealer') return false;
    
    // If user is admin, show all dealer stock vehicles
    if (user?.type === 'admin') {
      // If a dealer filter is active, only show for that dealer
      if (selectedDealer) {
        const dealer = dealers.find(d => d.id === selectedDealer);
        return dealer && v.reservedBy === dealer.companyName;
      }
      return true;
    }
    
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
  
  // Clear all filters including dealer filter
  const handleClearAllFilters = () => {
    setActiveFilters(null);
    setSelectedDealer(null);
  };
  
  // Handles actions for the VehicleList component
  const handleVehicleUpdated = () => refetch();
  const handleVehicleDeleted = async () => { await refetch(); return Promise.resolve(); };
  
  // Format dealer filter options
  const dealerFilterOptions = dealers
    .filter(dealer => dealer.isActive)
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
  
  // For admin users, add a dealer quick filter dropdown
  const DealerFilter = () => {
    if (!user?.type === 'admin' || dealers.length === 0) return null;
    
    return (
      <div className="w-64">
        <Select
          value={selectedDealer || "all"}
          onValueChange={(value) => setSelectedDealer(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtra per dealer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i dealer</SelectItem>
            {dealerFilterOptions.map(dealer => (
              <SelectItem key={dealer.id} value={dealer.id}>
                {dealer.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Stock Dealer</h1>
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          {user?.type === 'admin' && !loadingDealers && <DealerFilter />}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFilters}
            className="flex items-center gap-1"
          >
            <FilterIcon className="h-4 w-4" />
            {showFilters ? 'Nascondi Filtri' : 'Mostra Filtri'}
          </Button>
          {(selectedDealer || activeFilters) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancella tutti i filtri
            </Button>
          )}
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
