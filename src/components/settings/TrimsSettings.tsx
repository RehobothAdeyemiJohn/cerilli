
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trimsApi, modelsApi } from '@/api/localStorage';
import { VehicleTrim, VehicleModel } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const TrimsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTrim, setCurrentTrim] = useState<VehicleTrim | null>(null);
  const [newTrim, setNewTrim] = useState<Omit<VehicleTrim, 'id'>>({ name: '', basePrice: 0, compatibleModels: [] });
  
  const queryClient = useQueryClient();
  
  const { data: trims = [], isLoading: isTrimsLoading } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });
  
  const { data: models = [], isLoading: isModelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });
  
  const createMutation = useMutation({
    mutationFn: (trim: Omit<VehicleTrim, 'id'>) => trimsApi.create(trim),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trims'] });
      toast({
        title: "Allestimento Aggiunto",
        description: "L'allestimento è stato aggiunto con successo."
      });
      setIsAddDialogOpen(false);
      setNewTrim({ name: '', basePrice: 0, compatibleModels: [] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (trim: VehicleTrim) => trimsApi.update(trim.id, trim),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trims'] });
      toast({
        title: "Allestimento Aggiornato",
        description: "L'allestimento è stato aggiornato con successo."
      });
      setIsEditDialogOpen(false);
      setCurrentTrim(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => trimsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trims'] });
      toast({
        title: "Allestimento Eliminato",
        description: "L'allestimento è stato eliminato con successo."
      });
      setIsDeleteDialogOpen(false);
      setCurrentTrim(null);
    }
  });
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newTrim);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTrim) {
      updateMutation.mutate(currentTrim);
    }
  };
  
  const handleDeleteSubmit = () => {
    if (currentTrim) {
      deleteMutation.mutate(currentTrim.id);
    }
  };
  
  const openEditDialog = (trim: VehicleTrim) => {
    setCurrentTrim(trim);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (trim: VehicleTrim) => {
    setCurrentTrim(trim);
    setIsDeleteDialogOpen(true);
  };
  
  const toggleModelInNewTrim = (modelId: string) => {
    setNewTrim(prevTrim => {
      const compatibleModels = prevTrim.compatibleModels || [];
      if (compatibleModels.includes(modelId)) {
        return {
          ...prevTrim,
          compatibleModels: compatibleModels.filter(id => id !== modelId)
        };
      } else {
        return {
          ...prevTrim,
          compatibleModels: [...compatibleModels, modelId]
        };
      }
    });
  };
  
  const toggleModelInCurrentTrim = (modelId: string) => {
    setCurrentTrim(prevTrim => {
      if (!prevTrim) return null;
      
      const compatibleModels = prevTrim.compatibleModels || [];
      if (compatibleModels.includes(modelId)) {
        return {
          ...prevTrim,
          compatibleModels: compatibleModels.filter(id => id !== modelId)
        };
      } else {
        return {
          ...prevTrim,
          compatibleModels: [...compatibleModels, modelId]
        };
      }
    });
  };
  
  const getCompatibleModelsText = (trim: VehicleTrim) => {
    if (!trim.compatibleModels || trim.compatibleModels.length === 0) {
      return "Tutti i modelli";
    }
    
    return models
      .filter(model => trim.compatibleModels?.includes(model.id))
      .map(model => model.name)
      .join(", ");
  };
  
  if (isTrimsLoading || isModelsLoading) {
    return <div>Caricamento allestimenti...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Allestimenti</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Allestimento
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Prezzo Base (€)</TableHead>
            <TableHead>Compatibile con</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trims.map((trim) => (
            <TableRow key={trim.id}>
              <TableCell>{trim.name}</TableCell>
              <TableCell>{trim.basePrice.toLocaleString('it-IT')}</TableCell>
              <TableCell>{getCompatibleModelsText(trim)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(trim)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(trim)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {trims.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Nessun allestimento trovato</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Allestimento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={newTrim.name}
                    onChange={(e) => setNewTrim({...newTrim, name: e.target.value})}
                    placeholder="Es. Sport"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="basePrice" className="text-sm font-medium">Prezzo Base (€)</label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={newTrim.basePrice}
                    onChange={(e) => setNewTrim({...newTrim, basePrice: parseInt(e.target.value)})}
                    placeholder="Es. 2000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compatibile con Modelli</label>
                  <p className="text-xs text-gray-500 mb-2">Se non selezioni nessun modello, l'allestimento sarà compatibile con tutti i modelli.</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {models.map((model) => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`model-${model.id}`} 
                          checked={(newTrim.compatibleModels || []).includes(model.id)}
                          onCheckedChange={() => toggleModelInNewTrim(model.id)}
                        />
                        <label 
                          htmlFor={`model-${model.id}`}
                          className="text-sm"
                        >
                          {model.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Annulla</Button>
              </DialogClose>
              <Button type="submit">Salva</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Allestimento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="edit-name"
                    value={currentTrim?.name || ''}
                    onChange={(e) => setCurrentTrim(current => current ? {...current, name: e.target.value} : null)}
                    placeholder="Es. Sport"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-basePrice" className="text-sm font-medium">Prezzo Base (€)</label>
                  <Input
                    id="edit-basePrice"
                    type="number"
                    value={currentTrim?.basePrice || 0}
                    onChange={(e) => setCurrentTrim(current => current ? {...current, basePrice: parseInt(e.target.value)} : null)}
                    placeholder="Es. 2000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compatibile con Modelli</label>
                  <p className="text-xs text-gray-500 mb-2">Se non selezioni nessun modello, l'allestimento sarà compatibile con tutti i modelli.</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {models.map((model) => (
                      <div key={model.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`edit-model-${model.id}`} 
                          checked={(currentTrim?.compatibleModels || []).includes(model.id)}
                          onCheckedChange={() => toggleModelInCurrentTrim(model.id)}
                        />
                        <label 
                          htmlFor={`edit-model-${model.id}`}
                          className="text-sm"
                        >
                          {model.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Annulla</Button>
              </DialogClose>
              <Button type="submit">Aggiorna</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina Allestimento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare l'allestimento <strong>{currentTrim?.name}</strong>?</p>
            <p className="text-red-500 text-sm mt-2">Questa azione non può essere annullata.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Annulla</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteSubmit}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrimsSettings;
