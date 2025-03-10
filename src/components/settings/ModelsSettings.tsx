
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsApi } from '@/api/localStorage';
import { VehicleModel } from '@/types';
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

const ModelsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<VehicleModel | null>(null);
  const [newModel, setNewModel] = useState({ name: '', basePrice: 0 });
  
  const queryClient = useQueryClient();
  
  const { data: models = [], isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });
  
  const createMutation = useMutation({
    mutationFn: (model: Omit<VehicleModel, 'id'>) => modelsApi.create(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Aggiunto",
        description: "Il modello è stato aggiunto con successo."
      });
      setIsAddDialogOpen(false);
      setNewModel({ name: '', basePrice: 0 });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (model: VehicleModel) => modelsApi.update(model.id, model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Aggiornato",
        description: "Il modello è stato aggiornato con successo."
      });
      setIsEditDialogOpen(false);
      setCurrentModel(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => modelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modello Eliminato",
        description: "Il modello è stato eliminato con successo."
      });
      setIsDeleteDialogOpen(false);
      setCurrentModel(null);
    }
  });
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newModel);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentModel) {
      updateMutation.mutate(currentModel);
    }
  };
  
  const handleDeleteSubmit = () => {
    if (currentModel) {
      deleteMutation.mutate(currentModel.id);
    }
  };
  
  const openEditDialog = (model: VehicleModel) => {
    setCurrentModel(model);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (model: VehicleModel) => {
    setCurrentModel(model);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return <div>Caricamento modelli...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Modelli</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Modello
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Prezzo Base (€)</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.id}>
              <TableCell>{model.name}</TableCell>
              <TableCell>{model.basePrice.toLocaleString('it-IT')}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(model)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(model)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {models.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center">Nessun modello trovato</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Modello</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={newModel.name}
                    onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                    placeholder="Es. Cirelli 500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="basePrice" className="text-sm font-medium">Prezzo Base (€)</label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={newModel.basePrice}
                    onChange={(e) => setNewModel({...newModel, basePrice: parseInt(e.target.value)})}
                    placeholder="Es. 20000"
                    required
                  />
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
            <DialogTitle>Modifica Modello</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="edit-name"
                    value={currentModel?.name || ''}
                    onChange={(e) => setCurrentModel(current => current ? {...current, name: e.target.value} : null)}
                    placeholder="Es. Cirelli 500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-basePrice" className="text-sm font-medium">Prezzo Base (€)</label>
                  <Input
                    id="edit-basePrice"
                    type="number"
                    value={currentModel?.basePrice || 0}
                    onChange={(e) => setCurrentModel(current => current ? {...current, basePrice: parseInt(e.target.value)} : null)}
                    placeholder="Es. 20000"
                    required
                  />
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
            <DialogTitle>Elimina Modello</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare il modello <strong>{currentModel?.name}</strong>?</p>
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

export default ModelsSettings;
