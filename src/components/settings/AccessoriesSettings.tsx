
import React, { useState } from 'react';
import { Accessory } from '@/types';
import { accessoriesApi } from '@/api/localStorage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Component for managing accessories settings
const AccessoriesSettings = () => {
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [newAccessory, setNewAccessory] = useState({
    name: '',
    priceWithVAT: 0,
    compatibleModels: [] as string[],
    compatibleTrims: [] as string[]
  });

  const queryClient = useQueryClient();

  const { data: accessories = [], isLoading } = useQuery({
    queryKey: ['accessories'],
    queryFn: accessoriesApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: (accessory: Omit<Accessory, 'id' | 'priceWithoutVAT'>) => {
      // Calculate priceWithoutVAT automatically
      const priceWithoutVAT = Math.round(accessory.priceWithVAT / 1.22);
      return accessoriesApi.create({
        ...accessory,
        priceWithoutVAT
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      setNewAccessory({
        name: '',
        priceWithVAT: 0,
        compatibleModels: [],
        compatibleTrims: []
      });
      toast({
        title: "Accessorio Aggiunto",
        description: "L'accessorio è stato aggiunto con successo."
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (accessory: Accessory) => {
      // Recalculate priceWithoutVAT when updating
      const priceWithoutVAT = Math.round(accessory.priceWithVAT / 1.22);
      return accessoriesApi.update(accessory.id, {
        ...accessory,
        priceWithoutVAT
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      setEditingAccessory(null);
      toast({
        title: "Accessorio Aggiornato",
        description: "L'accessorio è stato aggiornato con successo."
      });
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
    }
  });

  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newAccessory);
  };

  const handleUpdateAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccessory) {
      updateMutation.mutate(editingAccessory);
    }
  };

  const handleDeleteAccessory = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo accessorio?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (accessory: Accessory) => {
    setEditingAccessory(accessory);
  };

  const handleCancelEdit = () => {
    setEditingAccessory(null);
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestione Accessori</h2>
      
      {/* Add new accessory form */}
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-lg font-semibold mb-4">Aggiungi Nuovo Accessorio</h3>
        <form onSubmit={handleAddAccessory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={newAccessory.name}
                onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prezzo con IVA (€)
              </label>
              <input
                type="number"
                value={newAccessory.priceWithVAT}
                onChange={(e) => setNewAccessory({ ...newAccessory, priceWithVAT: Number(e.target.value) })}
                className="w-full p-2 border rounded-md"
                min="0"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelli Compatibili (ID separati da virgola, vuoto = tutti)
              </label>
              <input
                type="text"
                value={newAccessory.compatibleModels.join(',')}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  compatibleModels: e.target.value ? e.target.value.split(',') : [] 
                })}
                className="w-full p-2 border rounded-md"
                placeholder="1,2,3 (vuoto = tutti)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allestimenti Compatibili (ID separati da virgola, vuoto = tutti)
              </label>
              <input
                type="text"
                value={newAccessory.compatibleTrims.join(',')}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  compatibleTrims: e.target.value ? e.target.value.split(',') : [] 
                })}
                className="w-full p-2 border rounded-md"
                placeholder="1,2,3 (vuoto = tutti)"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Aggiungi Accessorio
            </button>
          </div>
        </form>
      </div>
      
      {/* Edit accessory form */}
      {editingAccessory && (
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-4">Modifica Accessorio</h3>
          <form onSubmit={handleUpdateAccessory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={editingAccessory.name}
                  onChange={(e) => setEditingAccessory({ ...editingAccessory, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prezzo con IVA (€)
                </label>
                <input
                  type="number"
                  value={editingAccessory.priceWithVAT}
                  onChange={(e) => setEditingAccessory({ ...editingAccessory, priceWithVAT: Number(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelli Compatibili (ID separati da virgola, vuoto = tutti)
                </label>
                <input
                  type="text"
                  value={editingAccessory.compatibleModels.join(',')}
                  onChange={(e) => setEditingAccessory({ 
                    ...editingAccessory, 
                    compatibleModels: e.target.value ? e.target.value.split(',') : [] 
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="1,2,3 (vuoto = tutti)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allestimenti Compatibili (ID separati da virgola, vuoto = tutti)
                </label>
                <input
                  type="text"
                  value={editingAccessory.compatibleTrims.join(',')}
                  onChange={(e) => setEditingAccessory({ 
                    ...editingAccessory, 
                    compatibleTrims: e.target.value ? e.target.value.split(',') : [] 
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="1,2,3 (vuoto = tutti)"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Aggiorna
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Accessories list */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prezzo con IVA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prezzo senza IVA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelli Compatibili
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allestimenti Compatibili
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accessories.map((accessory) => (
              <tr key={accessory.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accessory.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accessory.priceWithVAT.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accessory.priceWithoutVAT.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accessory.compatibleModels.length === 0 
                    ? "Tutti" 
                    : accessory.compatibleModels.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {accessory.compatibleTrims.length === 0 
                    ? "Tutti" 
                    : accessory.compatibleTrims.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(accessory)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDeleteAccessory(accessory.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessoriesSettings;
