
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterModelSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  models: string[];
}

const FilterModelSelect = ({ value, onChange, models }: FilterModelSelectProps) => {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block text-gray-700">Modello</Label>
      <Select
        value={value || "all"}
        onValueChange={(value) => onChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full border-gray-300 bg-white">
          <SelectValue placeholder="Seleziona modello" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutti i modelli</SelectItem>
          {models.map(model => (
            <SelectItem key={model} value={model}>{model}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterModelSelect;
