
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fuelTypesApi } from '@/api/localStorage';
import { FuelType } from '@/types';
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

const FuelTypesSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFuelType, setCurrentFuelType] = useState<FuelType | null>(null);
  const [newFuelType, setNewFuelType] = useState({ name: '', priceAdjustment: 0 });
  
  const queryClient = useQueryClient();
  
  const { data: fuelTypes = [], isLoading } = useQuery({
    queryKey: ['fuelTypes'],
    queryFn: fuelTypesApi.getAll
  });
  
  const createMutation = useMutation({
    mutationFn: (fuelType: Omit<FuelType, 'id'>) => fuelTypesApi.create(fuelType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelTypes'] });
      toast({
        title: "Tipo di Alimentazione Aggiunto",
        description: "Il tipo di alimentazione è stato aggiunto con successo."
      });
      setIsAddDialogOpen(false);
      setNewFuelType({ name: '', priceAdjustment: 0 });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (fuelType: FuelType) => fuelTypesApi.update(fuelType.id, fuelType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelTypes'] });
      toast({
        title: "Tipo di Alimentazione Aggiornato",
        description: "Il tipo di alimentazione è stato aggiornato con successo."
      });
      setIsEditDialogOpen(false);
      setCurrentFuelType(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fuelTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelTypes'] });
      toast({
        title: "Tipo di Alimentazione Eliminato",
        description: "Il tipo di alimentazione è stato eliminato con successo."
      });
      setIsDeleteDialogOpen(false);
      setCurrentFuelType(null);
    }
  });
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newFuelType);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFuelType) {
      updateMutation.mutate(currentFuelType);
    }
  };
  
  const handleDeleteSubmit = () => {
    if (currentFuelType) {
      deleteMutation.mutate(currentFuelType.id);
    }
  };
  
  const openEditDialog = (fuelType: FuelType) => {
    setCurrentFuelType(fuelType);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (fuelType: FuelType) => {
    setCurrentFuelType(fuelType);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return <div>Caricamento tipi di alimentazione...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tipi di Alimentazione</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Alimentazione
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Variazione di Prezzo (€)</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fuelTypes.map((fuelType) => (
            <TableRow key={fuelType.id}>
              <TableCell>{fuelType.name}</TableCell>
              <TableCell>{fuelType.priceAdjustment.toLocaleString('it-IT')}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(fuelType)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(fuelType)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {fuelTypes.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center">Nessun tipo di alimentazione trovato</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Tipo di Alimentazione</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={newFuelType.name}
                    onChange={(e) => setNewFuelType({...newFuelType, name: e.target.value})}
                    placeholder="Es. Benzina"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="priceAdjustment" className="text-sm font-medium">Variazione di Prezzo (€)</label>
                  <Input
                    id="priceAdjustment"
                    type="number"
                    value={newFuelType.priceAdjustment}
                    onChange={(e) => setNewFuelType({...newFuelType, priceAdjustment: parseInt(e.target.value)})}
                    placeholder="Es. 1500"
                  />
                  <p className="text-xs text-gray-500">Inserisci 0 se non c'è variazione di prezzo rispetto al prezzo base.</p>
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
            <DialogTitle>Modifica Tipo di Alimentazione</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="edit-name"
                    value={currentFuelType?.name || ''}
                    onChange={(e) => setCurrentFuelType(current => current ? {...current, name: e.target.value} : null)}
                    placeholder="Es. Benzina"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-priceAdjustment" className="text-sm font-medium">Variazione di Prezzo (€)</label>
                  <Input
                    id="edit-priceAdjustment"
                    type="number"
                    value={currentFuelType?.priceAdjustment || 0}
                    onChange={(e) => setCurrentFuelType(current => current ? {...current, priceAdjustment: parseInt(e.target.value)} : null)}
                    placeholder="Es. 1500"
                  />
                  <p className="text-xs text-gray-500">Inserisci 0 se non c'è variazione di prezzo rispetto al prezzo base.</p>
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
            <DialogTitle>Elimina Tipo di Alimentazione</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare il tipo di alimentazione <strong>{currentFuelType?.name}</strong>?</p>
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

export default FuelTypesSettings;
