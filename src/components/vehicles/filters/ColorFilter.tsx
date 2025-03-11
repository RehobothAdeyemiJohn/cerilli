
import React from 'react';
import { 
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { ExteriorColor } from '@/types';
import FilterItem from './FilterItem';

interface ColorFilterProps {
  colors: ExteriorColor[];
  selectedColors: string[];
  onToggleColor: (color: string) => void;
}

const ColorFilter = ({ colors, selectedColors, onToggleColor }: ColorFilterProps) => {
  return (
    <AccordionItem value="color">
      <AccordionTrigger>Colore</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {colors.map((colorSetting: ExteriorColor) => (
            <FilterItem
              key={colorSetting.id}
              id={colorSetting.id}
              name={colorSetting.name}
              isSelected={selectedColors.includes(colorSetting.name)}
              onToggle={onToggleColor}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ColorFilter;
