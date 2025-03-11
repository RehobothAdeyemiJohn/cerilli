
import React from 'react';
import { 
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { FuelType } from '@/types';
import FilterItem from './FilterItem';

interface FuelTypeFilterProps {
  fuelTypes: FuelType[];
  selectedFuelTypes: string[];
  onToggleFuelType: (fuelType: string) => void;
}

const FuelTypeFilter = ({ fuelTypes, selectedFuelTypes, onToggleFuelType }: FuelTypeFilterProps) => {
  return (
    <AccordionItem value="fuelType">
      <AccordionTrigger>Alimentazione</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {fuelTypes.map((fuelTypeSetting: FuelType) => (
            <FilterItem
              key={fuelTypeSetting.id}
              id={fuelTypeSetting.id}
              name={fuelTypeSetting.name}
              isSelected={selectedFuelTypes.includes(fuelTypeSetting.name)}
              onToggle={onToggleFuelType}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FuelTypeFilter;
