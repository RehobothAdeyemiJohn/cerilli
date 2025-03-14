
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSelectItemProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  className?: string;
}

const FilterSelectItem = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder,
  className = "" 
}: FilterSelectItemProps) => {
  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-2 block text-gray-700">{label}</Label>
      <Select
        value={value || "all"}
        onValueChange={(value) => onChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full border-gray-300 bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutti</SelectItem>
          {options.map(option => (
            <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelectItem;
