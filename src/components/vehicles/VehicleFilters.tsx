
import React, { useState } from 'react';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import {
  getModels,
  getTrims,
  getFuelTypes,
  getColors,
  getLocations,
  getPriceRange,
} from '@/data/mockData';

const VehicleFilters = () => {
  const models = getModels();
  const trims = getTrims();
  const fuelTypes = getFuelTypes();
  const colors = getColors();
  const locations = getLocations();
  const [minPrice, maxPrice] = getPriceRange();
  
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTrims, setSelectedTrims] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [showFilters, setShowFilters] = useState(false);
  
  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };
  
  const toggleTrim = (trim: string) => {
    if (selectedTrims.includes(trim)) {
      setSelectedTrims(selectedTrims.filter(t => t !== trim));
    } else {
      setSelectedTrims([...selectedTrims, trim]);
    }
  };
  
  const toggleFuelType = (fuelType: string) => {
    if (selectedFuelTypes.includes(fuelType)) {
      setSelectedFuelTypes(selectedFuelTypes.filter(f => f !== fuelType));
    } else {
      setSelectedFuelTypes([...selectedFuelTypes, fuelType]);
    }
  };
  
  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };
  
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  const resetFilters = () => {
    setSelectedModels([]);
    setSelectedTrims([]);
    setSelectedFuelTypes([]);
    setSelectedColors([]);
    setSelectedLocations([]);
    setPriceRange([minPrice, maxPrice]);
  };
  
  const toggleFiltersVisibility = () => {
    setShowFilters(!showFilters);
  };
  
  const formatPrice = (price: number) => {
    return `€${price.toLocaleString()}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
        
        <button
          className="md:hidden flex items-center text-gray-700"
          onClick={toggleFiltersVisibility}
        >
          <Filter className="h-4 w-4 mr-1" />
          {showFilters ? 'Hide' : 'Show'}
        </button>
      </div>
      
      <div className={`
        ${showFilters ? 'max-h-[1000px]' : 'max-h-0'} 
        md:max-h-none 
        overflow-hidden transition-all duration-300
      `}>
        <Accordion type="multiple" defaultValue={["price", "model"]}>
          <AccordionItem value="price">
            <AccordionTrigger className="px-4">Price Range</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="mt-2">
                <Slider
                  defaultValue={[minPrice, maxPrice]}
                  max={maxPrice}
                  min={minPrice}
                  step={500}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={handlePriceChange}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="model">
            <AccordionTrigger className="px-4">Model</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
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
            <AccordionTrigger className="px-4">Trim</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {trims.map((trim) => (
                  <div 
                    key={trim.toString()} 
                    className="flex items-center"
                    onClick={() => toggleTrim(trim.toString())}
                  >
                    <div className={`
                      h-4 w-4 rounded border mr-2 flex items-center justify-center
                      ${selectedTrims.includes(trim.toString()) 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'}
                    `}>
                      {selectedTrims.includes(trim.toString()) && (
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
            <AccordionTrigger className="px-4">Fuel Type</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {fuelTypes.map((fuelType) => (
                  <div 
                    key={fuelType.toString()} 
                    className="flex items-center"
                    onClick={() => toggleFuelType(fuelType.toString())}
                  >
                    <div className={`
                      h-4 w-4 rounded border mr-2 flex items-center justify-center
                      ${selectedFuelTypes.includes(fuelType.toString()) 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'}
                    `}>
                      {selectedFuelTypes.includes(fuelType.toString()) && (
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
            <AccordionTrigger className="px-4">Color</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {colors.map((color) => (
                  <div 
                    key={color.toString()} 
                    className="flex items-center"
                    onClick={() => toggleColor(color.toString())}
                  >
                    <div className={`
                      h-4 w-4 rounded border mr-2 flex items-center justify-center
                      ${selectedColors.includes(color.toString()) 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'}
                    `}>
                      {selectedColors.includes(color.toString()) && (
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
            <AccordionTrigger className="px-4">Location</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {locations.map((location) => (
                  <div 
                    key={location.toString()} 
                    className="flex items-center"
                    onClick={() => toggleLocation(location.toString())}
                  >
                    <div className={`
                      h-4 w-4 rounded border mr-2 flex items-center justify-center
                      ${selectedLocations.includes(location.toString()) 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'}
                    `}>
                      {selectedLocations.includes(location.toString()) && (
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
      </div>
    </div>
  );
};

export default VehicleFilters;
