
import React from 'react';
import { 
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import FilterItem from './FilterItem';

interface LocationFilterProps {
  locations: string[];
  selectedLocations: string[];
  onToggleLocation: (location: string) => void;
}

const LocationFilter = ({ locations, selectedLocations, onToggleLocation }: LocationFilterProps) => {
  return (
    <AccordionItem value="location">
      <AccordionTrigger>Posizione</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {locations.map((location) => (
            <FilterItem
              key={location}
              id={location}
              name={location}
              isSelected={selectedLocations.includes(location)}
              onToggle={onToggleLocation}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LocationFilter;
