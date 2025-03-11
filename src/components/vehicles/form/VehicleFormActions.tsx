
import React from 'react';

interface VehicleFormActionsProps {
  onCancel: () => void;
}

const VehicleFormActions = ({ onCancel }: VehicleFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 pt-4">
      <button 
        type="button" 
        onClick={onCancel}
        className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
      >
        Annulla
      </button>
      <button 
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Aggiungi Veicolo
      </button>
    </div>
  );
};

export default VehicleFormActions;
