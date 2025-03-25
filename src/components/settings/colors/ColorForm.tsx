
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ExteriorColor } from '@/types';
import { modelsApi } from '@/api/supabase/settingsApi';

interface ColorFormProps {
  color: Partial<ExteriorColor>;
  onChange: (field: keyof ExteriorColor, value: any) => void;
}

const ColorForm: React.FC<ColorFormProps> = ({ color, onChange }) => {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

  if (isLoading) {
    return <div>Caricamento modelli in corso...</div>;
  }

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
          onValueChange={(value) =>{
            onChange("type",value)
          }}
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
          value={color.price_adjustment || ''}
          onChange={(e) => onChange('price_adjustment', Number(e.target.value))}
          placeholder="es. 800"
        />
      </div>

      <div className="space-y-2">
        <Label>Compatibilità Modelli</Label>
        <p className="text-sm text-gray-500 mb-2">
          Lascia vuoto per tutti i modelli
        </p>
        <div className="grid grid-cols-2 gap-2">
          {models.map((model) => (
            <div key={model.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`model-${model.id}`}
                checked={(color.compatible_models || []).includes(model.id)}
                onCheckedChange={(checked) => {
                  const currentModels = color.compatible_models || [];
                  const updatedModels = checked
                    ? [...currentModels, model.id]
                    : currentModels.filter(id => id !== model.id);
                  onChange('compatible_models', updatedModels);
                }}
              />
              <Label htmlFor={`model-${model.id}`}>{model.name}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorForm;
