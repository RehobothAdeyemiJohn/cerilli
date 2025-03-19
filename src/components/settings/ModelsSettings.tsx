
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { modelsApi } from '@/api/localStorage';
import { VehicleModel } from '@/types';
import FormDialog from './common/FormDialog';
import ModelForm from './models/ModelForm';
import SettingsTable, { SettingsTableColumn } from './common/SettingsTable';

const ModelsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<Partial<VehicleModel>>({});
  
  const queryClient = useQueryClient();
  
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (model: Omit<VehicleModel, 'id'>) => modelsApi.create(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Aggiunto",
        description: "Il modello è stato aggiunto con successo.",
      });
      setIsAddDialogOpen(false);
      setCurrentModel({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, model }: { id: string; model: VehicleModel }) => modelsApi.update(id, model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Aggiornato",
        description: "Il modello è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setCurrentModel({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await modelsApi.delete(id);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Eliminato",
        description: "Il modello è stato eliminato con successo.",
      });
    },
  });

  const handleAddModel = () => {
    setCurrentModel({});
    setIsAddDialogOpen(true);
  };

  const handleEditModel = (model: VehicleModel) => {
    setCurrentModel(model);
    setIsEditDialogOpen(true);
  };

  const handleDeleteModel = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo modello?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleModelChange = (field: keyof VehicleModel, value: any) => {
    setCurrentModel({
      ...currentModel,
      [field]: value,
    });
  };

  const handleSaveModel = () => {
    if (!currentModel.name || !currentModel.basePrice) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    if (currentModel.id) {
      updateMutation.mutate({
        id: currentModel.id,
        model: currentModel as VehicleModel,
      });
    } else {
      createMutation.mutate(currentModel as Omit<VehicleModel, 'id'>);
    }
  };

  const columns: SettingsTableColumn<VehicleModel>[] = [
    { 
      header: "Nome", 
      accessor: "name" as keyof VehicleModel 
    },
    { 
      header: "Prezzo Base", 
      accessor: (model) => `€${model.basePrice.toLocaleString('it-IT')}`,
      className: "text-right" 
    },
    { 
      header: "Immagine", 
      accessor: (model) => model.imageUrl ? "Disponibile" : "Non disponibile",
      className: "text-center" 
    },
  ];

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Modelli</h2>
        <Button onClick={handleAddModel}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Modello
        </Button>
      </div>
      
      <SettingsTable 
        data={models} 
        columns={columns}
        onEdit={handleEditModel}
        onDelete={handleDeleteModel}
      />

      <FormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Aggiungi Modello"
        onSubmit={handleSaveModel}
        isSubmitting={createMutation.isPending}
      >
        <ModelForm 
          model={currentModel}
          onChange={handleModelChange}
        />
      </FormDialog>

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifica Modello"
        onSubmit={handleSaveModel}
        isSubmitting={updateMutation.isPending}
      >
        <ModelForm 
          model={currentModel}
          onChange={handleModelChange}
        />
      </FormDialog>
    </div>
  );
};

export default ModelsSettings;
