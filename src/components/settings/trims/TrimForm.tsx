
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { VehicleTrim } from '@/types';
import { modelsApi } from '@/api/localStorage';

interface TrimFormProps {
  trim: Partial<VehicleTrim>;
  onChange: (field: keyof VehicleTrim, value: any) => void;
}

const TrimForm: React.FC<TrimFormProps> = ({ trim, onChange }) => {
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

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
                checked={(trim.compatible_models || []).includes(model.id)}
                onCheckedChange={(checked) => {
                  const currentModels = trim.compatible_models || [];
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

export default TrimForm;
