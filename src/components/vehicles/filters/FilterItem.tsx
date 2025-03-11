
import React from 'react';
import { Check } from 'lucide-react';

interface FilterItemProps {
  id: string;
  name: string;
  isSelected: boolean;
  onToggle: (value: string) => void;
}

const FilterItem = ({ id, name, isSelected, onToggle }: FilterItemProps) => {
  const handleToggle = () => {
    onToggle(name);
  };

  return (
    <div 
      key={id} 
      className="flex items-center cursor-pointer"
      onClick={handleToggle}
    >
      <div className={`
        h-4 w-4 rounded border mr-2 flex items-center justify-center
        ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}
      `}>
        {isSelected && (
          <Check className="h-3 w-3 text-white" />
        )}
      </div>
      <span className="text-sm">{name}</span>
    </div>
  );
};

export default FilterItem;
