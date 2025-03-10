
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsApi } from '@/api/localStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleModel } from '@/types';

const ModelsSettings = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState<string | null>(null);
  const [newModel, setNewModel] = React.useState({ name: '', basePrice: 0 });

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });

  const addMutation = useMutation({
    mutationFn: (model: Omit<VehicleModel, 'id'>) => modelsApi.create(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setNewModel({ name: '', basePrice: 0 });
      toast({
        title: "Modello aggiunto",
        description: "Il nuovo modello è stato aggiunto con successo.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (model: VehicleModel) => modelsApi.update(model.id, model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setIsEditing(null);
      toast({
        title: "Modello aggiornato",
        description: "Il modello è stato aggiornato con successo.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello eliminato",
        description: "Il modello è stato eliminato con successo.",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    if (!newModel.name || newModel.basePrice <= 0) {
      toast({
        title: "Errore",
        description: "Inserisci un nome e un prezzo base valido.",
        variant: "destructive",
      });
      return;
    }
    addMutation.mutate(newModel);
  };

  const handleUpdate = (model: VehicleModel) => {
    updateMutation.mutate(model);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Nome Modello</label>
          <Input
            value={newModel.name}
            onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
            placeholder="Inserisci il nome del modello"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Prezzo Base (€)</label>
          <Input
            type="number"
            value={newModel.basePrice}
            onChange={(e) => setNewModel({ ...newModel, basePrice: Number(e.target.value) })}
            placeholder="Inserisci il prezzo base"
          />
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Prezzo Base</TableHead>
            <TableHead className="w-[100px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.id}>
              <TableCell>
                {isEditing === model.id ? (
                  <Input
                    value={model.name}
                    onChange={(e) => handleUpdate({ ...model, name: e.target.value })}
                  />
                ) : (
                  model.name
                )}
              </TableCell>
              <TableCell>
                {isEditing === model.id ? (
                  <Input
                    type="number"
                    value={model.basePrice}
                    onChange={(e) => handleUpdate({ ...model, basePrice: Number(e.target.value) })}
                  />
                ) : (
                  `€${model.basePrice.toLocaleString()}`
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(isEditing === model.id ? null : model.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(model.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ModelsSettings;
