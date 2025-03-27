
import { Accessory } from '@/types';
import { generateId } from './storageUtils';

const STORAGE_KEY = 'accessories';

const getAll = async (): Promise<Accessory[]> => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

const getById = async (id: string): Promise<Accessory> => {
  const accessories = await getAll();
  const accessory = accessories.find(a => a.id === id);
  if (!accessory) throw new Error(`Accessory with ID ${id} not found`);
  return accessory;
};

const getCompatible = async (modelId: string, trimId: string): Promise<Accessory[]> => {
  const accessories = await getAll();
  return accessories.filter(accessory => {
    const isModelCompatible = accessory.compatible_models.includes(modelId);
    const isTrimCompatible = !accessory.compatible_trims.length || accessory.compatible_trims.includes(trimId);
    return isModelCompatible && isTrimCompatible;
  });
};

const create = async (accessory: Omit<Accessory, 'id'>): Promise<Accessory> => {
  const accessories = await getAll();
  const newAccessory = { ...accessory, id: generateId() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...accessories, newAccessory]));
  return newAccessory;
};

const update = async (id: string, updates: Partial<Accessory>): Promise<Accessory> => {
  const accessories = await getAll();
  const index = accessories.findIndex(a => a.id === id);
  if (index === -1) throw new Error(`Accessory with ID ${id} not found`);
  
  const updatedAccessory = { ...accessories[index], ...updates };
  accessories[index] = updatedAccessory;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accessories));
  return updatedAccessory;
};

const remove = async (id: string): Promise<boolean> => {
  const accessories = await getAll();
  const filtered = accessories.filter(a => a.id !== id);
  if (filtered.length === accessories.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const accessoriesApi = {
  getAll,
  getById,
  getCompatible,
  create,
  update,
  delete: remove
};
