
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FilterSwitchItemProps {
  label: string;
  value: boolean | null;
  onChange: (checked: boolean) => void;
  description?: string;
}

const FilterSwitchItem = ({ label, value, onChange, description }: FilterSwitchItemProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium text-gray-700">{label}</Label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <Switch 
          checked={value === true}
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
};

export default FilterSwitchItem;
