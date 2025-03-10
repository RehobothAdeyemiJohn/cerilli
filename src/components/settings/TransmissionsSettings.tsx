import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { transmissionsApi } from '@/api/localStorage';
import { Transmission } from '@/types';
import FormDialog from './common/FormDialog';
import TransmissionForm from './transmissions/TransmissionForm';
import SettingsTable from './common/SettingsTable';

const TransmissionsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTransmission, setCurrentTransmission] = useState<Partial<Transmission>>({});
  
  const queryClient = useQueryClient();
  
  const { data: transmissions = [], isLoading } = useQuery({
    queryKey: ['transmissions'],
    queryFn: transmissionsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (transmission: Omit<Transmission, 'id'>) => transmissionsApi.create(transmission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
      toast({
        title: "Cambio Aggiunto",
        description: "Il tipo di cambio è stato aggiunto con successo.",
      });
      setIsAddDialogOpen(false);
      setCurrentTransmission({});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, transmission }: { id: string; transmission: Transmission }) => 
      transmissionsApi.update(id, transmission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
      toast({
        title: "Cambio Aggiornato",
        description: "Il tipo di cambio è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setCurrentTransmission({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transmissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
      toast({
        title: "Cambio Eliminato",
        description: "Il tipo di cambio è stato eliminato con successo.",
      });
    },
  });

  const handleAddTransmission = () => {
    setCurrentTransmission({});
    setIsAddDialogOpen(true);
  };

  const handleEditTransmission = (transmission: Transmission) => {
    setCurrentTransmission(transmission);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTransmission = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo tipo di cambio?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleTransmissionChange = (field: keyof Transmission, value: any) => {
    setCurrentTransmission({
      ...currentTransmission,
      [field]: value,
    });
  };

  const handleSaveTransmission = () => {
    if (!currentTransmission.name || currentTransmission.priceAdjustment === undefined) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    if (currentTransmission.id) {
      updateMutation.mutate({
        id: currentTransmission.id,
        transmission: currentTransmission as Transmission,
      });
    } else {
      createMutation.mutate(currentTransmission as Omit<Transmission, 'id'>);
    }
  };

  const columns: SettingsTableColumn<Transmission>[] = [
    { 
      header: "Nome", 
      accessor: "name" as keyof Transmission 
    },
    { 
      header: "Adeguamento Prezzo", 
      accessor: (transmission) => `€${transmission.priceAdjustment.toLocaleString('it-IT')}`,
      className: "text-right" 
    },
  ];

  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Tipi di Cambio</h2>
        <Button onClick={handleAddTransmission}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Cambio
        </Button>
      </div>
      
      <SettingsTable 
        data={transmissions} 
        columns={columns}
        onEdit={handleEditTransmission}
        onDelete={handleDeleteTransmission}
      />

      <FormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Aggiungi Cambio"
        onSubmit={handleSaveTransmission}
        isSubmitting={createMutation.isPending}
      >
        <TransmissionForm 
          transmission={currentTransmission}
          onChange={handleTransmissionChange}
        />
      </FormDialog>

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Modifica Cambio"
        onSubmit={handleSaveTransmission}
        isSubmitting={updateMutation.isPending}
      >
        <TransmissionForm 
          transmission={currentTransmission}
          onChange={handleTransmissionChange}
        />
      </FormDialog>
    </div>
  );
};

export default TransmissionsSettings;
