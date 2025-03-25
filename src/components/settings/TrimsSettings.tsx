
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { trimsApi } from '@/api/supabase/settingsApi';
import { VehicleTrim } from '@/types';
import FormDialog from './common/FormDialog';
import TrimForm from './trims/TrimForm';
import SettingsTable, { SettingsTableColumn } from './common/SettingsTable';

const TrimsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTrim, setCurrentTrim] = useState<Partial<VehicleTrim>>({});
  
  const queryClient = useQueryClient();
  
  const { data: trims = [], isLoading } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (trim: Omit<VehicleTrim, 'id'>) => trimsApi.create(trim),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trims'] });
      toast({
        title: "Allestimento Aggiunto",
        description: "L'allestimento è stato aggiunto con successo.",
      });
      setIsAddDialogOpen(false);
      setCurrentTrim({});
    },
    onError: (error) => {
      console.error('Error creating trim:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta dell'allestimento.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, trim }: { id: string; trim: VehicleTrim }) => trimsApi.update(id, trim),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trims'] });
      toast({
        title: "Allestimento Aggiornato",
        description: "L'allestimento è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setCurrentTrim({});
    },
    onError: (error) => {
      console.error('Error updating trim:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'allestimento.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await trimsApi.delete(id);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trims'] });
      toast({
        title: "Allestimento Eliminato",
        description: "L'allestimento è stato eliminato con successo.",
      });
    },
    onError: (error) => {
      console.error('Error deleting trim:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'allestimento.",
        variant: "destructive",
      });
    }
  });

  const handleAddTrim = () => {
    setCurrentTrim({});
    setIsAddDialogOpen(true);
  };

  const handleEditTrim = (trim: VehicleTrim) => {
    setCurrentTrim(trim);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTrim = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo allestimento?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleTrimChange = (field: keyof VehicleTrim, value: any) => {
    setCurrentTrim({
      ...currentTrim,
      [field]: value,
    });
  };

  const handleSaveTrim = () => {
    if (!currentTrim.name || currentTrim.basePrice === undefined) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    if (currentTrim.id) {
      updateMutation.mutate({
        id: currentTrim.id,
        trim: currentTrim as VehicleTrim,
      });
    } else {
      createMutation.mutate(currentTrim as Omit<VehicleTrim, 'id'>);
    }
  };

  const columns: SettingsTableColumn<VehicleTrim>[] = [
    { 
      header: "Nome", 
      accessor: "name" as keyof VehicleTrim 
    },
    { 
      header: "Prezzo Base", 
      accessor: (trim) => {
        return trim.basePrice !== undefined ? 
          `€${trim.basePrice}.00` : 
          '€0';
      },
      className: "text-right" 
    },
  ];

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Allestimenti</h2>
        <Button onClick={handleAddTrim}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Allestimento
        </Button>
      </div>
      
      <SettingsTable 
        data={trims} 
        columns={columns}
        onEdit={handleEditTrim}
        onDelete={handleDeleteTrim}
      />

      <FormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Aggiungi Allestimento"
        onSubmit={handleSaveTrim}
        isSubmitting={createMutation.isPending}
      >
        <TrimForm 
          trim={currentTrim}
          onChange={handleTrimChange}
        />
      </FormDialog>

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifica Allestimento"
        onSubmit={handleSaveTrim}
        isSubmitting={updateMutation.isPending}
      >
        <TrimForm 
          trim={currentTrim}
          onChange={handleTrimChange}
        />
      </FormDialog>
    </div>
  );
};

export default TrimsSettings;
