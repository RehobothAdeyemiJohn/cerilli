
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accessoriesApi, modelsApi, trimsApi } from '@/api/localStorage';
import { Accessory, VehicleModel, VehicleTrim } from '@/types';
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

const AccessoriesSettings = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAccessory, setCurrentAccessory] = useState<Accessory | null>(null);
  const [newAccessory, setNewAccessory] = useState<Omit<Accessory, 'id' | 'priceWithoutVAT'>>({ 
    name: '', 
    priceWithVAT: 0, 
    compatibleModels: [],
    compatibleTrims: []
  });
  
  const queryClient = useQueryClient();
  
  const { data: accessories = [], isLoading: isAccessoriesLoading } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });
  
  const { data: models = [], isLoading: isModelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: modelsApi.getAll
  });
  
  const { data: trims = [], isLoading: isTrimsLoading } = useQuery({
    queryKey: ['trims'],
    queryFn: trimsApi.getAll
  });
  
  const createMutation = useMutation({
    mutationFn: (accessory: Omit<Accessory, 'id' | 'priceWithoutVAT'>) => accessoriesApi.create(accessory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast({
        title: "Accessorio Aggiunto",
        description: "L'accessorio è stato aggiunto con successo."
      });
      setIsAddDialogOpen(false);
      setNewAccessory({ name: '', priceWithVAT: 0, compatibleModels: [], compatibleTrims: [] });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: (accessory: Accessory) => accessoriesApi.update(accessory.id, accessory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast({
        title: "Accessorio Aggiornato",
        description: "L'accessorio è stato aggiornato con successo."
      });
      setIsEditDialogOpen(false);
      setCurrentAccessory(null);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => accessoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      toast({
        title: "Accessorio Eliminato",
        description: "L'accessorio è stato eliminato con successo."
      });
      setIsDeleteDialogOpen(false);
      setCurrentAccessory(null);
    }
  });
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newAccessory);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAccessory) {
      updateMutation.mutate(currentAccessory);
    }
  };
  
  const handleDeleteSubmit = () => {
    if (currentAccessory) {
      deleteMutation.mutate(currentAccessory.id);
    }
  };
  
  const openEditDialog = (accessory: Accessory) => {
    setCurrentAccessory(accessory);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (accessory: Accessory) => {
    setCurrentAccessory(accessory);
    setIsDeleteDialogOpen(true);
  };
  
  const toggleModelInNewAccessory = (modelId: string) => {
    setNewAccessory(prevAccessory => {
      const compatibleModels = prevAccessory.compatibleModels || [];
      if (compatibleModels.includes(modelId)) {
        return {
          ...prevAccessory,
          compatibleModels: compatibleModels.filter(id => id !== modelId)
        };
      } else {
        return {
          ...prevAccessory,
          compatibleModels: [...compatibleModels, modelId]
        };
      }
    });
  };
  
  const toggleTrimInNewAccessory = (trimId: string) => {
    setNewAccessory(prevAccessory => {
      const compatibleTrims = prevAccessory.compatibleTrims || [];
      if (compatibleTrims.includes(trimId)) {
        return {
          ...prevAccessory,
          compatibleTrims: compatibleTrims.filter(id => id !== trimId)
        };
      } else {
        return {
          ...prevAccessory,
          compatibleTrims: [...compatibleTrims, trimId]
        };
      }
    });
  };
  
  const toggleModelInCurrentAccessory = (modelId: string) => {
    setCurrentAccessory(prevAccessory => {
      if (!prevAccessory) return null;
      
      const compatibleModels = prevAccessory.compatibleModels || [];
      if (compatibleModels.includes(modelId)) {
        return {
          ...prevAccessory,
          compatibleModels: compatibleModels.filter(id => id !== modelId)
        };
      } else {
        return {
          ...prevAccessory,
          compatibleModels: [...compatibleModels, modelId]
        };
      }
    });
  };
  
  const toggleTrimInCurrentAccessory = (trimId: string) => {
    setCurrentAccessory(prevAccessory => {
      if (!prevAccessory) return null;
      
      const compatibleTrims = prevAccessory.compatibleTrims || [];
      if (compatibleTrims.includes(trimId)) {
        return {
          ...prevAccessory,
          compatibleTrims: compatibleTrims.filter(id => id !== trimId)
        };
      } else {
        return {
          ...prevAccessory,
          compatibleTrims: [...compatibleTrims, trimId]
        };
      }
    });
  };
  
  const getCompatibilityText = (accessory: Accessory) => {
    let modelText = "Tutti i modelli";
    let trimText = "Tutti gli allestimenti";
    
    if (accessory.compatibleModels.length > 0) {
      modelText = models
        .filter(model => accessory.compatibleModels.includes(model.id))
        .map(model => model.name)
        .join(", ");
    }
    
    if (accessory.compatibleTrims.length > 0) {
      trimText = trims
        .filter(trim => accessory.compatibleTrims.includes(trim.id))
        .map(trim => trim.name)
        .join(", ");
    }
    
    return `Modelli: ${modelText}. Allestimenti: ${trimText}`;
  };
  
  if (isAccessoriesLoading || isModelsLoading || isTrimsLoading) {
    return <div>Caricamento accessori...</div>;
  }
  
  // Calculate price without VAT for display purposes
  const calculatePriceWithoutVAT = (priceWithVAT: number) => {
    return Math.round(priceWithVAT / 1.22);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Accessori</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Accessorio
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Prezzo IVA incl. (€)</TableHead>
            <TableHead>Prezzo IVA escl. (€)</TableHead>
            <TableHead>Compatibilità</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accessories.map((accessory) => (
            <TableRow key={accessory.id}>
              <TableCell>{accessory.name}</TableCell>
              <TableCell>{accessory.priceWithVAT.toLocaleString('it-IT')}</TableCell>
              <TableCell>{accessory.priceWithoutVAT.toLocaleString('it-IT')}</TableCell>
              <TableCell className="max-w-xs truncate" title={getCompatibilityText(accessory)}>
                {getCompatibilityText(accessory)}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(accessory)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(accessory)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {accessories.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">Nessun accessorio trovato</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aggiungi Accessorio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="name"
                    value={newAccessory.name}
                    onChange={(e) => setNewAccessory({...newAccessory, name: e.target.value})}
                    placeholder="Es. Vetri Privacy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="priceWithVAT" className="text-sm font-medium">Prezzo IVA inclusa (€)</label>
                  <Input
                    id="priceWithVAT"
                    type="number"
                    value={newAccessory.priceWithVAT}
                    onChange={(e) => setNewAccessory({...newAccessory, priceWithVAT: parseInt(e.target.value)})}
                    placeholder="Es. 200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prezzo IVA esclusa (€)</label>
                  <Input
                    type="number"
                    value={calculatePriceWithoutVAT(newAccessory.priceWithVAT)}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Calcolato automaticamente (IVA al 22%)</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compatibile con Modelli</label>
                    <p className="text-xs text-gray-500 mb-2">Se non selezioni nessun modello, l'accessorio sarà compatibile con tutti i modelli.</p>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 border rounded-md p-2">
                      {models.map((model) => (
                        <div key={model.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`model-${model.id}`} 
                            checked={(newAccessory.compatibleModels || []).includes(model.id)}
                            onCheckedChange={() => toggleModelInNewAccessory(model.id)}
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
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compatibile con Allestimenti</label>
                    <p className="text-xs text-gray-500 mb-2">Se non selezioni nessun allestimento, l'accessorio sarà compatibile con tutti gli allestimenti.</p>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 border rounded-md p-2">
                      {trims.map((trim) => (
                        <div key={trim.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`trim-${trim.id}`} 
                            checked={(newAccessory.compatibleTrims || []).includes(trim.id)}
                            onCheckedChange={() => toggleTrimInNewAccessory(trim.id)}
                          />
                          <label 
                            htmlFor={`trim-${trim.id}`}
                            className="text-sm"
                          >
                            {trim.name}
                          </label>
                        </div>
                      ))}
                    </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica Accessorio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Nome</label>
                  <Input
                    id="edit-name"
                    value={currentAccessory?.name || ''}
                    onChange={(e) => setCurrentAccessory(current => current ? {...current, name: e.target.value} : null)}
                    placeholder="Es. Vetri Privacy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-priceWithVAT" className="text-sm font-medium">Prezzo IVA inclusa (€)</label>
                  <Input
                    id="edit-priceWithVAT"
                    type="number"
                    value={currentAccessory?.priceWithVAT || 0}
                    onChange={(e) => {
                      const priceWithVAT = parseInt(e.target.value);
                      setCurrentAccessory(current => current ? {
                        ...current, 
                        priceWithVAT,
                        // We'll update this in the API, but for UI display purposes:
                        priceWithoutVAT: calculatePriceWithoutVAT(priceWithVAT)
                      } : null);
                    }}
                    placeholder="Es. 200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prezzo IVA esclusa (€)</label>
                  <Input
                    type="number"
                    value={currentAccessory?.priceWithoutVAT || 0}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Calcolato automaticamente (IVA al 22%)</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compatibile con Modelli</label>
                    <p className="text-xs text-gray-500 mb-2">Se non selezioni nessun modello, l'accessorio sarà compatibile con tutti i modelli.</p>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 border rounded-md p-2">
                      {models.map((model) => (
                        <div key={model.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-model-${model.id}`} 
                            checked={(currentAccessory?.compatibleModels || []).includes(model.id)}
                            onCheckedChange={() => toggleModelInCurrentAccessory(model.id)}
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
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compatibile con Allestimenti</label>
                    <p className="text-xs text-gray-500 mb-2">Se non selezioni nessun allestimento, l'accessorio sarà compatibile con tutti gli allestimenti.</p>
                    <div className="max-h-40 overflow-y-auto pr-2 space-y-2 border rounded-md p-2">
                      {trims.map((trim) => (
                        <div key={trim.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-trim-${trim.id}`} 
                            checked={(currentAccessory?.compatibleTrims || []).includes(trim.id)}
                            onCheckedChange={() => toggleTrimInCurrentAccessory(trim.id)}
                          />
                          <label 
                            htmlFor={`edit-trim-${trim.id}`}
                            className="text-sm"
                          >
                            {trim.name}
                          </label>
                        </div>
                      ))}
                    </div>
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
            <DialogTitle>Elimina Accessorio</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare l'accessorio <strong>{currentAccessory?.name}</strong>?</p>
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

export default AccessoriesSettings;
