
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transmissionsApi } from '@/api/localStorage';
import { Transmission } from '@/types';
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

const TransmissionsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTransmission, setCurrentTransmission] = useState<Transmission | null>(null);
  const [newTransmission, setNewTransmission] = useState({ name: '', priceAdjustment: 0 });
  
  const queryClient = useQueryClient();
  
  const { data: transmissions = [], isLoading } = useQuery({
    queryKey: ['transmissions'],
    queryFn: transmissionsApi.getAll
  });
  
  const createMutation = useMutation({
    mutationFn: (transmission: Omit<Transmission, 'id'>) => transmissionsApi.create(transmission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
      toast({
        title: "Cambio Aggiunto",
        description: "Il tipo di cambio è stato aggiunto con successo."
      });
      setIsAddDialogOpen(false);
      setNewTransmission({ name: '', priceAdjustment: 0 });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (transmission: Transmission) => transmissionsApi.update(transmission.id, transmission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
      toast({
        title: "Cambio Aggiornato",
        description: "Il tipo di cambio è stato aggiornato con successo."
      });
      setIsEditDialogOpen(false);
      setCurrentTransmission(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transmissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transmissions'] });
      toast({
        title: "Cambio Eliminato",
        description: "Il tipo di cambio è stato eliminato con successo."
      });
      setIsDeleteDialogOpen(false);
      setCurrentTransmission(null);
    }
  });
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newTransmission);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTransmission) {
      updateMutation.mutate(currentTransmission);
    }
  };
  
  const handleDeleteSubmit = () => {
    if (currentTransmission) {
      deleteMutation.mutate(currentTransmission.id);
    }
  };
  
  const openEditDialog = (transmission: Transmission) => {
    setCurrentTransmission(transmission);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (transmission: Transmission) => {
    setCurrentTransmission(transmission);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return <div>Caricamento tipi di cambio...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tipi di Cambio</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Cambio
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
          {transmissions.map((transmission) => (
            <TableRow key={transmission.id}>
              <TableCell>{transmission.name}</TableCell>
              <TableCell>{transmission.priceAdjustment.toLocaleString('it-IT')}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(transmission)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(transmission)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {transmissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center">Nessun tipo di cambio trovato</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Tipo di Cambio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={newTransmission.name}
                    onChange={(e) => setNewTransmission({...newTransmission, name: e.target.value})}
                    placeholder="Es. Manuale"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="priceAdjustment" className="text-sm font-medium">Variazione di Prezzo (€)</label>
                  <Input
                    id="priceAdjustment"
                    type="number"
                    value={newTransmission.priceAdjustment}
                    onChange={(e) => setNewTransmission({...newTransmission, priceAdjustment: parseInt(e.target.value)})}
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
            <DialogTitle>Modifica Tipo di Cambio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="edit-name"
                    value={currentTransmission?.name || ''}
                    onChange={(e) => setCurrentTransmission(current => current ? {...current, name: e.target.value} : null)}
                    placeholder="Es. Manuale"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-priceAdjustment" className="text-sm font-medium">Variazione di Prezzo (€)</label>
                  <Input
                    id="edit-priceAdjustment"
                    type="number"
                    value={currentTransmission?.priceAdjustment || 0}
                    onChange={(e) => setCurrentTransmission(current => current ? {...current, priceAdjustment: parseInt(e.target.value)} : null)}
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
            <DialogTitle>Elimina Tipo di Cambio</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare il tipo di cambio <strong>{currentTransmission?.name}</strong>?</p>
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

export default TransmissionsSettings;
