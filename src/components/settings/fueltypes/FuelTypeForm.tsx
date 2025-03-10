
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FuelType } from '@/types';

interface FuelTypeFormProps {
  fuelType: Partial<FuelType>;
  onChange: (field: keyof FuelType, value: any) => void;
}

const FuelTypeForm: React.FC<FuelTypeFormProps> = ({ fuelType, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Alimentazione</Label>
        <Input
          id="name"
          value={fuelType.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="es. Benzina"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceAdjustment">Adeguamento Prezzo (€)</Label>
        <Input
          id="priceAdjustment"
          type="number"
          value={fuelType.priceAdjustment || ''}
          onChange={(e) => onChange('priceAdjustment', Number(e.target.value))}
          placeholder="es. 1500"
        />
      </div>
    </div>
  );
};

export default FuelTypeForm;
