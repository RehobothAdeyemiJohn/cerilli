
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExteriorColor } from '@/types';

interface ColorFormProps {
  color: Partial<ExteriorColor>;
  onChange: (field: keyof ExteriorColor, value: any) => void;
}

const ColorForm: React.FC<ColorFormProps> = ({ color, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Colore</Label>
        <Input
          id="name"
          value={color.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="es. Pure Ice"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select 
          value={color.type || ''} 
          onValueChange={(value) => onChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona il tipo di colore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metallizzato">Metallizzato</SelectItem>
            <SelectItem value="pastello">Pastello</SelectItem>
            <SelectItem value="perlato">Perlato</SelectItem>
            <SelectItem value="opaco">Opaco</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceAdjustment">Adeguamento Prezzo (€)</Label>
        <Input
          id="priceAdjustment"
          type="number"
          value={color.priceAdjustment || ''}
          onChange={(e) => onChange('priceAdjustment', Number(e.target.value))}
          placeholder="es. 800"
        />
      </div>
    </div>
  );
};

export default ColorForm;
