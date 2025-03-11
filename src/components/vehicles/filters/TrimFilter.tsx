
import React from 'react';
import { 
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { VehicleTrim } from '@/types';
import FilterItem from './FilterItem';

interface TrimFilterProps {
  trims: VehicleTrim[];
  selectedTrims: string[];
  onToggleTrim: (trim: string) => void;
}

const TrimFilter = ({ trims, selectedTrims, onToggleTrim }: TrimFilterProps) => {
  return (
    <AccordionItem value="trim">
      <AccordionTrigger>Allestimento</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {trims.map((trimSetting: VehicleTrim) => (
            <FilterItem
              key={trimSetting.id}
              id={trimSetting.id}
              name={trimSetting.name}
              isSelected={selectedTrims.includes(trimSetting.name)}
              onToggle={onToggleTrim}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TrimFilter;
