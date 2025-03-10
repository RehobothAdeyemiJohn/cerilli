
import React, { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  getModels, 
  getTrims, 
  getFuelTypes, 
  getColors,
  getLocations,
  getPriceRange
} from '@/data/mockData';
import { Filter } from '@/types';

interface VehicleFiltersProps {
  onFiltersChange?: (filters: Filter) => void;
}

const VehicleFilters = ({ onFiltersChange }: VehicleFiltersProps) => {
  // Get filter options from mockData
  const models = getModels();
  const trims = getTrims();
  const fuelTypes = getFuelTypes();
  const colors = getColors();
  const locations = getLocations();
  const [minPrice, maxPrice] = getPriceRange();
  
  // State for selected filters
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTrims, setSelectedTrims] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [searchText, setSearchText] = useState('');
  
  // Callback per notificare il componente genitore quando i filtri cambiano
  useEffect(() => {
    if (onFiltersChange) {
      const filters: Filter = {
        models: selectedModels,
        trims: selectedTrims,
        fuelTypes: selectedFuelTypes,
        colors: selectedColors,
        locations: selectedLocations,
        priceRange: priceRange,
        status: []
      };
      onFiltersChange(filters);
    }
  }, [
    selectedModels,
    selectedTrims,
    selectedFuelTypes,
    selectedColors,
    selectedLocations,
    priceRange,
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
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchText);
    // In a real app, this would trigger filtering
  };
  
  const clearFilters = () => {
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedFuelTypes([]);
    setSelectedColors([]);
    setSelectedLocations([]);
    setPriceRange([minPrice, maxPrice]);
    setSearchText('');
  };
  
  return (
    <div className="bg-white rounded-md border p-4">
      <h2 className="font-medium mb-4">Filtri</h2>
      
      <form onSubmit={handleSearch} className="relative mb-4">
        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Cerca veicoli..."
          className="pr-10"
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
      
      <Accordion type="multiple" defaultValue={['price', 'model']}>
        <AccordionItem value="price">
          <AccordionTrigger>Fascia di Prezzo</AccordionTrigger>
          <AccordionContent>
            <div className="px-1">
              <Slider
                defaultValue={[minPrice, maxPrice]}
                min={minPrice}
                max={maxPrice}
                step={(maxPrice - minPrice) / 20}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={handlePriceChange}
                className="my-4"
              />
              <div className="flex justify-between text-sm">
                <span>€{priceRange[0].toLocaleString()}</span>
                <span>€{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="model">
          <AccordionTrigger>Modello</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {models.map((model) => (
                <div 
                  key={String(model)} 
                  className="flex items-center"
                  onClick={() => toggleModel(String(model))}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedModels.includes(String(model)) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedModels.includes(String(model)) && (
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
                  key={String(trim)} 
                  className="flex items-center"
                  onClick={() => toggleTrim(String(trim))}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedTrims.includes(String(trim)) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedTrims.includes(String(trim)) && (
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
                  key={String(fuelType)} 
                  className="flex items-center"
                  onClick={() => toggleFuelType(String(fuelType))}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedFuelTypes.includes(String(fuelType)) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedFuelTypes.includes(String(fuelType)) && (
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
                  key={String(color)} 
                  className="flex items-center"
                  onClick={() => toggleColor(String(color))}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedColors.includes(String(color)) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedColors.includes(String(color)) && (
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
                  key={String(location)} 
                  className="flex items-center"
                  onClick={() => toggleLocation(String(location))}
                >
                  <div className={`
                    h-4 w-4 rounded border mr-2 flex items-center justify-center
                    ${selectedLocations.includes(String(location)) 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'}
                  `}>
                    {selectedLocations.includes(String(location)) && (
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
