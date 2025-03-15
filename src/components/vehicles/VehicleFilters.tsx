
import React, { useState, useEffect } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Filter, Vehicle, Dealer } from '@/types';
import { modelsApi, trimsApi, fuelTypesApi, colorsApi } from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

// Import our filter components
import SearchFilter from './filters/SearchFilter';
import ModelFilter from './filters/ModelFilter';
import TrimFilter from './filters/TrimFilter';
import FuelTypeFilter from './filters/FuelTypeFilter';
import ColorFilter from './filters/ColorFilter';
import LocationFilter from './filters/LocationFilter';
import DealerFilter from './filters/DealerFilter';

interface VehicleFiltersProps {
  onFiltersChange?: (filters: Filter) => void;
  inventory: Vehicle[]; // Still need inventory for locations
  dealers?: Dealer[]; // Add dealers prop
  showDealerFilter?: boolean; // Flag to show/hide dealer filter
  isDealerStock?: boolean; // Flag to identify if this is Stock Dealer page
}

const VehicleFilters = ({ 
  onFiltersChange, 
  inventory = [], 
  dealers = [],
  showDealerFilter = false,
  isDealerStock = false
}: VehicleFiltersProps) => {
  const { user } = useAuth();
  
  // Fetch settings data using React Query
  const { data: modelSettings = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
  });
  
  const { data: trimSettings = [] } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll,
  });
  
  const { data: fuelTypeSettings = [] } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll,
  });
  
  const { data: colorSettings = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll,
  });
  
  // Extract locations from inventory
  const getUniqueLocations = (): string[] => {
    if (!inventory || inventory.length === 0) return [];
    
    const values = inventory.map(vehicle => String(vehicle.location));
    return [...new Set(values)].filter(Boolean);
  };
  
  const locations = getUniqueLocations();
  
  // State for selected filters
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTrims, setSelectedTrims] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDealers, setSelectedDealers] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // Reset filters when inventory changes
  useEffect(() => {
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedFuelTypes([]);
    setSelectedColors([]);
    setSelectedLocations([]);
    setSelectedDealers([]);
  }, []);
  
  // Callback to notify parent component when filters change
  useEffect(() => {
    if (onFiltersChange) {
      const filters: Filter = {
        models: selectedModels,
        trims: selectedTrims,
        fuelTypes: selectedFuelTypes,
        colors: selectedColors,
        locations: selectedLocations,
        dealers: selectedDealers,
        priceRange: [0, 1000000], // Default range (not used anymore)
        status: [],
        searchText: searchText
      };
      onFiltersChange(filters);
    }
  }, [
    selectedModels,
    selectedTrims,
    selectedFuelTypes,
    selectedColors,
    selectedLocations,
    selectedDealers,
    searchText,
    onFiltersChange
  ]);
  
  // Toggle selection functions
  const toggleModel = (model: string) => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model) 
        : [...prev, model]
    );
  };
  
  const toggleTrim = (trim: string) => {
    setSelectedTrims(prev => 
      prev.includes(trim) 
        ? prev.filter(t => t !== trim) 
        : [...prev, trim]
    );
  };
  
  const toggleFuelType = (fuelType: string) => {
    setSelectedFuelTypes(prev => 
      prev.includes(fuelType) 
        ? prev.filter(f => f !== fuelType) 
        : [...prev, fuelType]
    );
  };
  
  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
  };
  
  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location) 
        : [...prev, location]
    );
  };
  
  const toggleDealer = (dealerName: string) => {
    setSelectedDealers(prev => 
      prev.includes(dealerName) 
        ? prev.filter(d => d !== dealerName) 
        : [...prev, dealerName]
    );
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const clearSearch = () => {
    setSearchText('');
  };
  
  const clearFilters = () => {
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedFuelTypes([]);
    setSelectedColors([]);
    setSelectedLocations([]);
    setSelectedDealers([]);
    setSearchText('');
  };
  
  return (
    <div className="bg-white rounded-md border p-4">
      <h2 className="font-medium mb-4">Filtri</h2>
      
      <SearchFilter 
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onClearSearch={clearSearch}
      />
      
      <Accordion type="multiple" defaultValue={['model']}>
        {/* Conditionally render DealerFilter before ModelFilter for Stock Dealer page */}
        {isDealerStock && showDealerFilter && user?.type === 'admin' && (
          <DealerFilter 
            dealers={dealers}
            selectedDealers={selectedDealers}
            onToggleDealer={toggleDealer}
          />
        )}
        
        <ModelFilter 
          models={modelSettings}
          selectedModels={selectedModels}
          onToggleModel={toggleModel}
        />
        
        {/* Render DealerFilter after ModelFilter for other pages */}
        {!isDealerStock && showDealerFilter && user?.type === 'admin' && (
          <DealerFilter 
            dealers={dealers}
            selectedDealers={selectedDealers}
            onToggleDealer={toggleDealer}
          />
        )}
        
        <TrimFilter 
          trims={trimSettings}
          selectedTrims={selectedTrims}
          onToggleTrim={toggleTrim}
        />
        
        <FuelTypeFilter 
          fuelTypes={fuelTypeSettings}
          selectedFuelTypes={selectedFuelTypes}
          onToggleFuelType={toggleFuelType}
        />
        
        <ColorFilter 
          colors={colorSettings}
          selectedColors={selectedColors}
          onToggleColor={toggleColor}
        />
        
        <LocationFilter 
          locations={locations}
          selectedLocations={selectedLocations}
          onToggleLocation={toggleLocation}
        />
      </Accordion>
      
      <button
        onClick={clearFilters}
        className="w-full mt-4 py-2 text-sm text-center border border-gray-200 rounded-md hover:bg-gray-50"
      >
        Cancella Filtri
      </button>
    </div>
  );
};

export default VehicleFilters;
