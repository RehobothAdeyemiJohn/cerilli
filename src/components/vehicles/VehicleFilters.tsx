
import React, { useState, useEffect } from 'react';
import { Search, Check, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Filter, Vehicle } from '@/types';

interface VehicleFiltersProps {
  onFiltersChange?: (filters: Filter) => void;
  inventory: Vehicle[]; // Pass inventory to dynamically generate filters
}

const VehicleFilters = ({ onFiltersChange, inventory = [] }: VehicleFiltersProps) => {
  // Extract unique values from inventory
  const getUniqueValues = (key: keyof Vehicle): string[] => {
    if (!inventory || inventory.length === 0) return [];
    
    const values = inventory.map(vehicle => String(vehicle[key]));
    return [...new Set(values)].filter(Boolean);
  };
  
  const models = getUniqueValues('model');
  const trims = getUniqueValues('trim');
  const fuelTypes = getUniqueValues('fuelType');
  const colors = getUniqueValues('exteriorColor');
  const locations = getUniqueValues('location');
  
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
              {models.map((model) => (
                <div 
                  key={model} 
                  className="flex items-center"
                  onClick={() => toggleModel(model)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedModels.includes(model) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedModels.includes(model) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{model}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="trim">
          <AccordionTrigger>Allestimento</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {trims.map((trim) => (
                <div 
                  key={trim} 
                  className="flex items-center"
                  onClick={() => toggleTrim(trim)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedTrims.includes(trim) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedTrims.includes(trim) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{trim}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="fuelType">
          <AccordionTrigger>Alimentazione</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {fuelTypes.map((fuelType) => (
                <div 
                  key={fuelType} 
                  className="flex items-center"
                  onClick={() => toggleFuelType(fuelType)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedFuelTypes.includes(fuelType) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedFuelTypes.includes(fuelType) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{fuelType}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="color">
          <AccordionTrigger>Colore</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {colors.map((color) => (
                <div 
                  key={color} 
                  className="flex items-center"
                  onClick={() => toggleColor(color)}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedColors.includes(color) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedColors.includes(color) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{color}</span>
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
