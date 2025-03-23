
import React from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { VehicleModel } from '@/types';
import FilterItem from './FilterItem';

interface ModelFilterProps {
  models: VehicleModel[];
  selectedModels: string[];
  onToggleModel: (model: string) => void;
}

const ModelFilter = ({ models, selectedModels, onToggleModel }: ModelFilterProps) => {
  return (
    <AccordionItem value="model">
      <AccordionTrigger>Modello</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          {models.filter((obj: any, index: any, self: any) => index === self.findIndex((o: any) => o.name === obj.name)).map((modelSetting: VehicleModel) => (
            <FilterItem
              key={modelSetting.id}
              id={modelSetting.id}
              name={modelSetting.name}
              isSelected={selectedModels.includes(modelSetting.name)}
              onToggle={onToggleModel}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ModelFilter;
