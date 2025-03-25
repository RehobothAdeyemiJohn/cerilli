import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { modelsApi } from '@/api/supabase/settingsApi';
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
    mutationFn: (model: Omit<VehicleModel, 'id'>) => {
      console.log('Creating model:', model);
      return modelsApi.create(model);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Aggiunto",
        description: "Il modello è stato aggiunto con successo.",
      });
      setIsAddDialogOpen(false);
      setCurrentModel({});
    },
    onError: (error) => {
      console.error('Error creating model:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta del modello.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, model }: { id: string; model: VehicleModel }) => {
      console.log('Updating model:', { id, model });
      return modelsApi.update(id, model);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Aggiornato",
        description: "Il modello è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setCurrentModel({});
    },
    onError: (error) => {
      console.error('Error updating model:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del modello.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => modelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Eliminato",
        description: "Il modello è stato eliminato con successo.",
      });
    },
    onError: (error) => {
      console.error('Error deleting model:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del modello.",
        variant: "destructive",
      });
    }
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
    if (!currentModel.name || currentModel.basePrice === undefined) {
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
      accessor: (model) => {
        return model.basePrice !== undefined ? 
          `€${model.basePrice}.00` : 
          '€0';
      },
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
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
