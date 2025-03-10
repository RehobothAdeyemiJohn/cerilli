
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FuelType } from '@/types';
import { modelsApi } from '@/api/localStorage';

interface FuelTypeFormProps {
  fuelType: Partial<FuelType>;
  onChange: (field: keyof FuelType, value: any) => void;
}

const FuelTypeForm: React.FC<FuelTypeFormProps> = ({ fuelType, onChange }) => {
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

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
                checked={(fuelType.compatibleModels || []).includes(model.id)}
                onCheckedChange={(checked) => {
                  const currentModels = fuelType.compatibleModels || [];
                  const updatedModels = checked
                    ? [...currentModels, model.id]
                    : currentModels.filter(id => id !== model.id);
                  onChange('compatibleModels', updatedModels);
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

export default FuelTypeForm;
