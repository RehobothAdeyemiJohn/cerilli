
import React, { useState, useEffect } from 'react';
import { Search, Check, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Filter, Vehicle, VehicleModel, VehicleTrim, FuelType, ExteriorColor } from '@/types';
import { modelsApi, trimsApi, fuelTypesApi, colorsApi } from '@/api/localStorage';
import { useQuery } from '@tanstack/react-query';

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
      
      <div className="relative mb-4">
        <Input
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Cerca telaio, modello..."
          className="pr-10"
        />
        {searchText && (
          <button 
            onClick={() => setSearchText('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FilterX className="h-4 w-4" />
          </button>
        )}
        {!searchText && (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
      </div>
      
      <Accordion type="multiple" defaultValue={['model']}>
        <AccordionItem value="model">
          <AccordionTrigger>Modello</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {modelSettings.map((modelSetting: VehicleModel) => (
                <div 
                  key={modelSetting.id} 
                  className="flex items-center"
                  onClick={() => toggleModel(modelSetting.name)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedModels.includes(modelSetting.name) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedModels.includes(modelSetting.name) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{modelSetting.name}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="trim">
          <AccordionTrigger>Allestimento</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {trimSettings.map((trimSetting: VehicleTrim) => (
                <div 
                  key={trimSetting.id} 
                  className="flex items-center"
                  onClick={() => toggleTrim(trimSetting.name)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedTrims.includes(trimSetting.name) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedTrims.includes(trimSetting.name) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{trimSetting.name}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="fuelType">
          <AccordionTrigger>Alimentazione</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {fuelTypeSettings.map((fuelTypeSetting: FuelType) => (
                <div 
                  key={fuelTypeSetting.id} 
                  className="flex items-center"
                  onClick={() => toggleFuelType(fuelTypeSetting.name)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedFuelTypes.includes(fuelTypeSetting.name) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedFuelTypes.includes(fuelTypeSetting.name) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{fuelTypeSetting.name}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="color">
          <AccordionTrigger>Colore</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {colorSettings.map((colorSetting: ExteriorColor) => (
                <div 
                  key={colorSetting.id} 
                  className="flex items-center"
                  onClick={() => toggleColor(colorSetting.name)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedColors.includes(colorSetting.name) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedColors.includes(colorSetting.name) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{colorSetting.name}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="location">
          <AccordionTrigger>Posizione</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {locations.map((location) => (
                <div 
                  key={location} 
                  className="flex items-center"
                  onClick={() => toggleLocation(location)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedLocations.includes(location) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedLocations.includes(location) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{location}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
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
