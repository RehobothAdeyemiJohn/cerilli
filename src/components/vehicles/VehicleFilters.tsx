
import React, { useState, useEffect } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Filter, Vehicle } from '@/types';
import { modelsApi, trimsApi, fuelTypesApi, colorsApi } from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';

// Import our filter components
import SearchFilter from './filters/SearchFilter';
import ModelFilter from './filters/ModelFilter';
import TrimFilter from './filters/TrimFilter';
import FuelTypeFilter from './filters/FuelTypeFilter';
import ColorFilter from './filters/ColorFilter';
import LocationFilter from './filters/LocationFilter';

interface VehicleFiltersProps {
  onFiltersChange?: (filters: Filter) => void;
  inventory: Vehicle[]; // Still need inventory for locations
}

const VehicleFilters = ({ onFiltersChange, inventory = [] }: VehicleFiltersProps) => {
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
  const [searchText, setSearchText] = useState('');
  
  // Reset filters when inventory changes
  useEffect(() => {
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedFuelTypes([]);
    setSelectedColors([]);
    setSelectedLocations([]);
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
        <ModelFilter 
          models={modelSettings}
          selectedModels={selectedModels}
          onToggleModel={toggleModel}
        />
        
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
