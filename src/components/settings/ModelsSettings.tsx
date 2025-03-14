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
import { supabase } from '@/api/supabase/client';

const ModelsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<Partial<VehicleModel>>({});
  const [isUploading, setIsUploading] = useState(false);
  
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
    mutationFn: (id: string) => modelsApi.delete(id),
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

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `model-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log("Uploading image to vehicle-images bucket:", filePath);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Upload error:", error);
        throw error;
      }
      
      console.log("Upload successful:", data);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }
      
      console.log("Public URL obtained:", publicUrlData.publicUrl);
      
      // Update current model with image URL
      setCurrentModel({
        ...currentModel,
        imageUrl: publicUrlData.publicUrl
      });
      
      toast({
        title: "Immagine Caricata",
        description: "L'immagine è stata caricata con successo.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error.message);
      toast({
        title: "Errore",
        description: `Errore durante il caricamento dell'immagine: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
        isSubmitting={createMutation.isPending || isUploading}
      >
        <ModelForm 
          model={currentModel}
          onChange={handleModelChange}
          onImageUpload={handleImageUpload}
        />
      </FormDialog>

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifica Modello"
        onSubmit={handleSaveModel}
        isSubmitting={updateMutation.isPending || isUploading}
      >
        <ModelForm 
          model={currentModel}
          onChange={handleModelChange}
          onImageUpload={handleImageUpload}
        />
      </FormDialog>
    </div>
  );
};

export default ModelsSettings;
