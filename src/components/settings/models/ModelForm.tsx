
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { VehicleModel } from '@/types';

interface ModelFormProps {
  model: Partial<VehicleModel>;
  onChange: (field: keyof VehicleModel, value: any) => void;
}

const ModelForm: React.FC<ModelFormProps> = ({ model, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Modello</Label>
        <Input
          id="name"
          value={model.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="es. Cirelli 1"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="basePrice">Prezzo Base (€)</Label>
        <Input
          id="basePrice"
          type="number"
          value={model.basePrice || ''}
          onChange={(e) => onChange('basePrice', Number(e.target.value))}
          placeholder="es. 15000"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL Immagine</Label>
        <Input
          id="imageUrl"
          value={model.imageUrl || ''}
          onChange={(e) => onChange('imageUrl', e.target.value)}
          placeholder="URL dell'immagine del modello"
        />
      </div>
    </div>
  );
};

export default ModelForm;
