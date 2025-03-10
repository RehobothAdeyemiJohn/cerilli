
import React from 'react';
import { Plus, Filter, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface InventoryHeaderProps {
  onToggleFilters: () => void;
  showFilters: boolean;
  onAddVehicle: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  onToggleFilters,
  showFilters,
  onAddVehicle,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h1 className="text-2xl font-bold">Inventario Veicoli</h1>
      <div className="flex gap-4 mt-4 md:mt-0">
        <Button 
          variant="outline"
          asChild
        >
          <Link to="/settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Impostazioni
          </Link>
        </Button>
        
        <button 
          onClick={onToggleFilters}
          className="md:hidden flex items-center px-4 py-2 border border-gray-200 rounded-md"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Nascondi Filtri' : 'Mostra Filtri'}
        </button>
        
        <button 
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md"
          onClick={onAddVehicle}
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Veicolo
        </button>
      </div>
    </div>
  );
};

export default InventoryHeader;
