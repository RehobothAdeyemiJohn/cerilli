
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { accessoriesApi } from '@/api/supabase/settingsApi';
import { Accessory } from '@/types';
import FormDialog from './common/FormDialog';
import AccessoryForm from './accessories/AccessoryForm';
import SettingsTable, { SettingsTableColumn } from './common/SettingsTable';

const AccessoriesSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAccessory, setCurrentAccessory] = useState<Partial<Accessory>>({
    compatible_models: [],
    compatible_trims: []
  });
  
  const queryClient = useQueryClient();
  
  const { data: accessories = [], isLoading } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (accessory: Omit<Accessory, 'id'>) => {
      // The price_without_vat will be calculated by the API
      return accessoriesApi.create(accessory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast({
        title: "Accessorio Aggiunto",
        description: "L'accessorio è stato aggiunto con successo.",
      });
      setIsAddDialogOpen(false);
      setCurrentAccessory({
        compatible_models: [],
        compatible_trims: []
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, accessory }: { id: string; accessory: Accessory }) => 
      accessoriesApi.update(id, accessory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast({
        title: "Accessorio Aggiornato",
        description: "L'accessorio è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setCurrentAccessory({
        compatible_models: [],
        compatible_trims: []
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await accessoriesApi.delete(id);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast({
        title: "Accessorio Eliminato",
        description: "L'accessorio è stato eliminato con successo.",
      });
    },
  });

  const handleAddAccessory = () => {
    setCurrentAccessory({
      compatible_models: [],
      compatible_trims: []
    });
    setIsAddDialogOpen(true);
  };

  const handleEditAccessory = (accessory: Accessory) => {
    setCurrentAccessory(accessory);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAccessory = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo accessorio?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAccessoryChange = (field: keyof Accessory, value: any) => {
    setCurrentAccessory({
      ...currentAccessory,
      [field]: value,
    });
  };

  const handleSaveAccessory = () => {
    if (!currentAccessory.name || currentAccessory.price === undefined) {
      toast({
        title: "Errore",
        description: "Nome e prezzo sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    // Calculate price_without_vat by dividing priceWithVAT by 1.22 (22% VAT)
    const price = Math.round((currentAccessory.price || 0));
    // const price_without_vat = Math.round((currentAccessory.price || 0) / 1.22);
    // const price_with_vat = Math.round((currentAccessory.price || 0) / 1.22);
    // console.log(currentAccessory);
    // return
    
    if (currentAccessory.id) {
      updateMutation.mutate({
        id: currentAccessory.id,
        accessory: {
          ...currentAccessory as Accessory,
          price,
        },
      });
    } else {
      createMutation.mutate({
        ...currentAccessory as Omit<Accessory, 'id'>,
        price,
      });
    }
  };

  const columns: SettingsTableColumn<Accessory>[] = [
    { 
      header: "Nome", 
      accessor: "name" as keyof Accessory 
    },
    { 
      header: "Prezzo con IVA", 
      accessor: (accessory) => {
        return accessory.price !== undefined ? 
          `€${accessory.price}.00` : 
          '€0';
      },
      className: "text-right" 
    },
    { 
      header: "Prezzo senza IVA", 
      accessor: (accessory) => {
        return accessory.price !== undefined ? 
          `€${accessory.price}.00` : 
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
        <h2 className="text-xl font-semibold">Gestione Accessori</h2>
        <Button onClick={handleAddAccessory}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Accessorio
        </Button>
      </div>
      
      <SettingsTable 
        data={accessories} 
        columns={columns}
        onEdit={handleEditAccessory}
        onDelete={handleDeleteAccessory}
      />

      <FormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Aggiungi Accessorio"
        onSubmit={handleSaveAccessory}
        isSubmitting={createMutation.isPending}
      >
        <AccessoryForm 
          accessory={currentAccessory}
          onChange={handleAccessoryChange}
        />
      </FormDialog>

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifica Accessorio"
        onSubmit={handleSaveAccessory}
        isSubmitting={updateMutation.isPending}
      >
        <AccessoryForm 
          accessory={currentAccessory}
          onChange={handleAccessoryChange}
        />
      </FormDialog>
    </div>
  );
};

export default AccessoriesSettings;
