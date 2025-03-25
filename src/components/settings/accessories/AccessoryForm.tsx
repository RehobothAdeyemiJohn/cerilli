
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accessory, VehicleModel, VehicleTrim } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { modelsApi, trimsApi } from '@/api/localStorage';

interface AccessoryFormProps {
  accessory: Partial<Accessory>;
  onChange: (field: keyof Accessory, value: any) => void;
}

const AccessoryForm: React.FC<AccessoryFormProps> = ({ accessory, onChange }) => {
  const [selectedModels, setSelectedModels] = useState<string[]>(accessory.compatible_models || []);
  const [selectedTrims, setSelectedTrims] = useState<string[]>(accessory.compatible_trims || []);
  
  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });
  
  const { data: trims = [] } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });
  
  // Update the parent component when selections change
  useEffect(() => {
    onChange('compatible_models', selectedModels);
  }, [selectedModels, onChange]);
  
  useEffect(() => {
    onChange('compatible_trims', selectedTrims);
  }, [selectedTrims, onChange]);
  
  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId) 
        : [...prev, modelId]
    );
  };
  
  const toggleTrim = (trimId: string) => {
    setSelectedTrims(prev => 
      prev.includes(trimId) 
        ? prev.filter(id => id !== trimId) 
        : [...prev, trimId]
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Accessorio</Label>
          <Input
            id="name"
            value={accessory.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="es. Sistema di Navigazione"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceWithVAT">Prezzo con IVA (€)</Label>
          <Input
            id="priceWithVAT"
            type="number"
            value={accessory.price || ''}
            onChange={(e) => onChange('price', Number(e.target.value))}
            placeholder="es. 1500"
          />
          <p className="text-xs text-gray-500">
            Il prezzo senza IVA sarà calcolato automaticamente
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Compatibilità Modelli</Label>
        <p className="text-xs text-gray-500 mb-2">
          Lascia vuoto per tutti i modelli
        </p>
        <div className="grid grid-cols-2 gap-2">
          {models.map((model: VehicleModel) => (
            <div key={model.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`model-${model.id}`}
                checked={selectedModels.includes(model.id)}
                onCheckedChange={() => toggleModel(model.id)}
              />
              <Label htmlFor={`model-${model.id}`}>{model.name}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <Label>Compatibilità Allestimenti</Label>
        <p className="text-xs text-gray-500 mb-2">
          Lascia vuoto per tutti gli allestimenti
        </p>
        <div className="grid grid-cols-2 gap-2">
          {trims.map((trim: VehicleTrim) => (
            <div key={trim.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`trim-${trim.id}`}
                checked={selectedTrims.includes(trim.id)}
                onCheckedChange={() => toggleTrim(trim.id)}
              />
              <Label htmlFor={`trim-${trim.id}`}>{trim.name}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessoryForm;
