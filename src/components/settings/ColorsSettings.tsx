import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { colorsApi } from '@/api/localStorage';
import { ExteriorColor } from '@/types';
import FormDialog from './common/FormDialog';
import ColorForm from './colors/ColorForm';
import SettingsTable, { SettingsTableColumn } from './common/SettingsTable';

const ColorsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<Partial<ExteriorColor>>({});
  
  const queryClient = useQueryClient();
  
  const { data: colors = [], isLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (color: Omit<ExteriorColor, 'id'>) => colorsApi.create(color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast({
        title: "Colore Aggiunto",
        description: "Il colore è stato aggiunto con successo.",
      });
      setIsAddDialogOpen(false);
      setCurrentColor({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, color }: { id: string; color: ExteriorColor }) => colorsApi.update(id, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast({
        title: "Colore Aggiornato",
        description: "Il colore è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setCurrentColor({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => colorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast({
        title: "Colore Eliminato",
        description: "Il colore è stato eliminato con successo.",
      });
    },
  });

  const handleAddColor = () => {
    setCurrentColor({});
    setIsAddDialogOpen(true);
  };

  const handleEditColor = (color: ExteriorColor) => {
    setCurrentColor(color);
    setIsEditDialogOpen(true);
  };

  const handleDeleteColor = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo colore?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleColorChange = (field: keyof ExteriorColor, value: any) => {
    setCurrentColor({
      ...currentColor,
      [field]: value,
    });
  };

  const handleSaveColor = () => {
    if (!currentColor.name || !currentColor.type || currentColor.priceAdjustment === undefined) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    if (currentColor.id) {
      updateMutation.mutate({
        id: currentColor.id,
        color: currentColor as ExteriorColor,
      });
    } else {
      createMutation.mutate(currentColor as Omit<ExteriorColor, 'id'>);
    }
  };

  const columns: SettingsTableColumn<ExteriorColor>[] = [
    { 
      header: "Nome", 
      accessor: "name" as keyof ExteriorColor 
    },
    { 
      header: "Tipo", 
      accessor: "type" as keyof ExteriorColor 
    },
    { 
      header: "Adeguamento Prezzo", 
      accessor: (color) => `€${color.priceAdjustment.toLocaleString('it-IT')}`,
      className: "text-right" 
    },
  ];

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Colori</h2>
        <Button onClick={handleAddColor}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Colore
        </Button>
      </div>
      
      <SettingsTable 
        data={colors} 
        columns={columns}
        onEdit={handleEditColor}
        onDelete={handleDeleteColor}
      />

      <FormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Aggiungi Colore"
        onSubmit={handleSaveColor}
        isSubmitting={createMutation.isPending}
      >
        <ColorForm 
          color={currentColor}
          onChange={handleColorChange}
        />
      </FormDialog>

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifica Colore"
        onSubmit={handleSaveColor}
        isSubmitting={updateMutation.isPending}
      >
        <ColorForm 
          color={currentColor}
          onChange={handleColorChange}
        />
      </FormDialog>
    </div>
  );
};

export default ColorsSettings;
