
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { VehicleTrim } from '@/types';

interface TrimFormProps {
  trim: Partial<VehicleTrim>;
  onChange: (field: keyof VehicleTrim, value: any) => void;
}

const TrimForm: React.FC<TrimFormProps> = ({ trim, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Allestimento</Label>
        <Input
          id="name"
          value={trim.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="es. Premium"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="basePrice">Prezzo Aggiuntivo (€)</Label>
        <Input
          id="basePrice"
          type="number"
          value={trim.basePrice || ''}
          onChange={(e) => onChange('basePrice', Number(e.target.value))}
          placeholder="es. 2500"
        />
      </div>
    </div>
  );
};

export default TrimForm;
