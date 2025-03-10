
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Transmission } from '@/types';

interface TransmissionFormProps {
  transmission: Partial<Transmission>;
  onChange: (field: keyof Transmission, value: any) => void;
}

const TransmissionForm: React.FC<TransmissionFormProps> = ({ transmission, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Cambio</Label>
        <Input
          id="name"
          value={transmission.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="es. Manuale"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceAdjustment">Adeguamento Prezzo (€)</Label>
        <Input
          id="priceAdjustment"
          type="number"
          value={transmission.priceAdjustment || ''}
          onChange={(e) => onChange('priceAdjustment', Number(e.target.value))}
          placeholder="es. 1500"
        />
      </div>
    </div>
  );
};

export default TransmissionForm;
