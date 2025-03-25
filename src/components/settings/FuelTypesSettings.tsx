import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { fuelTypesApi } from '@/api/supabase/settingsApi';
import { FuelType } from '@/types';
import FormDialog from './common/FormDialog';
import FuelTypeForm from './fueltypes/FuelTypeForm';
import SettingsTable, { SettingsTableColumn } from './common/SettingsTable';

const FuelTypesSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFuelType, setCurrentFuelType] = useState<Partial<FuelType>>({});
  
  const queryClient = useQueryClient();
  
  const { data: fuelTypes = [], isLoading } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (fuelType: Omit<FuelType, 'id'>) => fuelTypesApi.create(fuelType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelTypes'] });
      toast({
        title: "Alimentazione Aggiunta",
        description: "Il tipo di alimentazione è stato aggiunto con successo.",
      });
      setIsAddDialogOpen(false);
      setCurrentFuelType({});
    },
    onError: (error) => {
      console.error('Error creating fuel type:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta del tipo di alimentazione.",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fuelType }: { id: string; fuelType: FuelType }) => fuelTypesApi.update(id, fuelType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelTypes'] });
      toast({
        title: "Alimentazione Aggiornata",
        description: "Il tipo di alimentazione è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setCurrentFuelType({});
    },
    onError: (error) => {
      console.error('Error updating fuel type:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del tipo di alimentazione.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fuelTypesApi.delete(id);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelTypes'] });
      toast({
        title: "Alimentazione Eliminata",
        description: "L'alimentazione è stata eliminata con successo.",
      });
    },
    onError: (error) => {
      console.error('Error deleting fuel type:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'alimentazione.",
        variant: "destructive",
      });
    }
  });

  const handleAddFuelType = () => {
    setCurrentFuelType({});
    setIsAddDialogOpen(true);
  };

  const handleEditFuelType = (fuelType: FuelType) => {
    setCurrentFuelType(fuelType);
    setIsEditDialogOpen(true);
  };

  const handleDeleteFuelType = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo tipo di alimentazione?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFuelTypeChange = (field: keyof FuelType, value: any) => {
    setCurrentFuelType({
      ...currentFuelType,
      [field]: value,
    });
  };

  const handleSaveFuelType = () => {
    if (!currentFuelType.name || currentFuelType.price_adjustment === undefined) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    if (currentFuelType.id) {
      updateMutation.mutate({
        id: currentFuelType.id,
        fuelType: currentFuelType as FuelType,
      });
    } else {
      createMutation.mutate(currentFuelType as Omit<FuelType, 'id'>);
    }
  };

  const columns: SettingsTableColumn<FuelType>[] = [
    { 
      header: "Nome", 
      accessor: "name" as keyof FuelType 
    },
    { 
      header: "Adeguamento Prezzo", 
      accessor: (fuelType) => {
        return fuelType.price_adjustment !== undefined ? 
          `€${fuelType.price_adjustment}.00` : 
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
        <h2 className="text-xl font-semibold">Gestione Tipi di Alimentazione</h2>
        <Button onClick={handleAddFuelType}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Alimentazione
        </Button>
      </div>
      
      <SettingsTable 
        data={fuelTypes} 
        columns={columns}
        onEdit={handleEditFuelType}
        onDelete={handleDeleteFuelType}
      />

      <FormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Aggiungi Alimentazione"
        onSubmit={handleSaveFuelType}
        isSubmitting={createMutation.isPending}
      >
        <FuelTypeForm 
          fuelType={currentFuelType}
          onChange={handleFuelTypeChange}
        />
      </FormDialog>

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifica Alimentazione"
        onSubmit={handleSaveFuelType}
        isSubmitting={updateMutation.isPending}
      >
        <FuelTypeForm 
          fuelType={currentFuelType}
          onChange={handleFuelTypeChange}
        />
      </FormDialog>
    </div>
  );
};

export default FuelTypesSettings;
