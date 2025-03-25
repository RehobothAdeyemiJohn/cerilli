
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Transmission } from '@/types';
import { modelsApi } from '@/api/supabase/settingsApi';

interface TransmissionFormProps {
  transmission: Partial<Transmission>;
  onChange: (field: keyof Transmission, value: any) => void;
}

const TransmissionForm: React.FC<TransmissionFormProps> = ({ transmission, onChange }) => {
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

  // Debug the compatible models to understand what's being saved
  console.log("Current transmission compatible_models:", transmission.compatible_models);

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
        <Label htmlFor="price_adjustment">Adeguamento Prezzo (€)</Label>
        <Input
          id="price_adjustment"
          type="number"
          value={transmission.price_adjustment || ''}
          onChange={(e) => onChange('price_adjustment', Number(e.target.value))}
          placeholder="es. 1500"
        />
      </div>
      <div className="space-y-2">
        <Label>Compatibilità Modelli</Label>
        <p className="text-sm text-gray-500 mb-2">
          Lascia vuoto per tutti i modelli
        </p>
        <div className="grid grid-cols-2 gap-2">
          {models.map((model) => {
            // Check if the model ID exists in compatible_models
            const isChecked = Array.isArray(transmission.compatible_models) && 
              transmission.compatible_models.includes(model.id);
            
            console.log(`Model ${model.name} (${model.id}) checked:`, isChecked);
            
            return (
              <div key={model.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`model-${model.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const currentModels = Array.isArray(transmission.compatible_models) 
                      ? [...transmission.compatible_models] 
                      : [];
                    
                    const updatedModels = checked
                      ? [...currentModels, model.id]
                      : currentModels.filter(id => id !== model.id);
                    
                    console.log("Updating compatible_models to:", updatedModels);
                    onChange('compatible_models', updatedModels);
                  }}
                />
                <Label htmlFor={`model-${model.id}`}>{model.name}</Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransmissionForm;
