
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSelectItemProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
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
        onValueChange={(selectedValue) => {
          console.log("FilterSelectItem selected:", selectedValue);
          onChange(selectedValue === "all" ? null : selectedValue);
        }}
      >
        <SelectTrigger className="w-full border border-gray-300 bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className="bg-white z-[100] shadow-lg border border-gray-200 rounded-md overflow-hidden"
          position="popper"
          sideOffset={5}
        >
          <SelectItem value="all">Tutti</SelectItem>
          {options.map(option => (
            <SelectItem key={option.id} value={option.id} className="hover:bg-gray-100">
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelectItem;
