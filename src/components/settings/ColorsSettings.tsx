
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colorsApi } from '@/api/localStorage';
import { ExteriorColor } from '@/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ColorsSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<ExteriorColor | null>(null);
  const [newColor, setNewColor] = useState<Omit<ExteriorColor, 'id'>>({ 
    name: '', 
    type: 'metallizzato', 
    priceAdjustment: 0 
  });
  
  const queryClient = useQueryClient();
  
  const { data: colors = [], isLoading } = useQuery({
    queryKey: ['colors'],
    queryFn: colorsApi.getAll
  });
  
  const createMutation = useMutation({
    mutationFn: (color: Omit<ExteriorColor, 'id'>) => colorsApi.create(color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast({
        title: "Colore Aggiunto",
        description: "Il colore è stato aggiunto con successo."
      });
      setIsAddDialogOpen(false);
      setNewColor({ name: '', type: 'metallizzato', priceAdjustment: 0 });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (color: ExteriorColor) => colorsApi.update(color.id, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast({
        title: "Colore Aggiornato",
        description: "Il colore è stato aggiornato con successo."
      });
      setIsEditDialogOpen(false);
      setCurrentColor(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => colorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
      toast({
        title: "Colore Eliminato",
        description: "Il colore è stato eliminato con successo."
      });
      setIsDeleteDialogOpen(false);
      setCurrentColor(null);
    }
  });
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newColor);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentColor) {
      updateMutation.mutate(currentColor);
    }
  };
  
  const handleDeleteSubmit = () => {
    if (currentColor) {
      deleteMutation.mutate(currentColor.id);
    }
  };
  
  const openEditDialog = (color: ExteriorColor) => {
    setCurrentColor(color);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (color: ExteriorColor) => {
    setCurrentColor(color);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return <div>Caricamento colori...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Colori</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Colore
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Variazione di Prezzo (€)</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((color) => (
            <TableRow key={color.id}>
              <TableCell>{color.name}</TableCell>
              <TableCell>{color.type}</TableCell>
              <TableCell>{color.priceAdjustment.toLocaleString('it-IT')}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(color)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(color)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {colors.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Nessun colore trovato</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Colore</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={newColor.name}
                    onChange={(e) => setNewColor({...newColor, name: e.target.value})}
                    placeholder="Es. Pure Ice"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">Tipo</label>
                  <Select
                    value={newColor.type}
                    onValueChange={(value) => setNewColor({...newColor, type: value})}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metallizzato">Metallizzato</SelectItem>
                      <SelectItem value="pastello">Pastello</SelectItem>
                      <SelectItem value="perlato">Perlato</SelectItem>
                      <SelectItem value="matte">Matte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="priceAdjustment" className="text-sm font-medium">Variazione di Prezzo (€)</label>
                  <Input
                    id="priceAdjustment"
                    type="number"
                    value={newColor.priceAdjustment}
                    onChange={(e) => setNewColor({...newColor, priceAdjustment: parseInt(e.target.value)})}
                    placeholder="Es. 800"
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
            <DialogTitle>Modifica Colore</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="edit-name"
                    value={currentColor?.name || ''}
                    onChange={(e) => setCurrentColor(current => current ? {...current, name: e.target.value} : null)}
                    placeholder="Es. Pure Ice"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-type" className="text-sm font-medium">Tipo</label>
                  <Select
                    value={currentColor?.type || 'metallizzato'}
                    onValueChange={(value) => setCurrentColor(current => current ? {...current, type: value} : null)}
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metallizzato">Metallizzato</SelectItem>
                      <SelectItem value="pastello">Pastello</SelectItem>
                      <SelectItem value="perlato">Perlato</SelectItem>
                      <SelectItem value="matte">Matte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-priceAdjustment" className="text-sm font-medium">Variazione di Prezzo (€)</label>
                  <Input
                    id="edit-priceAdjustment"
                    type="number"
                    value={currentColor?.priceAdjustment || 0}
                    onChange={(e) => setCurrentColor(current => current ? {...current, priceAdjustment: parseInt(e.target.value)} : null)}
                    placeholder="Es. 800"
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
            <DialogTitle>Elimina Colore</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare il colore <strong>{currentColor?.name}</strong>?</p>
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

export default ColorsSettings;
